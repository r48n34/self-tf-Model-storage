import Discord from 'discord.js';
import dotenv from 'dotenv';

import canvas from 'canvas';
const { createCanvas, loadImage } = canvas;

import '@tensorflow/tfjs';
import toxicity from '@tensorflow-models/toxicity'
import cocoSsd from '@tensorflow-models/coco-ssd';
import mobilenet from '@tensorflow-models/mobilenet';

dotenv.config();

// Remember toccreate a .env for botUID

const bot = new Discord.Client();
const prefix = "&";

let model;
let modelSSD;
let modelMobile;

// Load in model
async function modelInit(){

  console.log("Loading model...")
  model = await toxicity.load(0.8); // 0.8 = threshold
  modelSSD = await cocoSsd.load();
  modelMobile = await mobilenet.load();
  console.log("Done")

  bot.login(process.env.botUID);

}

modelInit();

bot.on('ready', async () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});


bot.on('message', async msg => {
  
  
  if(msg.content.startsWith(prefix + 'whatS')){
    imgRec(msg, "ssd");   
  }
  else if(msg.content.startsWith(prefix + 'whatM')){ 
    imgRec(msg, "mobile");   
  }
  else if(msg.content.startsWith(prefix + 'helpMe')){ 
    msg.channel.send("whatS = cocoSSD, whatM = moiblenetv1");  
  }

  async function imgRec(msg, method){

    let att = (msg.attachments)

    if(att.array().length > 0){

      const canvas = createCanvas(att.array()[0].width, att.array()[0].height)
      const ctx = canvas.getContext('2d')

      // load in the imahe from discord url
      const img = await loadImage(att.array()[0].url)
      ctx.drawImage(img,0,0)

      // Predicting using cocoSSD
      const imgPred = method == "ssd" ? await modelSSD.detect(canvas) : await modelMobile.classify(canvas);
 
      if(method == "mobile"){
        console.log(imgPred)
        msg.channel.send(`Is this a ${imgPred[0].className}? (Prob = ${(imgPred[0].probability * 100).toFixed(2)})%`)
        return;
      }

      //Draw box
      ctx.font = '20px Arial';
      const color = ["blue", "yellow", "red"]

      for (let i = 0; i < imgPred.length; i++) {
        ctx.beginPath();
    
        ctx.rect(...imgPred[i].bbox);
        ctx.lineWidth = 5;
        ctx.strokeStyle = ctx.fillStyle = color[i % 3];
        ctx.stroke();

        ctx.fillText(
          imgPred[i].score.toFixed(3) + ' ' + imgPred[i].class, imgPred[i].bbox[0], imgPred[i].bbox[1] + 10
        );
      }

      //Return label and boxes
      if(imgPred.length >= 1){ //found
        let sendStr = "Is that a "

        for(let i = 0; i < imgPred.length; i++){
          sendStr += `${imgPred[i].class}? (Prob = ${(imgPred[i].score * 100).toFixed(2)}%) `
          i + 1 != imgPred.length && (sendStr += " and ")
        }
        
        msg.channel.send(sendStr, { 
          files: [{
            attachment: canvas.toBuffer(),
            name: 'imageReg.jpg'
          }] 
        })

      }
      else{ // Not found
        msg.channel.send("Sorry, can't find the regarding label.")
      }

    }

  }
  
  // Text type checker
  console.log(msg.content);
  
  let predictions = await model.classify([msg.content]);
  let voilate = []

  for(let i of predictions){

    if(i.results[0].match){
      console.log(i.label)
      voilate.push(i.label)      
    }

  }

  voilate.length > 0 && msg.channel.send( `You have violate the ${voilate.join(", ")}!!` )


});
