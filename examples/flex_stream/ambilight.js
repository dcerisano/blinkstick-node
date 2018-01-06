//Ambient display (ambilight) based on flex_stream.js     
//Real-time streaming of desktop to BlinkStick Flex and Pro
//User defined OnFrame() samples the desktop, and morphs scaled frames to BlinkStick
//Minimum Requirements: 
//- Latest version of nodejs (tested with v8.9.3)
//- Latest blinkstick, screenshot-desktop and sharp npm packages (all cross-platform)
//For Windows, Linux and Mac

const  flex_stream = require("./flex_stream.js");                                                                                                                                                                     
const  screenshot  = require('screenshot-desktop'); //Available at npmjs.com                                                                                                                                       
const  sharp       = require('sharp');              //Available at npmjs.com                                                                                                                                             

var size               = 8;  // Default 8, maximum 64 (single BlickStick channel)
var producer_framerate = 10; // Low sample rate (10 fps = 100ms lag) to reduce CPU overhead 
var consumer_framerate = 60; // High render rate for smooth morphing/interlacing
var alpha              = 0.2 // 15% opacity for smooth morphing/interlacing

//Stream scaled desktop (size x 1) to BlinkStick via async futures pipeline
function onFrame(){
	screenshot().then((img) => {
		sharp(img).resize(size,1).ignoreAspectRatio().raw().toBuffer().then(data => {
			flex_stream.produceFrame(data);
		})
	});
}

//Configure stream
flex_stream.setSize(size);
flex_stream.setProducerFramerate(producer_framerate);
flex_stream.setConsumerFramerate(consumer_framerate);
flex_stream.setAlpha(alpha);
flex_stream.setOnFrame(onFrame);
