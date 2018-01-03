//CPU load meter based on flex_stream.js
//User defined OnFrame() is a particle trail emitter to indicate CPU load. 
//Windows, Linux and Mac

var os         = require("os");
var flex_stream = require("./flex_stream.js");

var size         = 8;   // Default 8, maximum 64 (single BlickStick channel)
var framerate    = 60;  // Varies with CPU load   
var transparency = .75; // Leave a particle trail

var startMeasure  = cpuLoad();
var percentageCPU = 0;
var cpu_avg = 0;

var phase   = 0;
var shift   = 0;
var speed   = 1;

var pixels  = null;

function onFrame() {       
	var frame = flex_stream.newFrame();
	var endMeasure = cpuLoad(); 
	var idleDifference = endMeasure.idle - startMeasure.idle;
	var totalDifference = endMeasure.total - startMeasure.total;
	startMeasure = endMeasure;

	//Vary the framerate by percentage CPU load (4 to 60 fps)
	percentageCPU = 100 - (100 * idleDifference / totalDifference);
	cpu_avg = (cpu_avg+percentageCPU)/2;
	framerate = cpu_avg/1.8+5;

	if (pixels == null)
		pixels = flex_stream.newFrame();

	//Vary particle colour by CPU load (green to amber to red)        
	pixels[(size-2)*3+0] = Math.floor(cpu_avg*2.5)+5;
	pixels[(size-2)*3+1] = 100-Math.floor(cpu_avg);
	pixels[(size-2)*3+2] = 2;

	//Bounce particle off edges of LED strip (copy from pixel source to new frame)
	if (phase<0 || phase>size-3)
		speed =-speed;         
	phase    += speed;
	shift     = Math.floor(phase);
	for (var i = 0; i<size; i++) {
		frame[i*3+0] = pixels[shift*3+0]; // R
		frame[i*3+1] = pixels[shift*3+1]; // G
		frame[i*3+2] = pixels[shift*3+2]; // B
		if (shift<size)
			shift+=1;
	}

	flex_stream.setProducerFramerate(framerate);
	flex_stream.produceFrame(frame);     
}

//CPU load 
function cpuLoad() {
	var totalIdle = 0, totalTick = 0;
	var cpus = os.cpus();
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
flex_stream.setSize(size);
flex_stream.setProducerFramerate(framerate);
flex_stream.setConsumerFramerate(framerate);
flex_stream.setTransparency(transparency);
flex_stream.setOnFrame(onFrame);

