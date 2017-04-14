navigator.getUserMedia = navigator.getUserMedia ||
	navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia ||
	navigator.msGetUserMedia;

window.URL = window.URL || window.webkitURL; 

if(navigator.getUserMedia) {
	// 支持
} else {
	// 不支持
	console.log("Don't support webrtc!");
}

 

var chunk = [],
	//mediaRecorder = null ,
	 
	source,recorder
	;
	
var canvas = document.getElementById("cvs");
var audioCtx = new (window.AudioContext || webkitAudioContext)();
var canvasCtx = canvas.getContext("2d");
var audioData ={};
var AudioRecord = function(_main) {
	this.main = _main;

	navigator.getUserMedia({
		audio: true,
		video: true
	}, onSuccess, onError);

}

AudioRecord.prototype.recordStart = function() { 
	mRecord.innerHTML = "ing";
	chunk = [];
	//mediaRecorder.start();
	source.connect(recorder);
	recorder.connect(audioCtx.destination);
	//console.log(mediaRecorder.state);
}

AudioRecord.prototype.recordStop = function() {
	mRecord.innerHTML = "record";

	//mediaRecorder.stop();
	recorder.disconnect();   
	main.saveAudioData(getBlob());
}

function getBlob(){ 
	return audioData.encodeWAV();
}
function onSuccess(stream) {
	 
   /*var options = { 
    mimeType : 'audio/webm'//audio/midi, audio/mpeg, audio/webm, audio/ogg, audio/wav
   }*/
     
	//mediaRecorder = new MediaRecorder(stream,options);
	var context = audioCtx;
	visualize(stream);
	
	source = context.createMediaStreamSource(stream);
    recorder = context.createScriptProcessor(4096, 1, 1);
	 
    var that = this;
	/*mediaRecorder.onstop = function(e) {
		var blob = new Blob(chunk, {
				'type': 'audio/wav;'
		}), 
		url = window.URL.createObjectURL(blob);
		var audioplayer = document.getElementById("audioplayer");
		audioplayer.src = url; 
		
		that.main.saveAudioData(blob);
	}

	mediaRecorder.ondataavailable = function(e) {
		chunk.push(e.data);
	}*/
	var config =  {};
    config.sampleBits = config.sampleBits || 8;      //采样数位 8, 16
    config.sampleRate = config.sampleRate || (44100 / 6);   //采样率(1/6 44100)

	audioData = {
            size: 0          //录音文件长度
            , buffer: []     //录音缓存
            , inputSampleRate: context.sampleRate    //输入采样率
            , inputSampleBits: 16       //输入采样数位 8, 16
            , outputSampleRate: config.sampleRate    //输出采样率
            , oututSampleBits: config.sampleBits       //输出采样数位 8, 16
            , input: function (data) {
                this.buffer.push(new Float32Array(data));
                this.size += data.length;
            }
            , compress: function () { //合并压缩
                //合并
                var data = new Float32Array(this.size);
                var offset = 0;
                for (var i = 0; i < this.buffer.length; i++) {
                    data.set(this.buffer[i], offset);
                    offset += this.buffer[i].length;
                }
                //压缩
                var compression = parseInt(this.inputSampleRate / this.outputSampleRate);
                var length = data.length / compression;
                var result = new Float32Array(length);
                var index = 0, j = 0;
                while (index < length) {
                    result[index] = data[j];
                    j += compression;
                    index++;
                }
                return result;
            }
            , encodeWAV: function () {
                var sampleRate = Math.min(this.inputSampleRate, this.outputSampleRate);
                var sampleBits = Math.min(this.inputSampleBits, this.oututSampleBits);
                var bytes = this.compress();
                var dataLength = bytes.length * (sampleBits / 8);
                var buffer = new ArrayBuffer(44 + dataLength);
                var data = new DataView(buffer);

                var channelCount = 1;//单声道
                var offset = 0;

                var writeString = function (str) {
                    for (var i = 0; i < str.length; i++) {
                        data.setUint8(offset + i, str.charCodeAt(i));
                    }
                }

                // 资源交换文件标识符 
                writeString('RIFF'); offset += 4;
                // 下个地址开始到文件尾总字节数,即文件大小-8 
                data.setUint32(offset, 36 + dataLength, true); offset += 4;
                // WAV文件标志
                writeString('WAVE'); offset += 4;
                // 波形格式标志 
                writeString('fmt '); offset += 4;
                // 过滤字节,一般为 0x10 = 16 
                data.setUint32(offset, 16, true); offset += 4;
                // 格式类别 (PCM形式采样数据) 
                data.setUint16(offset, 1, true); offset += 2;
                // 通道数 
                data.setUint16(offset, channelCount, true); offset += 2;
                // 采样率,每秒样本数,表示每个通道的播放速度 
                data.setUint32(offset, sampleRate, true); offset += 4;
                // 波形数据传输率 (每秒平均字节数) 单声道×每秒数据位数×每样本数据位/8 
                data.setUint32(offset, channelCount * sampleRate * (sampleBits / 8), true); offset += 4;
                // 快数据调整数 采样一次占用字节数 单声道×每样本的数据位数/8 
                data.setUint16(offset, channelCount * (sampleBits / 8), true); offset += 2;
                // 每样本数据位数 
                data.setUint16(offset, sampleBits, true); offset += 2;
                // 数据标识符 
                writeString('data'); offset += 4;
                // 采样数据总数,即数据总大小-44 
                data.setUint32(offset, dataLength, true); offset += 4;
                // 写入采样数据 
                if (sampleBits === 8) {
                    for (var i = 0; i < bytes.length; i++, offset++) {
                        var s = Math.max(-1, Math.min(1, bytes[i]));
                        var val = s < 0 ? s * 0x8000 : s * 0x7FFF;
                        val = parseInt(255 / (65535 / (val + 32768)));
                        data.setInt8(offset, val, true);
                    }
                } else {
                    for (var i = 0; i < bytes.length; i++, offset += 2) {
                        var s = Math.max(-1, Math.min(1, bytes[i]));
                        data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                    }
                }

                return new Blob([data], { type: 'audio/wav' });
            }
        };
	recorder.onaudioprocess = function (e) { 
      audioData.input(e.inputBuffer.getChannelData(0));  
    } 

}

function onError(error) {
	console.log("navigator.getUserMedia error: ", error);
}
 
function visualize(stream) {
  var source = audioCtx.createMediaStreamSource(stream);

  var analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  //analyser.connect(audioCtx.destination);
  
  WIDTH = canvas.width
  HEIGHT = canvas.height;

  draw();

  function draw() {

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    var sliceWidth = WIDTH * 1.0 / bufferLength;
    var x = 0;


    for(var i = 0; i < bufferLength; i++) {
 
      var v = dataArray[i] / 128.0;
      var y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();
    // $('#mRecord').css('')
  }
}