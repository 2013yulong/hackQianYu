var Loader = function(_main) {
	this.main = _main;
}

Loader.prototype.loadlrc = function(url) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url);
	xhr.timeout = 5000;
	xhr.send();

	xhr.ontimeout = function(e) {
		console.log("load timeout");
	};

	xhr.onerror = function(e) {
		console.log("load error");
	};

	xhr.onclose = function(e) {
		console.log("load close");
	};

	xhr.onreadystatechange = function(e) {
		if(xhr.readyState == 4) {
			if(xhr.status == 200 || xhr.status == 206 || xhr.status == 304 || xhr.status == 416) {
				main.lrcloaded(xhr.response);
				
				xhr.abort();
			} else {
				console.log("load fail");
			}
		}
	}
}

