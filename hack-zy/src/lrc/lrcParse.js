var LrcParse = function(){
	
}
LrcParse.prototype.parseLrc = function(text){ 
	var lyric = text.split('\r\n'); //先按行分割
	var _l = lyric.length; //获取歌词行数
	var lrc = new Array(); //新建一个数组存放最后结果
	var timeExp = /\[(\d{2,})\:(\d{2})(?:\.(\d{2,3}))?\]/g
    , tagsRegMap = {
        title: 'ti'
      , artist: 'ar'
      , album: 'al'
      , offset: 'offset'
      , by: 'by'
    }
    ;
  
	for(i=0;i<_l;i++) {
	    var d = lyric[i].match(timeExp);  //正则匹配播放时间
	    var t = lyric[i].split(d); //以时间为分割点分割每行歌词，数组最后一个为歌词正文
	    if(d != null) { //过滤掉空行等非歌词正文部分
	        //换算时间，保留两位小数
	        var dt = String(d).split(':'); //不知道为什么一定要转换时间为字符串之后才能split，难道之前正则获取的时间已经不是字符串了么？ 
	        var _t = Math.round(parseInt(dt[0].split('[')[1])*60+parseFloat(dt[1].split(']')[0])*100)/100; //这一步我自己都觉得甚是坑爹啊！
	        lrc.push([_t, t[1]]);
	    }
	}
	return lrc; 
}
