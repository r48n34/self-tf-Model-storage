// react code version and references by 

/*
    Step to run yolov5 model on your website (no server needed)
    Thanks https://github.com/zldrobit/tfjs-yolov5-example for references

    1. Train your model with yolov5

    2. Save your best.pt weights to your pc

    3. git the yolov5 to your pc if you have not done yet
    - git clone https://github.com/ultralytics/yolov5

    4. Run below comment in the yolov5 folder to export a tfjs model
    - python export.py --weights <your weights.pt file> --include tfjs
    e.g. python export.py --weights best.pt --include tfjs

    5. At that point, you will have a folder holding the model.json and other weights files

    6. Open a repository in github (NOT gitlab, is github), git push your folder to that repository

    7. Your jsdelivr link should be like this
    -  https://cdn.jsdelivr.net/gh/<your username>/<your respo>/<your model folder>/model.json

    8. Change the modelUrlPath, imgSize, label by your own data

    8. Done

*/

// model variables
let model;

// webCam
const video = document.querySelector('video');

// webCam display
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

// debugMessage
const debugMessage = document.getElementById("debugMessage")
console.log("Width:", window.innerWidth)
console.log("Height:", window.innerHeight)

// stats library
const stats = new Stats();

const imgSize = 224
const modelUrlPath = 'https://cdn.jsdelivr.net/gh/r48n34/self-tf-Model-storage/5Classv3Graph/model.json'

const [divNum , subNum] = [1,0] // [0:255]
// const [divNum , subNum] = [255,0] // [0:1]
// const [divNum , subNum] = [127.5,1] // [0:1]

const labels = ['bird', 'cat', 'dog', 'fish', 'lion']

async function getMedia() {
    let stream = null;

    let constraints = window.constraints = {
        audio: false,
        video: {
            facingMode: "environment" 
        }
    };
  
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log(stream)

      window.stream = stream
      video.srcObject = stream

    } catch(err) {
        console.log(err);
    }
}


// creata load model and active cameras
async function loadModel(){

    model = await tf.loadGraphModel(modelUrlPath);

    // Set up canvas w and h
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    predictModel();

    const capBtn = document.getElementById("capBtn");

    capBtn.addEventListener("click", async () => {

        let imgURL = canvas.toDataURL("image/png");

        let dlLink = document.createElement('a');
        dlLink.download = "fileName";
        dlLink.href = imgURL;
        dlLink.dataset.downloadurl = ["image/png", dlLink.download, dlLink.href].join(':');

        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
        
    })

}

video.addEventListener('loadeddata', async () => {
    console.log('Yay!');
    loadModel();
});

window.onload = async () => {
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );

    getMedia();
}

var requestAnimationFrameCross = window.webkitRequestAnimationFrame ||
        window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame || window.msRequestAnimationFrame;

async function predictModel(){
    
    stats.begin();

    // Prevent memory leaks by using tidy 
    let imgPre = await tf.tidy(() => {
        return tf.browser.fromPixels(video)
                .resizeNearestNeighbor([imgSize, imgSize])
                .toFloat()
                .div(tf.scalar(divNum)) 
                .sub(tf.scalar(subNum))
                .expandDims();
    });
    
    const result = await model.predict(imgPre).data();

    await tf.dispose(imgPre); // clear memory

    let ind = result.indexOf(Math.max(...result));
    //console.log("MyModel predicted:", labels[ind]); // top labels
    //console.log("Possibility:", result[ind] * 100); // top leabels possible

    ctx.drawImage(video, 0, 0);

    // Draw the top color box
    ctx.fillStyle = "#00FFFF";
    ctx.fillRect(0, 0, 1000, 30);
    
    // Draw the text last to ensure it's on top. (draw label)
    const font = "22px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.fillStyle = "#000000";
    ctx.fillText(`${labels[ind]} : ${result[ind] * 100}%`, 20, 8); 

    stats.end();
    requestAnimationFrameCross(predictModel);        
}
