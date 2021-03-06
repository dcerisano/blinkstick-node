//Frame streamer for Blinkstick Flex and Pro (MAX 64 LEDs - single channel **)
//Producer pushes frames to the stream as simple RGB arrays at a set rate
//Consumer pulls frames from the stream and renders them to BlickStick at a set rate
//When consumer rate is faster than production rate, alpha (opacity) allows frame morphing 
//For Windows, Linux and Mac
//** Flex is single channel and can handle 64 LEDs if flashed with Pro firmware, otherwise 32 is the default limit
//** Pro can currently only set one channel per call, so streaming is not yet supported for multiple channels

module.exports = {
		init: function() {
			init(); 
		},
		fadeOut: function() {
			fadeOut(); 
		},
		setOnFrame: function(fn) {
			setOnFrame(fn); 
		},
		saveOnFrame: function() {
			saveOnFrame(); 
		},
		restoreOnFrame: function() {
			restoreOnFrame(); 
		},
		newFrame: function() {
			return newFrame(); 
		},
		clearFrame: function(frame)
		{
			clearFrame(frame);
		},
		setAlpha: function(a)
		{
			setAlpha(a);
		},
		getAlpha: function()
		{
			return getAlpha();
		},
		produceFrame: function(frame)
		{
			produceFrame(frame);
		},
		setProducerFramerate: function(framerate)
		{
			setProducerFramerate(framerate);
		},
		getProducerFramerate: function()
		{
			return getProducerFramerate();
		},
		setConsumerFramerate: function(framerate)
		{
			setConsumerFramerate(framerate);
		},
		getConsumerFramerate: function()
		{
			return getConsumerFramerate();
		},
		setSize: function(w, h)
		{
			setSize(w, h);
		},
		getSize: function()
		{
			return getSize();
		},
		getWidth: function()
		{
			return width;
		},
		getHeight: function()
		{
			return height;
		},
		setCrossFade: function(fade)
		{
			crossFade = fade;
		},
		getCrossFade: function()
		{
			return crossFade;
		},
		start: function()
		{
			start();
		},
		stop: function()
		{
			stop();
		},
		isStreaming: function()
		{
			return streaming;
		}
}

var blinkstick         = require('blinkstick');
var device             = blinkstick.findFirst();
var MAX_SIZE           = 64;    //BlinkStick single channel limit
var width              = 8;     //Default 8 LEDs in a
var height             = 1;     //single row.
var producer_framerate = 20;    //Default low frame production for morphing
var consumer_framerate = 60;    //Default high frame rendering for morphing
var alpha              = 0.1;   //Default is transparent frames for morphing
var stream_buffer      = [];    //Stream buffer for frames
var composite          = null;  //Composite frame for morphing
var currentFrame       = null;  //Latest frame from stream
var streaming          = false; //Pause
var busy               = false; //Semaphore
var crossFade          = true;  //Hard or soft transitions.
var producer_timer     = null;
var consumer_timer     = null;
var prevOnFrame            = null;
var prevConsumerFramerate  = 0;
var prevProducerFramerate  = 0;
var prevAlpha              = 0;

//Stream Producer 
function producer(){
	if (streaming)
		onFrame(); //Call user defined function
	producer_timer = setTimeout(producer, 1000/producer_framerate); 
}

//Stream Consumer
function consumer(){
	if (streaming)
		consumeFrame(); //Render frame to BlinkStick
	consumer_timer = setTimeout(consumer, 1000/consumer_framerate);
}

//Convert to internal BlinkStick buffer
function convert_grb(rgb){
	var grb = newFrame();
	for (var i = 0; i<rgb.length; i++) {
		grb[i*3+1] = rgb[i*3+0]; // G
		grb[i*3+0] = rgb[i*3+1]; // R
		grb[i*3+2] = rgb[i*3+2]; // B
	}
	return grb;
}

//Create an empty frame
function newFrame(){
	return new Uint8Array(getSize()*3);
}

//Clear a frame
function clearFrame(frame){
	if (frame != null)
		for (i=0; i<getSize()*3; i++)
			frame[i] =0;
}

//Clear all LEDs
function fadeOut(frame){
	setOnFrame(fadeToBlack);
}

//Produce frame on stream - called from user-defined OnFrame()
function produceFrame(frame)
{
	if (stream_buffer.length<=0) //Skip frame if consumer is falling behind
		stream_buffer.push(frame);
}

