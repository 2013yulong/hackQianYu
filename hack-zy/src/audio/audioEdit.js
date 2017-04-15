var AudioEdit = function(_main) {
	this.main = _main;
	this.sound = new Sound();
	
	
	this.isplay = false;
	this.buffer = null;
}

AudioEdit.prototype.initalizeData = function(data, callback) {
	var that = this;
	this.sound.ctx.decodeAudioData(data, function(buffer) {
		that.buffer = buffer;
		if(callback && typeof callback === 'function') {
			callback();
		}
	}, function() {
		//decode fail
		alert('source not support');
	});

    this.sound.loadBase();
    this.sound.loadReverber();
    this.sound.loadEQ();
    this.sound.load3D(); 
    
	this.sound.volumeNode.connect(this.sound.startGain);
	this.sound.endGain.connect(this.sound.biquads[0]);
	this.sound.biquads[9].connect(this.sound.panner);
	this.sound.panner.connect(this.sound.destinationNode);
}

AudioEdit.prototype.setLoop = function(start, end) {
	//设置开始和结束时间循环
	this.sound.setLoop(start, end); 
	
}
AudioEdit.prototype.play = function(offset) { 
	if(this.isplay){
		this.stop(); 
	}
	this.sound.loadSource(this.buffer);
	this.sound.play(offset); 
	this.isplay = true;
	
	this.scriptNode = this.sound.ctx.createScriptProcessor(4096, 1, 1); 
	audioData.buffer = [];
	audioData.size = 0;
	audioData.inputSampleRate = audioCtx.sampleRate;
	this.scriptNode.onaudioprocess = function (e) { 
      audioData.input(e.inputBuffer.getChannelData(0));  
    } 
	this.sound.sourceNode.connect(this.scriptNode );
	this.scriptNode.connect(this.sound.ctx.destination);
}
AudioEdit.prototype.stop = function() { 
	this.sound.stop();
	this.isplay = false;
	
	this.sound.sourceNode.disconnect(this.scriptNode );
	this.scriptNode.disconnect(this.sound.ctx.destination);
}
AudioEdit.prototype.suspend = function() { 
	this.sound.suspend();
}
AudioEdit.prototype.resume = function() { 
	this.sound.resume();
}
AudioEdit.prototype.pos = function(loc) { 
	if(loc === "x")
	   this.sound.setPos(-1, 0, 0);
	else if(loc === "y")
	   this.sound.setPos(0, -1, 0);
	else
	   this.sound.setPos(0, 0, -1);
}
AudioEdit.prototype.setReverber = function(type) { 
	this.sound.setReverber(type);
}
AudioEdit.prototype.setVolume = function(num) { 
	this.sound.setVolume(num);
}
AudioEdit.prototype.setEQValue = function(arr) { 
	var len = arr.length;
	if(len === 0){
		for (i = 0; i < 10; i ++) {
	 		this.sound.setEQValue(i, 0);
	    }
	}else{
		for (i = 0; i < len; i ++) {
	 		this.sound.setEQValue(i,arr[i]);
	    } 
	}
	
}