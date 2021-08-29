import {Container, Row, Col, Card, Spinner } from "react-bootstrap";
import React, { useState, useEffect } from 'react';

import getImageDeep from './ListImageDeep.js';
import * as tf from '@tensorflow/tfjs';

// Future model list
const modelList = [
  { 
    modelName:"catdogv3",
    label:["cat", "dog"], 
    size:[1,224,224,3], 
    imageSrc:getImageDeep("full"),
    modelUrl:"https://cdn.jsdelivr.net/gh/r48n34/self-tf-Model-storage/catdogv3/model.json",
  }
]

function MainCNN() {

    const [loading, isLoading] = useState(0); // loading props "init" = 0, "loading" = -1, "play" = 1
    const [thisPic, setThisPic] = useState("");
    const [preview, setPreview] = useState();

    const [currentModelInfo, setCurrentModelInfo] = useState(); // currentModel info    
    const [initTimer, setInitTimer] = useState(true); // timeRaceFix, temp approach, wait to fix 


    const [myModel, setMyModel] = useState(); // model container
    const [message, setMessage] = useState(""); // message container

    useEffect(() => {

      if (!thisPic) {
        setPreview(undefined);
        return;
      }

      setMessage("loading...")

      const objectUrl = URL.createObjectURL(thisPic);

      setPreview(objectUrl);
      console.log(objectUrl)
      modelApply();

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [thisPic])
    
    useEffect(() => {
      document.title = "Play Deep";
    },[]);

    function ModelBox(){
      return modelList.map((i, index) =>
      <Col md={3} xl={2} key={ "mdList" + index }>
        <Card className="bg-dark text-white" onClick={() => initModel(i)}>      
          <Card.Img src={ i.imageSrc } alt="Card image" />  
          <Card.ImgOverlay >      
            <Card.Title> <h2 className="cardContent">{i.modelName}</h2> </Card.Title>              
          </Card.ImgOverlay> 
        </Card>
      </Col>
      )
    }

    function SelectPage(props){
      return (
        <div>
          <h1 className="mt-3" style={{textAlign: "center"}}>Select your model.</h1>
          <Row>
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
          <h1> Input your pictures ({currentModelInfo.modelName})</h1>
          <h4> Target: {currentModelInfo.label.join(" ")} </h4>
          <img id="img" src={preview} style={{width:"600px", height:"auto", maxWidth:"1200px" }} alt="pics"/>
          <br></br>
          <input type="file" name="avatar" accept="image/png, image/jpeg" onInput={(e) => setThisPic(e.target.files[0])} ></input>
          <h1>{message}</h1>
        </div>
      )
    }

    function timer(t){
      return new Promise((rec, rej) =>{
        setTimeout(rec, t)
      })
    }

    async function modelApply(){

      let waitTime = 400 // Normal wait time

      // For the first time to fit src, first time take more workload to fit src.
      if(initTimer){ 
        waitTime = 2000
        setInitTimer(false)
      }

      await timer(waitTime);
      const a = document.getElementById("img");

      let start = new Date();
      let imgPre = tf.browser.fromPixels(a)
        .resizeNearestNeighbor([currentModelInfo.size[1], currentModelInfo.size[2]])
        .toFloat()
        .sub(tf.scalar(127.5))
        .div(tf.scalar(127.5))
        .expandDims();
      
      let afterResize = new Date();
      console.log("Img resize & rescale time", (new Date() - start) / 1000)
      console.log(imgPre)
  
      // predict the inupt and output softmax prob
      const p = await myModel.predict(imgPre).data();
     
      // Get result and print regarding label
      const labelMyModel = ["cat", "dog"]
      let ind = p.indexOf(Math.max(...p));
      console.log(p)
      
      console.log("MyModel:", labelMyModel[ind])
      setMessage(`Is this a ${labelMyModel[ind]} ? (Confident ${(Math.max(...p) * 100).toFixed(2)}%)`)
  
      console.log("Time used to predict: ",(new Date() - afterResize) / 1000)
      console.log("Overall time: ",(new Date() - start) / 1000)
      console.log("----------------------------")
  
    }

    async function initModel(item){
      isLoading(-1)

      setCurrentModelInfo(item)

      // loading model
      await tf.ready();
      fitModel(item.modelUrl) 

    }

    async function fitModel(url){ // fit model in hook myModel
      const mod = await tf.loadLayersModel(url);
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