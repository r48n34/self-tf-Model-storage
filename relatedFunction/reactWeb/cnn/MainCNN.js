import {Container, Row, Col, Card, Spinner} from "react-bootstrap";
import React, { useState, useEffect } from 'react';
import full from './img/full.jpg';

//import getImageDeep from './ListImageDeep.js';
import * as tf from '@tensorflow/tfjs';

// Future model list
const modelList = [
  { 
    modelName:"catdogv3",
    label:["cat", "dog"], 
    size:[1,224,224,3], 
    modelUrl:"https://cdn.jsdelivr.net/gh/r48n34/self-tf-Model-storage/catdogv3/model.json",
    description: "Classification of dog and cat",
    importMethod: "LayersModel",
    sub: 127.5,
    div: 127.5
  },
  { 
    modelName:"5Classv3Graph",
    label:['bird', 'cat', 'dog', 'fish', 'lion'], 
    size:[1,224,224,3], 
    modelUrl:"https://cdn.jsdelivr.net/gh/r48n34/self-tf-Model-storage/5Classv3Graph/model.json",
    description: "Classification of five animals",
    importMethod: "GraphModel",
    sub: 0,
    div: 1
  },
]

function MainCNN() {

    const [loading, isLoading] = useState(0); // loading props "init" = 0, "loading" = -1, "play" = 1
    const [thisPic, setThisPic] = useState("");
    const [preview, setPreview] = useState(full);

    const [currentModelInfo, setCurrentModelInfo] = useState(); // currentModel info    
    const [initTimer, setInitTimer] = useState(true); // timeRaceFix, temp approach, wait to fix 

    const [myModel, setMyModel] = useState(); // model container
    const [message, setMessage] = useState({status:true}); // message container
    const [loadingPredict, setloadingPredict] = useState(false); // is model predicting

    useEffect(() => {

      if (!thisPic) {
        setPreview(full);
        return;
      }

      const objectUrl = URL.createObjectURL(thisPic);

      setPreview(objectUrl);
      modelApply();

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [thisPic])
    
    useEffect(() => {
      document.title = "Play Deep";
    },[]);

    function ModelBox(){
      return modelList.map((i, index) =>
      <Col md={6} xl={3} key={ "mdList" + index }>
        <Card className="bg-dark text-white" onClick={() => initModel(i)} style={{ borderRadius:"40px", textAlign:"center"}}>      
     
          <Card.Body style={{marginTop:"10px"}}>
            <h2 className="cardContent">{i.modelName}</h2>
            <hr></hr>
            <h4>{i.description}</h4>
          </Card.Body>                 
          
        </Card>
      </Col>
      )
    }

    function SelectPage(props){
      return (
        <div>
          <Card text={"dark"} className="mb-2" style={{ borderRadius:"15px", textAlign:"center"}}>     
            <Card.Body style={{marginTop:"10px"}}>
            <h1 style={{textAlign: "center"}}>Select your model.</h1>
            </Card.Body>
          </Card>
              
          <Row className="mt-3">
            <ModelBox/>
          </Row>   
        </div>
      )
    }

    function LoadingPage(){
      return (
        <div className="d-flex justify-content-center" style={{marginTop:"50vh"}}>
          <Spinner animation="border" role="status" size="lg">
          </Spinner>
        </div>
      )
    }

    function PlayField(){
      return(
        <div style={{textAlign:"center"}}>

          <Card text={"dark"} className="mb-2" style={{ borderRadius:"15px", textAlign:"center"}}>     
            <Card.Body style={{marginTop:"10px"}}>
            <h1 style={{textAlign: "center"}}>Input your pictures ({currentModelInfo.modelName})</h1>
            </Card.Body>
          </Card>

          <Row className="mt-4">

            <Col md={6}>
              <img id="img" src={preview} style={{width:"600px", height:"auto", maxWidth:"600px" }} alt="pics"/>
              <br></br>
              <label><h3>Select image: </h3></label>
              <input type="file" name="avatar" accept="image/png, image/jpeg" onInput={(e) => setThisPic(e.target.files[0])} ></input>

            </Col>

            <Col md={6}>
              
              <Card text={"dark"} className="mb-2" style={{ borderRadius:"15px", textAlign:"center"}}>     
                <Card.Body style={{marginTop:"10px"}}>
                <h1>Informations</h1>

                { message.status ? <div><ModelResult/></div> : <h1>Invalid input, please try again.</h1>}
                { loadingPredict && <Spinner animation="border" variant="dark"/>}   

                </Card.Body>
              </Card>
              
            </Col>

          </Row>
          
        </div>
      )
    }

    function SubModelResult(props){
      return( 
        <div className="d-flex justify-content-between">
          <div> <h2>{props.title}:</h2> </div>
          <div> <h2>{props.value}</h2> </div>
        </div>
      )
    }

    function ModelResult(){
      const obj = [
        {title: "Object", value: message.object},
        {title: "Confident", value: message.confident},
        {title: "Model Predicte Time", value: message.timeTaken},
        {title: "Actual time Taken", value: message.timeTaken},
        {title: "Target object", value: currentModelInfo.label.join(",")},
      ]
      return obj.map( v => <SubModelResult title={v.title} value={v.value}/>)
    }

    function timer(t){
      return new Promise((rec) =>{
        setTimeout(rec, t)
      })
    }

    async function modelApply(){

      try{
        setloadingPredict(true)

        let waitTime = 250 // Normal wait time
  
        // For the first time to fit src, first time take more workload to fit src.  
        if(initTimer){ 
          waitTime = 1500
          setInitTimer(false)
        }
  
        await timer(waitTime); // Wait for image src update
        const a = document.getElementById("img"); // That image elements
  
        let start = new Date();
        let imgPre = tf.browser.fromPixels(a)
          .resizeNearestNeighbor([currentModelInfo.size[1], currentModelInfo.size[2]])
          .toFloat()
          .sub(tf.scalar(currentModelInfo.sub))
          .div(tf.scalar(currentModelInfo.div))
          .expandDims();
        
        let afterResize = new Date();
        console.log("Img resize & rescale time", (new Date() - start) / 1000)
    
        // predict the inupt and output softmax prob
        const p = await myModel.predict(imgPre).data();
       
        // Get result and print regarding label
        const labelMyModel = currentModelInfo.label
        let ind = p.indexOf(Math.max(...p));
        console.log(p)
        
        console.log("MyModel:", labelMyModel[ind])
        let obj = {
          status: true,
          object : labelMyModel[ind],
          confident : (Math.max(...p) * 100).toFixed(2) + "%",
          timeTaken: (new Date() - start) / 1000 + " secs",
          timeTakenOffset: (new Date() - start + waitTime) / 1000 + " secs",
        }
        setMessage(obj)
        setloadingPredict(false)
    
        console.log("Time used to predict: ",(new Date() - afterResize) / 1000)
        console.log("Overall time: ",(new Date() - start) / 1000)
        console.log("----------------------------")
      }
      catch(err){
        let obj = {
          status: false,
          object : "",
          confident : 0,
          timeTaken: 0,
          timeTakenOffset: 0,
        }
        setMessage(obj)
      }
  
    }

    async function initModel(item){
      isLoading(-1)
      setCurrentModelInfo(item)

      // loading model
      await tf.ready();
      fitModel(item.modelUrl, item.importMethod) 

    }

    async function fitModel(url, method){ // fit model in hook myModel
      const mod = method === "LayersModel" ? await tf.loadLayersModel(url) : await tf.loadGraphModel(url);
      setMyModel(mod);     
      isLoading(1); // Finish loading
    }

    return (  
      <Container fluid>
        {loading === 0 ? <SelectPage/> : (loading === 1 ? <PlayField/> : <LoadingPage/>) }
      </Container>
    );
}
  
export default MainCNN;