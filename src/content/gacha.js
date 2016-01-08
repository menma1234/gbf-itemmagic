chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(!("action" in request) || request.action !== "gacha") {
			return;
		}
		
		if(!("empty" in request) || !("uid" in request)) {
			return;
		}
		
		var hash = window.location.hash;
		if(hash.length === 0 || !hash.startsWith("#event/")) {
			alert("Please navigate to the event page first.");
			return;
		}
		
		var gachaButtons = document.getElementsByClassName("btn-medal");
		if(gachaButtons.length === 0) {
			alert("Please navigate to the event page first.");
			return;
		}
		
		var single = gachaButtons[gachaButtons.length - 1];
		
		if(single.getAttribute("disable") === "true") {
			var tickets = document.getElementsByClassName("txt-gacha-point")[0].innerHTML;
		
			if(tickets > 0) {
				alert("The box is empty. Please reset the box and try again.");
			} else {
				alert("Out of tickets.");
			}
			
			return;
		}
		
		gacha(request.uid, hash.replace(/^#event\/(.*?)(\/.*?)?$/, "$1"), request.empty, document);
	});

function gacha(uid, eventName, empty, doc) {
	var gachaButtons = doc.getElementsByClassName("btn-medal");
	var multi, single;
	
	if(gachaButtons.length === 2) {
		multi = gachaButtons[0];
		single = gachaButtons[1];
	} else {
		multi = null;
		single = gachaButtons[0];
	}
	
	if(single.getAttribute("disable") === "true") {
		var tickets = doc.getElementsByClassName("txt-gacha-point")[0].innerHTML;
		
		if(tickets > 1) {
			alert("Box emptied. You have " + tickets + " tickets remaining.");
		} else {
			alert("Out of tickets.");
		}
		
		return;
	}
	
	var id = multi.getAttribute("data-id");
	var duplicate_key = multi.getAttribute("data-duplicate-key");
	var count = multi.getAttribute("count");
	
	var time = Date.now();
	var url = "http://gbf.game.mbga.jp/" + eventName + "/gacha/play?_=" + (time - 1) + "&t=" + time + "&uid=" + uid;
	
	var req = new XMLHttpRequest();
	req.open("POST", url);
	
	req.onload = function() {
			contentAction(uid, eventName, id, empty);
		};
	
	req.send(JSON.stringify({special_token: null, gacha_id: id, count: count, duplicate_key: duplicate_key}));
}

function contentAction(uid, eventName, eventId, empty) {
	var time = Date.now();
	var url = "http://gbf.game.mbga.jp/" + eventName + "/gacha/content/action/" + eventId + "?_=" + (time - 1) + "&t=" + time + "&uid=" + uid;
	
	var req = new XMLHttpRequest();
	req.open("GET", url);
	
	req.onload = function() {
			result1(uid, eventName, eventId, empty, time - 1);
		};
	
	req.send();
}

function result1(uid, eventName, eventId, empty, seq) {
	seq++;
	var time = Date.now();
	var url = "http://gbf.game.mbga.jp/" + eventName + "/gacha/result/" + eventId + "?_=" + seq + "&t=" + time + "&uid=" + uid;
	
	var req = new XMLHttpRequest();
	req.open("GET", url);
	
	req.onload = function() {
			contentResult(uid, eventName, eventId, empty, seq);
		};
	
	req.send();
}

function contentResult(uid, eventName, eventId, empty, seq) {
	seq++;
	var time = Date.now();
	var url = "http://gbf.game.mbga.jp/" + eventName + "/gacha/content/result/" + eventId + "?_=" + seq + "&t=" + time + "&uid=" + uid;
	
	var req = new XMLHttpRequest();
	req.open("GET", url);
	
	req.onload = function() {
			var docString = decodeURIComponent(JSON.parse(req.responseText).data);
			var doc = new DOMParser().parseFromString(docString, "text/html");
			
			result2(uid, eventName, eventId, empty, seq, doc);
		};
	
	req.send();
}

function result2(uid, eventName, eventId, empty, seq, doc) {
	seq++;
	var time = Date.now();
	var url = "http://gbf.game.mbga.jp/" + eventName + "/gacha/result/" + eventId + "?_=" + seq + "&t=" + time + "&uid=" + uid;
	
	var req = new XMLHttpRequest();
	req.open("GET", url);
	
	req.onload = function() {
			var response = JSON.parse(req.responseText);
			if(!empty) {
				for(var i = 0; i < response.result.length; i++) {
					if(response.result[i].reward_rare_val == 4) {
						var tickets = document.getElementsByClassName("txt-gacha-point")[0].innerHTML;
				
						alert("SSR pulled. You have " + tickets + " tickets remaining.");
						return;
					}
				}
			}
			
			setTimeout(function() {
					gacha(uid, eventName, empty, doc);
				}, 200);
		};
	
	req.send();
}
