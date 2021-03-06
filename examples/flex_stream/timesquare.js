//Times Square ambience based on flex_stream.js
//For Windows, Linux and Mac

module.exports = {
		init: function() {
			init(); 
		}
}

const os          = require("os");
const flex_stream = require("./flex_stream.js");

var frame = flex_stream.newFrame();

function timesquare() {       
	// Scrolling random patterns
	var off = 0;
	var amp = 150;
	var r = Math.random()*amp+off;
	var g = Math.random()*amp+off;
	var b = Math.random()*amp+off;
	var size = flex_stream.getSize();
	
	//Shift() not supported for Uint8Arrays, so ..
	for (i=1;i<size; i++){
		frame[(i-1)*3+0] = frame[(i*3)+0];
		frame[(i-1)*3+1] = frame[(i*3)+1];
		frame[(i-1)*3+2] = frame[(i*3)+2];
	}
	
	// Random separators
	if (Math.random()>.5){
		r = 0; g = 0; b = 0;
	}	
	
	//Push() not supported for Uint8Arrays, so ..
	frame[(size-1)*3+0] = Math.floor(r);  //R
	frame[(size-1)*3+1] = Math.floor(g);  //G
	frame[(size-1)*3+2] = Math.floor(b);  //B
	
	flex_stream.setAlpha(0.1);
	flex_stream.produceFrame(frame);     
}

//Configure stream

function init(){
	flex_stream.setSize(8,1);
	flex_stream.setProducerFramerate(8);
	flex_stream.setConsumerFramerate(60);
	flex_stream.setOnFrame(timesquare);
}

init();
