//CPU load meter based on flex_stream.js
//User defined OnFrame() is a particle trail emitter to indicate CPU load. 
//For Windows, Linux and Mac

module.exports = {
		init: function() {
			init(); 
		}
}

const os          = require("os");
const flex_stream = require("./flex_stream.js");

var framerate = 30;  // Varies with CPU load   

var startMeasure  = cpuLoad();
var percentageCPU = 0;
var cpu_avg       = 0;
var pos           = 1;
var speed         = 1;

function cpuMeter() {       
	var endMeasure      = cpuLoad(); 
	var idleDifference  = endMeasure.idle - startMeasure.idle;
	var totalDifference = endMeasure.total - startMeasure.total;

	startMeasure = endMeasure;

	if (totalDifference != 0)
		percentageCPU = 100 - (100 * idleDifference / totalDifference);
	
	cpu_avg = (cpu_avg+percentageCPU)/2;
	
	//Vary the producer framerate by percentage CPU load (15 to 60 fps)
	framerate = cpu_avg*0.45+15;

	//Bounce particle off edges of LED strip
	if (pos<=0 || pos>=flex_stream.getSize()-1)
		speed =-speed;         
	pos += speed;

	var frame = flex_stream.newFrame();
	//Vary particle colour by CPU load (green to amber to red)        
	frame[pos*3+0] = Math.floor(cpu_avg*2.5)+5; //R
	frame[pos*3+1] = 100-Math.floor(cpu_avg);   //G
	frame[pos*3+2] = 2;                         //B

	flex_stream.setProducerFramerate(framerate);
	flex_stream.setAlpha(0.25);
	flex_stream.produceFrame(frame);     
}

//CPU load 
function cpuLoad() {
	var totalIdle = 0;
	var totalTick = 0;
	var cpus      = os.cpus();

	for(var i = 0, len = cpus.length; i < len; i++) {
		var cpu = cpus[i];
		for(type in cpu.times) {
			totalTick += cpu.times[type];
		}     
		totalIdle += cpu.times.idle;
	}
	return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
}

//Configure stream

function init(){
	flex_stream.setSize(8,1);
	flex_stream.setProducerFramerate(30);
	flex_stream.setConsumerFramerate(60);
	flex_stream.setOnFrame(cpuMeter);
}

init();

