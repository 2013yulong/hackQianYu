var LrcCtrl = function(_main) {
	this.main = _main;
}
LrcCtrl.prototype.parse = function(lrcStr) { 
	var lrc = new LrcParse();
	return lrc.parseLrc(lrcStr);
} 