//comm
/*function myConnect(src, dst) {
	src.connect(dst);
}

function myDisconnect(src, dst) {
	src.disconnect(dst);
}


*/
//base
var Sound = function(ctx) {
	if(!ctx) {
		var Ctx = window.webkitAudioContext ? window.webkitAudioContext : window.AudioContext;
		ctx = new Ctx();
	}
	this.ctx = ctx;
	this.src = null;
	//this.buffer = null;
	//this.isLoaded = false;
	/*
	this.load = function (src, callback) {
	    this.src = src;
	    var request = new XMLHttpRequest();
	    var that = this;
	    request.open('GET', this.src, true);
	    request.responseType = 'arraybuffer';
	    request.onload = function () {
	        that.ctx.decodeAudioData(request.response, function (buffer) {
	            that.buffer = buffer;
	            that.isLoaded = true;
	            if (typeof callback === 'function') {
	                callback(buffer);
	            }
	        }, function(){
	            //decode fail
	            alert('source not support');
	        });
	    };
	    request.send();
	};
	*/
	this.volume = 1;
	this.loop = false;
	this.loopStart = 0;
	this.loopEnd = 0;

	this.volumeNode = null;
	this.sourceNode = null;

	this.destinationNode = ctx.destination;
};

Sound.prototype.loadBase = function() {
	this.sourceNode = this.ctx.createBufferSource();
	//this.sourceNode.buffer = this.buffer;
	this.volumeNode = this.ctx.createGain();
	this.volumeNode.gain.value = this.volume;
	this.sourceNode.loopStart = this.loopStart;
	this.sourceNode.loopEnd = this.loopEnd;
	this.sourceNode.loop = this.loop;
}

Sound.prototype.play = function(time) { 
	this.sourceNode.start(time);
};

Sound.prototype.stop = function() {
	this.sourceNode.stop();
};

Sound.prototype.suspend = function() {
	this.ctx.suspend();
};

Sound.prototype.resume = function() {
	this.ctx.resume();
};

Sound.prototype.setVolume = function(volume) {
	this.volume = volume;
	if(this.volumeNode) {
		this.volumeNode.gain.value = volume;
	}
};

Sound.prototype.setLoop = function(loopStart, loopEnd) {
	if(loopStart === false) {
		this.loop = false;
	} else {
		this.loop = true;
		this.loopStart = loopStart;
		this.loopEnd = loopEnd;
	}
	if(this.sourceNode) {
		this.sourceNode.loopStart = this.loopStart;
		this.sourceNode.loopEnd = this.loopEnd;
		this.sourceNode.loop = this.loop;
	}
};

Sound.prototype.setOutput = function(outputNode) {
	this.destinationNode = outputNode;
};

//3D
Sound.prototype.load3D = function() {
	this.panner = this.ctx.createPanner();
	this.soundR = 0.5;
	this.setPos(1, 0, 1);
};

Sound.prototype.setPos = function(nx, ny, nz) {
	this.panner.setPosition(nx * this.soundR, ny * this.soundR, nz * this.soundR);
};

/*Sound.prototype.setOrientation = function (nx, ny, nz) {
    this.panner.setOrientation(nx * this.soundR, ny * this.soundR, nz * this.soundR);
};
*/

//reverber startGain为入口， endGain为出口
Sound.prototype.loadReverber = function() {
	this.startGain = null;
	this.endGain = null;
	this.curReverber = null;
	this.convolutionNodes = [];
	this.impulse = 'mediasrc/impulse/';
	this.convolutionInfo = [{
			name: '电话',
			mainGain: 0.0,
			sendGain: 3.0,
			url: 'filter-telephone.wav'
		},
		{
			name: '室内',
			mainGain: 1.0,
			sendGain: 2.5,
			url: 'spreader50-65ms.wav'
		},
		{
			name: '山洞',
			mainGain: 0.0,
			sendGain: 2.4,
			url: 'feedback-spring.wav'
		},
		{
			name: '教堂',
			mainGain: 1.8,
			sendGain: 0.9,
			url: 'bin_dfeq/s2_r4_bd.wav'
		},
		{
			name: '厨房',
			mainGain: 0.6,
			sendGain: 3.0,
			url: 'house-impulses/kitchen-true-stereo.wav'
		},
		{
			name: '洗手间',
			mainGain: 0.6,
			sendGain: 2.1,
			url: 'house-impulses/living-bedroom-leveled.wav'
		}
	];

	this.startGain = this.ctx.createGain();
	this.startGain.gain.value = this.volume;
	this.endGain = this.ctx.createGain();
	this.endGain.gain.value = this.volume;
	this.startGain.connect(this.endGain);

	this.revIdx = 0;

	/*for (i = 0; i < this.convolutionInfo.length; i ++) {
	    this.convolutionNodes[i] = this.ctx.createConvolver();
	    loadFile(this.ctx, this.impulse + this.convolutionInfo[i].url, this.convolutionNodes[i], loadReverberAudio);
	}*/
	loadReverberAudio = function() {
		var sound = this.main.audioEdit.sound;
		if(sound.revIdx === sound.convolutionInfo.length)
			return;

		sound.convolutionNodes[sound.revIdx] = sound.ctx.createConvolver();
		loadFile(sound.ctx, sound.impulse + sound.convolutionInfo[sound.revIdx].url, sound.convolutionNodes[sound.revIdx], loadReverberAudio);
		sound.revIdx++;
	}

	loadReverberAudio();
}

Sound.prototype.setReverber = function(index) {
	if(index >= 0) {
		if(this.curReverber != null) {
			this.startGain.disconnect(this.curReverber);
			this.curReverber.disconnect(this.endGain);

			this.startGain.connect(this.convolutionNodes[index]);
			this.convolutionNodes[index].connect(this.endGain);
		} else {
			this.startGain.disconnect(this.endGain);
			this.startGain.connect(this.convolutionNodes[index]);
			this.convolutionNodes[index].connect(this.endGain);
		}
		this.curReverber = this.convolutionNodes[index];
	} else {
		if(this.curReverber != null) {
			this.startGain.disconnect(this.curReverber);
			this.curReverber.disconnect(this.endGain);
			this.startGain.connect(this.endGain);
		}
		this.curReverber = null;
	}
}

//eq, biquads[0]为入口 biquads[9]为出口
Sound.prototype.loadEQ = function() {
	this.freqs = [32, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
	this.biquads = [];
	for(i = 0; i < 10; i++) {
		this.biquads[i] = this.ctx.createBiquadFilter();
		this.biquads[i].type = 'peaking'; // 'peaking';
		this.biquads[i].frequency.value = this.freqs[i];
		this.biquads[i].Q.value = 10;
		this.biquads[i].gain.value = 0;
	}
	for(i = 1; i < 10; i++) {
		this.biquads[i - 1].connect(this.biquads[i]);
	}
}

Sound.prototype.setEQValue = function(index, value) {
	this.biquads[index].gain.value = value;
}

//recoder
/*
Sound.prototype.getSpeaker = function () {
	navigator.getUserMedia({audio:true}, export.onSuccess, export.onError);
}
*/

function loadFile(ctx, url, node, callback) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';
	request.onload = function() {
		ctx.decodeAudioData(request.response, function(buffer) {
			node.buffer = buffer;
			if(callback && typeof callback === 'function') {
				callback(buffer);
			}
		}, function() {
			//decode fail
			alert('source not support');
		});
	};
	request.send();
}