//Consume frame from stream - called from consumer
function consumeFrame()
{
	if (stream_buffer.length>0){ //Check if new frame available
		var rgb = stream_buffer.shift();
		var grb = convert_grb(rgb);
		currentFrame = grb;
	}
	if (currentFrame != null)
		morphFrame(currentFrame); //Morph to the current frame
}

//Morph current frame over composite frame
function morphFrame(current)
{
	if (composite == null || alpha == 1)
		composite = current; //Initialize composite frame

	//Morph to the current frame with composite (additive alpha blending function)
	if (alpha>0){   
		for (var i = 0; i<getSize(); i++) {
			composite[i*3+0] = Math.floor(current[i*3+0]*alpha + composite[i*3+0]*(1-alpha)); // R
			composite[i*3+1] = Math.floor(current[i*3+1]*alpha + composite[i*3+1]*(1-alpha)); // G
			composite[i*3+2] = Math.floor(current[i*3+2]*alpha + composite[i*3+2]*(1-alpha)); // B
		}
	}

	if (!busy)
	{ 
		busy = true;
		device.setColors(0, composite, function(err, composite) { 
			busy = false;
		});
	}
}


//OnFrame() to stream user-defined frames

function setOnFrame(fn)
{

	//Hard or soft transition
	if (!crossFade)
		clearFrame(composite);
	
	stream_buffer = [];
	
	onFrame = fn;

//	if (producer_timer != null)
//	clearTimeout(producer_timer);

//	if (consumer_timer != null)
//	clearTimeout(consumer_timer);


//	consumer_timer = setTimeout(consumer, 1000/consumer_framerate);
//	producer_timer = setTimeout(producer, 1000/producer_framerate); 

	start();
}

function saveOnFrame(){
	prevOnFrame           = onFrame;
	prevConsumerFramerate = consumer_framerate;
	prevProducerFramerate = producer_framerate;
	prevAlpha             = alpha;
	
}
function restoreOnFrame(){
	consumer_framerate = prevConsumerFramerate;
	producer_framerate = prevProducerFramerate;
	alpha              = prevAlpha;
	setOnFrame(prevOnFrame);
}

//Default onFrame() stub

var onFrame = function(){};

function setProducerFramerate(framerate)
{
	producer_framerate = Math.max(1, Math.min(framerate, 60));	//Clamp between 1 and 50 fps
}

function getProducerFramerate()
{
	return producer_framerate;
}

function setConsumerFramerate(framerate)
{

	consumer_framerate = Math.max(1, Math.min(framerate, 60));	//Clamp between 1 and 60 fps
}

function getConsumerFramerate()
{
	return consumer_framerate;
}

function setSize(w,h)
{	
	width  = Math.max(1, Math.min(w, MAX_SIZE));   //Clamp between 1 and MAX_SIZE (64 for BlinkStick single channel)
	height = Math.max(1, Math.min(h, MAX_SIZE/w)); //Clamp between 1 and MAX_SIZE/width
}

function getSize()
{
	return width*height;
}

function setAlpha(a)
{
	alpha = Math.max(0, Math.min(a, 1));	//Clamp between 0 (invisible) and 1 (opaque)
}

function getAlpha()
{
	return alpha;
}

function start()
{
	if (device)
		streaming = true;
}

function stop()
{
	streaming = false;
}

//Clean exit
process.on('SIGTERM', onExit);
process.on('SIGINT',  onExit);

function onExit(){
	stop(); //Disable streaming to ensure no pending frames are set after LEDs are turned off
	var frame = newFrame();	
	clearFrame(frame);
	device.setColors(0, frame, function(err, frame) {
		device.turnOff(); 
		process.exit(0);
	}); //Turn off LEDs 
}

//Default signature animation
var pos = 0;
var signature = function(){
	//Bounce particle off edges of LED strip
	if (pos++ >= getSize()+20) pos=0;       
	var frame = newFrame();
	if(pos < getSize()){
		frame[pos*3+0] = 255; //R
		frame[pos*3+1] = 255; //G
		frame[pos*3+2] = 255; //B
	}
	produceFrame(frame);
};

//Fade to Black used with fadeOut()
var fadeToBlack = function(){   
	var frame = newFrame();
	produceFrame(frame);
};

function init(){
	setSize(8,1);
	setProducerFramerate(20);
	setConsumerFramerate(60);
	setAlpha(0.05);
	setOnFrame(signature);

}

if (device)
{
	init();
	producer();
	consumer();
}
