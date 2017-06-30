const devilElementIds = ["1029900000", "1039900000"];
const angelSummonIds = ["2020021000", "2030017000"];
const angelWeaponIds = ["1020099000", "1020199000", "1020299000", "1020399000", "1020499000", "1020599000", "1020699000", "1020799000", "1020899000", "1020999000",
	"1030099000", "1030199000", "1030299000", "1030399000", "1030499000", "1030599000", "1030699000", "1030799000", "1030899000", "1030999000"];

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildUrl(location, uid, seq) {
	var time = Date.now();
	return window.location.origin + location + "?_=" + (seq || (time - 1)) + "&t=" + time + "&uid=" + uid;
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

function getVersion(callback) {
	var func = function(e) {
		window.removeEventListener("version", func);
		callback(e.detail);
	}
	
	window.addEventListener("version", func);
	
	var script = document.createElement("script");
	script.textContent = "(" + function() {
		var event = new CustomEvent("version", {detail: Game.version});
		window.dispatchEvent(event);
	} + ")();";
	
	document.head.appendChild(script);
	document.head.removeChild(script);
}
