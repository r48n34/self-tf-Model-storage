import open from 'open';
import Discord from 'discord.js';

import {jsonWriteFile, initArray, Pair} from './words.js'
import dotenv from 'dotenv';

import canvas from 'canvas';
const { createCanvas, loadImage } = canvas;

import '@tensorflow/tfjs';
import toxicity from '@tensorflow-models/toxicity'
import cocoSsd from '@tensorflow-models/coco-ssd';
import mobilenet from '@tensorflow-models/mobilenet';

dotenv.config();

let wordPairArr = initArray(); // array for message pair

const bot = new Discord.Client();
const prefix = "&";
const myId = process.env.myId;
const botId = process.env.botId;

let model;
let modelSSD;
let modelMobile;


modelInit();

// Load in model
async function modelInit(){

  console.log("Loading model...")
  model = await toxicity.load(0.8); // 0.8 = threshold
  modelSSD = await cocoSsd.load();
  modelMobile = await mobilenet.load();
  console.log("Done")

  bot.login(process.env.botUID);

}

bot.on('ready', async () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

// Open page function
function pageOpen(msg){
  const message = "HA, you are not my master.";
  if(msg.author.id == myId){
    message = "done";
    let arg = msg.content.split(" ");
    open(arg[1]); // open that url in google chrome 
  }
  msg.channel.send(message); 
}

// Helper get string
function getString(arg){
  let longStr = "";

  for(let i = 2; i < arg.length; i++){ // add afterwards word
    longStr +=  i + 1 == arg.length ? arg[i] : arg[i] + " ";
  }

  return longStr;
}

bot.on('message', async msg => {
  
  let sayCond = wordPairArr.find( v => v.key === msg.content);

  // Join or leave the chat room
  async function chatInOut(msg, toIn){ // message, bool (T = in, F = out) 

    if (msg.member.voiceChannelID) {
      const channel = await bot.channels.get(msg.member.voiceChannelID);     
      toIn ? channel.join(): channel.leave();
    }
  
  }

  // play music
  async function playMusic(msg){
  
    if (msg.member.voiceChannelID) {
      let arg = msg.content.split(" ");
  
      const channelNew = await bot.channels.get(msg.member.voiceChannelID);
      const connection = await channelNew.join();
      connection.playFile('./music/' + arg[1]);
  
    }
  
  }


  // Add message to json file
  function addMessage(msg){
  
    const arg = msg.content.split(" "); // [1] = key, [n] = value
    const longStr = getString(arg);
    const found = wordPairArr.find( v => v.key === arg[1]); // Dup word on array

    if(found){
      msg.channel.send("word existed.");
      return;
    }
    
    // have args 1 and longStr exist
    if(arg[1] && longStr){
 
      wordPairArr.push(new Pair(arg[1], longStr));
      jsonWriteFile(wordPairArr);
      msg.channel.send("Text added");

    }
  
  }

  // Adjust message to json file
  async function adjustMessage(msg){
  
    const arg = msg.content.split(" ");
    const longStr = getString(arg);

    console.log(longStr);

    const found = wordPairArr.findIndex( v => v.key === arg[1]); // Dup word on array with index

    if(found >= 0 && longStr){
      wordPairArr[found].value = longStr;
      jsonWriteFile(wordPairArr);
      msg.channel.send("Text adjusted");
      return;
    }

    msg.channel.send("Font word don't existed or invalid arguments");
    return;
  
  }

  // Read comments from clients line //
  if( sayCond ){

    try{
      if(msg.author.id == botId){
        return;
      }
      msg.channel.send( sayCond.value ); // Normal send
      
    }
    catch(err){
      console.log(err);
    }
    
  }
  else if (msg.content.startsWith(prefix + 'open')) { // &open
    pageOpen(msg);   
  }
  else if(msg.content.startsWith(prefix + 'come')){ // &come
    chatInOut(msg, true);
  }
  else if(msg.content.startsWith(prefix + 'leave')){ // &leave
    chatInOut(msg, false); 
  }
  else if(msg.content.startsWith(prefix + 'play')){ // &play xxx.mp3
    playMusic(msg);  
  }
  else if(msg.content.startsWith(prefix + 'add')){ //&add key Message...
    addMessage(msg);   
  }
  else if(msg.content.startsWith(prefix + 'adjust')){ 
    adjustMessage(msg);   
  }
  else if(msg.content.startsWith(prefix + 'whatS')){
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
    //console.log(att)

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

