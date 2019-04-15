// @flow
import React, { Component } from 'react';
import styles from './Main.css';
import fs from "fs";
import path from "path";
import html2canvas from "html2canvas";
import listen from "../../unity-messaging/http.js";
import electron from "electron";
const remote = electron.remote;
import "./Main.css";

const { desktopCapturer } = require('electron');


function getCanvas(id){
  var sun = new Image();
  var moon = new Image();
  var earth = new Image();
  function init() {
    sun.src = 'https://mdn.mozillademos.org/files/1456/Canvas_sun.png';
    moon.src = 'https://mdn.mozillademos.org/files/1443/Canvas_moon.png';
    earth.src = 'https://mdn.mozillademos.org/files/1429/Canvas_earth.png';
    window.requestAnimationFrame(draw);
  }
  function draw() {
    var ctx = document.getElementById(id).getContext('2d');

    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, 300, 300); // clear canvas

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.strokeStyle = 'rgba(0, 153, 255, 0.4)';
    ctx.save();
    ctx.translate(150, 150);

    // Earth
    var time = new Date();
    ctx.rotate(((2 * Math.PI) / 60) * time.getSeconds() + ((2 * Math.PI) / 60000) * time.getMilliseconds());
    ctx.translate(105, 0);
    ctx.fillRect(0, -12, 50, 24); // Shadow
    ctx.drawImage(earth, -12, -12);

    // Moon
    ctx.save();
    ctx.rotate(((2 * Math.PI) / 6) * time.getSeconds() + ((2 * Math.PI) / 6000) * time.getMilliseconds());
    ctx.translate(0, 28.5);
    ctx.drawImage(moon, -3.5, -3.5);
    ctx.restore();

    ctx.restore();

    ctx.beginPath();
    ctx.arc(150, 150, 105, 0, Math.PI * 2, false); // Earth orbit
    ctx.stroke();

    ctx.drawImage(sun, 0, 0, 300, 300);

    window.requestAnimationFrame(draw);
  }
  init();
}

function convertDataURIToBinary(dataURI) {
  var base64 = dataURI.substring(23);
  var raw = window.atob(base64);
  var rawLength = raw.length;

  var array = new Uint8Array(new ArrayBuffer(rawLength));
  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}

export default class Home extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      intervalHandle: null,
      intervalHandleHtmlToCanvas: null,
      electronBounds: {
        width: 300, hieght: 300
      }
    };
  }

  setupElectronCapturer(canvasId, callback){
    let fps = 60;
    let thisRef = this;
    desktopCapturer.getSources({ types: ['window'] }, (error, sources) => {
      if (error) throw error
      for (let i = 0; i < sources.length; ++i) {
        if (sources[i].name === 'Hello Electron React!') {
          navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: sources[i].id,
                minWidth: 1280,
                maxWidth: 1280,
                minHeight: 720,
                maxHeight: 720
              }
            }
          }).then((stream) => handleStream(stream, callback))
            .catch((e) => handleError(e));
          return
        }
      }
    });

    const updateCanvasContent = (video) => {
      video.style.height = this.videoHeight + 'px'; // videoHeight
      video.style.width = this.videoWidth + 'px'; // videoWidth

      // Create canvas
      let canvas = document.getElementById(canvasId);
      // canvas.width = this.videoWidth;
      // canvas.height = this.videoHeight;
      let ctx = canvas.getContext('2d');
      // Draw video on canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (callback) {
        // Save screenshot to base64
        callback(canvas.toDataURL("'image/jpeg'"));
      } else {
        console.log('Need callback!');
      }

      // Remove hidden video tag
      video.remove();
      try {
        // Destroy connect to stream
        stream.getTracks()[0].stop();
      } catch (e) {}
    };

    const handleStream = (stream, callback) => {
      // Create hidden video tag
      let video = document.createElement('video');
      video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';

      // Event connected to stream
      video.onloadedmetadata = function () {
        // Set video ORIGINAL height (screenshot)
        let intervalHandle = setInterval(() => {
          updateCanvasContent(video);
          thisRef.grabFrame("electron-canvas");
        }, 1000 / fps);
        thisRef.setState((state) => {
          return {...state, intervalHandle: intervalHandle}
        });
      };

      video.src = URL.createObjectURL(stream);
      document.body.appendChild(video);
    };

    function handleError (e) {
      console.log(e)
    }
  }

  componentDidMount() {
    let thisRef = this;
    // init the canvas animations
    console.log("componentDidMount");
    getCanvas("source-canvas");

    let electronBounds = remote.getCurrentWindow().webContents.getOwnerBrowserWindow().getBounds();
    console.log("got electron bounds", electronBounds);
    thisRef.setState((state) => {
      return {...state, electronBounds: electronBounds}
    });

    listen(({req, res}) => {
      console.log("got message from unity (parsed)", req.body);
    });
  }

  async grabFrame(elementId) {
    let canvas = document.getElementById(elementId);
    var dataUri = canvas.toDataURL("image/jpeg", 1);
    var jpegBytes = convertDataURIToBinary(dataUri);
    console.log("grabFrame", {jpegBytes});
    console.log("snap writeToDisk ", {jpegBytes});
    try {
      let unityPath = path.resolve(`C:\\Users\\Giuseppe\\Documents\\unity-electron\\Assets\\Images\\input.jpeg`);
      fs.writeFileSync(unityPath, jpegBytes);
    } catch (e) {
      if(e.code === "EBUSY"){
        console.info("unity is locking the file", e.message);
      } else {
        console.error(e);
      }
    }
  }


  render() {
    let thisRef = this;
    return (
      <div className={styles.container} data-tid="container" id={"root"}>
        <canvas id={"source-canvas"} width="300" height="300"/>
        <canvas id={"electron-canvas"} width={thisRef.state.electronBounds.width} height={thisRef.state.electronBounds.width}/>

        <button onClick={async () => {
          thisRef.setupElectronCapturer("electron-canvas", (data) =>{
            console.log("setupElectronCapturer (callback)", data);
          });
        }}>start write (60fps)</button>
        <button onClick={async () => {
          clearTimeout(thisRef.state.intervalHandle);
        }}>stop write (60fps)</button>
      </div>
    );
  }
}
