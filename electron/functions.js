const { desktopCapturer } = require('electron');

export default {
  hello: () => {
    console.log("hello world");
  },
  capture: () => {
    try {
      desktopCapturer.getSources({ types: ['window'] }, (error, sources) => {
        if (error) throw error;
        for (let i = 0; i < sources.length; i += 1) {
          if (sources[i].name === 'Hello Electron React!') {
            navigator.mediaDevices.getUserMedia({
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: sources[i].id,
                  minWidth: 1024,
                  maxWidth: 1024,
                  minHeight: 724,
                  maxHeight: 724
                }
              }
            }).then((stream) => handleStream(stream))
              .catch((e) => handleError(e));
            return
          }
        }
      });

      const handleStream = (stream) => {

        const video = document.querySelector('video');
        video.srcObject = stream;
        video.onloadedmetadata = () => video.play()
      };

      const handleError = (e) => {
        console.log(e)
      }
    } catch (e) {
      console.error("capture error", e);
    }
  }
}
