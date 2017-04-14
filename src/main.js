var Main = function(v) {
    this.video = v; 
}
var lrc_time = [];
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
			this.lrcstr += this.lrc[i][1] + "=";
	   }
		if (i > 0 && this.lrc[i][0]) {
			lrc_time[i] = (this.lrc[i][0] - this.lrc[i - 1][0]).toFixed(2) * 1000;
	}
	}
	// var lrcalltxt = document.getElementById("lrcalltxt");
	var lrcList = this.lrcstr.split("=");
	var html = '';
	for (var i = 0; i < lrcList.length; i++) {
		html += "<div class='lyric-i'><span class='lyric-list lyric-" + i + "' id='lyric-" + i + "'>" + lrcList[i] + "</span></div>";
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
	var lr_j = 1;
	// console.log('-------this.lrc_time', lrc_time)
	that.video.addEventListener('timeupdate', function() {
		if(that.lrc.length != 0 && that.video.currentTime > that.lrc[0][0]) {
			console.log('-----that.lrc[0][0]', that.lrc[0][0])
			var str  = that.lrc[0][1];
			that.lrc.shift();
			if (str) {
				changeColor('lyric-' + lr_i, lrc_time[lr_j]);
				console.log(lrc_time[lr_j]);
				// $('.lyric-' + lr_i).addClass('active').siblings('p').removeClass('active');
				if (lr_i) {
					$('#lrc-go').css('margin-top', $('#lrc-go').css('margin-top').replace('px', '') - 32 + 'px');
				}
				lr_i++;
				lr_j += 2;
			}
			lrctxt.textContent = str;
		}
	}, false);
	var changeColor = function(textId, time) {
		function getStyle(elem, name) {
			if (elem.style[name])
				return elem.style[name];
			else if (elem.currentStyle)
				return elem.currentStyle[name];
			else if (document.defaultView && document.defaultView.getComputedStyle) {
				name = name.replace(/([A-Z])/g, "-$1");
				name = name.toLowerCase();
				var s = document.defaultView.getComputedStyle(elem, "");
				return s && s.getPropertyValue(name);
			} else return null;
		} //欢迎来到站长特效网，我们的网址是www.zzjs.net，很好记，zz站长，js就是js特效，本站收集大量高质量js代码，还有许多广告代码下载。
		// var lb = document.getElementById("zzjs_net"),
		var lb = document.getElementById(textId),
			lt = lb.cloneNode(true),
			i = 0,
			sw = parseInt(getStyle(lb, 'width'));
		lt.setAttribute('id', lb.getAttribute('id') + '1');
		lt.className = 'lyric-list red';
		lb.parentNode.appendChild(lt);
		// lt.style['transition-duration'] = time/1000+'s';
		// lt.style['width'] = getStyle(lb, 'width')
		window.sliderFont = setInterval(function() {
			parseInt(getStyle(lt, 'width')) >= sw ? clearInterval(window.sliderFont) : lt.style['width'] = i++ + 'px';
		}, getStyle(lt, 'width')/time);
		window.slidOver = setTimeout(function(){
			clearInterval(sliderFont);
			document.getElementById(lb.getAttribute('id') + '1').remove();
		},time+500)

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
	this.aplayer.play();
	
	this.audioRecord.recordStart();
	this.play();
}
Main.prototype.micStop = function() {
	this.audioRecord.recordStop(); 
	this.aplayer.pause(); 
	this.stop();
}

Main.prototype.saveAudioData = function(blob){  
	
	/*downloadFile(blob);
	
	function downloadFile (blob){
		var a = document.createElement('a');
		var url = window.URL.createObjectURL(blob);
		var filename = 'a.wav';
		a.href = url;
		a.download = filename;
		a.click();
		window.URL.revokeObjectURL(url);
	}*/
	
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