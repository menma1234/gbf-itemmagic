function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getUid(callback) {
	var func = function(e) {
		window.removeEventListener("uid", func);
		callback(e.detail);
	}
	
	window.addEventListener("uid", func);
	
	var script = document.createElement("script");
	script.textContent = "(" + function() {
		var event = new CustomEvent("uid", {detail: Game.userId});
		window.dispatchEvent(event);
	} + ")();";
	
	document.head.appendChild(script);
	document.head.removeChild(script);
}
