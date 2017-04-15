var Main = function(v) {
    this.video = v; 
}
Main.prototype.initalize = function() {
	this.loader = new Loader(this);
	this.lrcCtrl = new LrcCtrl(this);
    this.audioRecord = new AudioRecord(this);
    this.audioEdit = new AudioEdit(this);
    
	this.loader.loadlrc("mediasrc/material.lrc");
}
Main.prototype.lrcloaded = function(lrcStr) {
	this.lrc = this.lrcCtrl.parse(lrcStr);
	var _l = this.lrc.length;
	this.lrcstr = "";
	var t =0;
	for(i=0;i<_l;i++) { 
	   if(this.lrc[i][1]!=""){
	   	t++;
	   	this.lrcstr += this.lrc[i][1] +"\n";
	   }
	    
	}
	var lrcalltxt = document.getElementById("lrcalltxt");
	console.log(this.lrcstr);
	lrcalltxt.rows = t;
	lrcalltxt.textContent = this.lrcstr;
}
Main.prototype.play = function() {
	this.video.play();
	
	var lrctxt = document.getElementById("lrctxt");
	var that = this;
	that.video.addEventListener('timeupdate', function() {
		if(that.lrc.length != 0 && that.video.currentTime > that.lrc[0][0]) {
			var str  = that.lrc[0][1];
			that.lrc.shift();
			console.log(str);
			lrctxt.textContent = str;
		}
	}, false);
}
Main.prototype.pause = function() {
	
}
Main.prototype.stop = function() {
	this.video.pause();
	
}
Main.prototype.micRecord = function() {
	this.video.src = "mediasrc/mute.mp4";
	this.aplayer = document.getElementById("aplayer");
	this.aplayer.src = "mediasrc/original.wav";
	//this.aplayer.play();
	
	this.audioRecord.recordStart();
	this.play();
}
Main.prototype.micStop = function() {
	this.audioRecord.recordStop(); 
	this.aplayer.pause(); 
	this.stop();
}

Main.prototype.saveAudioData = function(blob){  
	
	downloadFile(blob);
	
	function downloadFile (blob){
		var a = document.createElement('a');
		var url = window.URL.createObjectURL(blob);
		var filename = 'a.wav';
		a.href = url;
		a.download = filename;
		a.click();
		window.URL.revokeObjectURL(url);
	}
	
	var url = window.URL.createObjectURL(blob);
	this.audioplayer = document.getElementById("audioplayer");
	this.audioplayer.src = url; 
	 
		
	var loadedCallback = function(){
        document.getElementById('play').removeAttribute('disabled');
        document.getElementById('play').value = '播放';
    };
    
	var reader = new FileReader();
	var that = this;
	reader.addEventListener("loadend", function() {
	   // reader.result contains the contents of blob as a typed array
	   that.audioEdit.initalizeData(reader.result,loadedCallback);
	});
	reader.readAsArrayBuffer(blob);
}

Main.prototype.audioCtrl = function(type){ 
	switch(type){
		case "play":
		this.audioEdit.play(0);
		break;
		case "stop":
		this.audioEdit.stop();
		break;
		case "pause":
		this.audioEdit.suspend();
		break;
		case "resume":
		this.audioEdit.resume();
		break;
	}
	
	//var blob = new Blob([this.audioEdit.sound.sourceNode.buffer],{ type: 'audio/wav' })
	//this.audioplayer.src = window.URL.createObjectURL(blob);
}

Main.prototype.downloadFile = function(){
	window.URL = window.URL || window.webkitURL; 
	this.audioEdit.stop();
	//var blob = new Blob([this.audioEdit.sound.sourceNode.buffer],{ type: 'audio/wav' })
	var a = document.createElement('a');
	var url = window.URL.createObjectURL(getBlob());
	var filename = 'a.wav';
	a.href = url;
	a.download = filename;
	a.click();
	window.URL.revokeObjectURL(url);
	
	/*window.URL = window.URL || window.webkitURL;

	var blob = new Blob([new Uint8Array(binStream)], {type: "octet/stream"});
	
	var link = document.getElementById("link");
	link.href = window.URL.createObjectURL(blob);*/
}
