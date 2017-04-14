var Main = function(v) {
    this.video = v;
    this.lrc_time = '';
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
	// console.log('--------this.lrc',this.lrc[0][0])
	var _l = this.lrc.length;
	this.lrcstr = "";
	var t =0;
	for(i=0;i<_l;i++) { 
	   if(this.lrc[i][1]!=""){
	   	t++;
	   	// this.lrcstr += "<p class='lyric"+i+"'>"+this.lrc[i][1] +"</p>";
	   	this.lrcstr += this.lrc[i][1] +"=";
	   }
	   if (i>0&&this.lrc[i][0]) {
	   		this.lrc_time[i] = this.lrc[i][0] - this.lrc[i - 1][0];
	   }
	}
	console.log('--------this.lrc_time',this.lrc_time)
	// var lrcalltxt = document.getElementById("lrcalltxt");
	var lrcList = this.lrcstr.split("=");
	var html = '';
	for (var i=0; i < lrcList.length; i++) {
		html += "<p class='lyric-list lyric-"+i+"'>"+ lrcList[i] +"</p>";
	};
	var lrcalltxt = $("#lrc-go");
	// lrcalltxt.rows = '3'//ts;
	// lrcalltxt.textContent = this.lrcstr;
	lrcalltxt.append(html);
}
Main.prototype.play = function() {
	this.video.play();
	
	var lrctxt = document.getElementById("lrctxt");
	var that = this;
	var lr_i = 0;
	that.video.addEventListener('timeupdate', function() {
		if(that.lrc.length != 0 && that.video.currentTime > that.lrc[0][0]) {
			console.log('-----that.lrc[0][0]',that.lrc[0][0])
			var str  = that.lrc[0][1];
			that.lrc.shift();
			console.log(str);
			if (str) {
				$('.lyric-'+lr_i).addClass('active').siblings('p').removeClass('active');
				if (lr_i) {
					$('#lrc-go').css('margin-top',$('#lrc-go').css('margin-top').replace('px','') - 32 + 'px');
				}
				lr_i++;
			}
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
	this.audioRecord.recordStart();
	this.play();
}
Main.prototype.micStop = function() {
	this.audioRecord.recordStop(); 
	this.stop();
}

Main.prototype.saveAudioData = function(blob){ 
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
		this.audioEdit.sound.play(0);
		break;
		case "stop":
		this.audioEdit.sound.stop();
		break;
		case "pause":
		this.audioEdit.sound.suspend();
		break;
		case "resume":
		this.audioEdit.sound.resume();
		break;
	}
	
	//var blob = new Blob([this.audioEdit.sound.sourceNode.buffer],{ type: 'audio/wav' })
	//this.audioplayer.src = window.URL.createObjectURL(blob);
}
