// react code version and references by 
// https://github.com/zldrobit/tfjs-yolov5-example/blob/main/src/index.js
// thanks 
// with ( python export.py --weights yolov5s.pt --include tfjs )

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

const imgSize = 640
const modelUrlPath = 'https://cdn.jsdelivr.net/gh/r48n34/self-tf-Model-storage/yolov5s_web_model/model.json'

const labels = ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light',
               'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow',
               'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
               'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard',
               'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
               'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
               'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
               'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear',
               'hair drier', 'toothbrush']



var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

async function getMedia() {
    let stream = null;

    var constraints = window.constraints = {
        audio: false,
        video: {
            facingMode: "environment" 
        }
    };

    //let res = await navigator.mediaDevices.enumerateDevices();
  
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log(stream)

      window.stream = stream
      video.srcObject = stream

    } catch(err) {
        console.log(err);
    }
}

window.onload = async () => {
    await tf.ENV.set('WEBGL_PACK_DEPTHWISECONV', 'false');
    getMedia();
}


// creata load model and active cameras
async function loadModel(){

    model = await tf.loadGraphModel(modelUrlPath)

    // Set up canvas w and h
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    predictModel();

    const capBtn = document.getElementById("capBtn");

    capBtn.addEventListener("click", async()=>{

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

var requestAnimationFrameCross = window.webkitRequestAnimationFrame ||
        window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame || window.msRequestAnimationFrame;

async function predictModel(){
    
    stats.begin();

    let imgPre = await tf.tidy(() => { 
        return tf.browser.fromPixels(video)
            .resizeNearestNeighbor([imgSize, imgSize])
            .toFloat()
            .div(tf.scalar(255.0)) 
            .expandDims();
    });
    
    // img , maxNumBoxes, minScore
    const result = await model.executeAsync(imgPre);

    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";

    const [boxes, scores, classes, valid_detections] = result;
    const boxes_data = boxes.dataSync();
    const scores_data = scores.dataSync();
    const classes_data = classes.dataSync();
    const valid_detections_data = valid_detections.dataSync()[0];

    await tf.dispose(result);
    await tf.dispose(imgPre);
    await tf.disposeVariables(result);

    ctx.drawImage(video, 0, 0);

    var i;
    for (i = 0; i < valid_detections_data; ++i) {

        let [x1, y1, x2, y2] = boxes_data.slice(i * 4, (i + 1) * 4);
        x1 *= canvas.width;
        x2 *= canvas.width;
        y1 *= canvas.height;
        y2 *= canvas.height;
        const width = x2 - x1;
        const height = y2 - y1;
        const klass = labels[classes_data[i]];
        const score = scores_data[i].toFixed(2);

        // Draw the bounding box.
        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 4;
        ctx.strokeRect(x1, y1, width, height);

        // Draw the label background.
        ctx.fillStyle = "#00FFFF";
        const textWidth = ctx.measureText(klass + ":" + score).width;
        const textHeight = parseInt(font, 10); // base 10
        ctx.fillRect(x1, y1, textWidth + 4, textHeight + 4);

    }

    for (i = 0; i < valid_detections_data; ++i){
        let [x1, y1, , ] = boxes_data.slice(i * 4, (i + 1) * 4);
        x1 *= canvas.width;
        y1 *= canvas.height;
        const klass = labels[classes_data[i]];
        const score = scores_data[i].toFixed(2);

        // Draw the text last to ensure it's on top.
        ctx.fillStyle = "#000000";
        ctx.fillText(klass + ":" + score, x1, y1);
    }

    stats.end();
    requestAnimationFrameCross(predictModel);        
}
