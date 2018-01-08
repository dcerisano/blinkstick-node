//Image display flex_stream.js     
//User defined OnFrame() converts images, and morphs scaled frames to BlinkStick
//Minimum Requirements: 
//- Latest version of nodejs (tested with v8.9.3)
//- Latest blinkstick, sharp npm packages (all cross-platform)
//For Windows, Linux and Mac

module.exports = {
		init: function(filename) {
			init(filename); 
		}
}

const  flex_stream = require("./flex_stream.js");                                                                                                                                                                                                                                                                                                         
const  sharp       = require('sharp');              //Available at npmjs.com                                                                                                                                             
var    frame       = null;
var    oldOnFrame  = flex_stream.getOnFrame();
var    oldConsumerFramerate  = flex_stream.getConsumerFramerate();
var    oldProducerFramerate  = flex_stream.getProducerFramerate();
var    oldAlpha              = flex_stream.getAlpha();
var    duration              = -1; //Default static image.

//Stream scaled desktop (size x 1) to BlinkStick via async futures pipeline
function image(){
	if (duration-- == 0){
		flex_stream.setConsumerFramerate(oldConsumerFramerate);
		flex_stream.setProducerFramerate(oldProducerFramerate);
		flex_stream.setAlpha(oldAlpha);	
		flex_stream.setOnFrame(oldOnFrame);
	}
	else
		flex_stream.produceFrame(frame);
	
	console.log(duration);
}

//Configure stream

function init(filename, num_frames){
	flex_stream.setSize(8);

	oldOnFrame            = flex_stream.getOnFrame();
	oldConsumerFramerate  = flex_stream.getConsumerFramerate();
	oldProducerFramerate  = flex_stream.getProducerFramerate();
	oldAlpha              = flex_stream.getAlpha();
	
	sharp(filename).resize(flex_stream.getSize(),1).ignoreAspectRatio().raw().toBuffer().then(data => {
		frame = data;
		duration = num_frames;
		flex_stream.setProducerFramerate(60);
		flex_stream.setConsumerFramerate(60);
		flex_stream.setAlpha(1);
	});
}


	init(process.argv[2], process.argv[3]);


