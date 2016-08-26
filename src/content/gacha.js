var minDelay, maxDelay;

(function() {
	var hash;
	var empty;
	var numTickets;
	
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(!("action" in request) || request.action !== "gacha") {
			return;
		}
		
		if(!("empty" in request) || !("numTickets" in request)) {
			return;
		}
		
		hash = window.location.hash;
		if(hash.length === 0 || !hash.startsWith("#event/")) {
			alert("Please navigate to the event page first.");
			return;
		}
		
		var gachaButtons = document.getElementsByClassName("btn-medal");
		if(gachaButtons.length === 0) {
			alert("Please navigate to the gacha page first.");
			return;
		}
		
		var single = gachaButtons[gachaButtons.length - 1];
		
		if(single.getAttribute("disable") === "true") {
			var tickets = getNumTickets(document);
		
			if(tickets > 1) {
				alert("The box is empty. Please reset the box and try again.");
			} else {
				alert("Out of tickets.");
			}
			
			return;
		}
		
		empty = request.empty;
		numTickets = request.numTickets;
		
		getUid(function(uid) {
			chrome.storage.sync.get({
				minDelay: 300,
				maxDelay: 800
			}, function(items) {
				minDelay = items.minDelay;
				maxDelay = items.maxDelay;
				
				gacha(uid, hash.replace(/^#event\/(.*?)(\/.*?)?$/, "$1"), empty, numTickets, document);
			});
		});
	});

	function gacha(uid, eventName, empty, max, doc) {
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
			var tickets = getNumTickets(doc);
			
			if(tickets > 1) {
				alert("Box emptied. You have " + tickets + " tickets remaining.");
			} else {
				alert("Out of tickets.");
			}
			
			return;
		}
		
		if(max !== null && max <= 0) {
			alert("Complete. You have " + getNumTickets(doc) + " tickets remaining.");
			return;
		}
		
		var id = single.getAttribute("data-id");
		var duplicate_key = single.getAttribute("data-duplicate-key");
		var count = 1;
		
		if(multi !== null) {
			count = multi.getAttribute("count");
		}
		
		if(max !== null && max < count * 2) {
			count = 1;
		}
		
		var time = Date.now();
		var url = window.location.origin + "/" + eventName + "/gacha/play?_=" + (time - 1) + "&t=" + time + "&uid=" + uid;
		
		var req = new XMLHttpRequest();
		req.open("POST", url);
		
		req.onload = function() {
			contentAction(uid, eventName, id, empty, (max === null ? max : (max - count * 2)));
		};
		
		req.send(JSON.stringify({special_token: null, gacha_id: id, count: count, duplicate_key: duplicate_key}));
	}

	function contentAction(uid, eventName, eventId, empty, max) {
		var time = Date.now();
		var url = window.location.origin + "/" + eventName + "/gacha/content/action/" + eventId + "?_=" + (time - 1) + "&t=" + time + "&uid=" + uid;
		
		var req = new XMLHttpRequest();
		req.open("GET", url);
		
		req.onload = function() {
			result1(uid, eventName, eventId, empty, max, time - 1);
		};
		
		req.send();
	}

	function result1(uid, eventName, eventId, empty, max, seq) {
		seq++;
		var time = Date.now();
		var url = window.location.origin + "/" + eventName + "/gacha/result/" + eventId + "?_=" + seq + "&t=" + time + "&uid=" + uid;
		
		var req = new XMLHttpRequest();
		req.open("GET", url);
		
		req.onload = function() {
			contentResult(uid, eventName, eventId, empty, max, seq);
		};
		
		req.send();
	}

	function contentResult(uid, eventName, eventId, empty, max, seq) {
		seq++;
		var time = Date.now();
		var url = window.location.origin + "/" + eventName + "/gacha/content/result/" + eventId + "?_=" + seq + "&t=" + time + "&uid=" + uid;
		
		var req = new XMLHttpRequest();
		req.open("GET", url);
		
		req.onload = function() {
			var docString = decodeURIComponent(JSON.parse(req.responseText).data);
			var doc = new DOMParser().parseFromString(docString, "text/html");
			
			result2(uid, eventName, eventId, empty, max, seq, doc);
		};
		
		req.send();
	}

	function result2(uid, eventName, eventId, empty, max, seq, doc) {
		seq++;
		var time = Date.now();
		var url = window.location.origin + "/" + eventName + "/gacha/result/" + eventId + "?_=" + seq + "&t=" + time + "&uid=" + uid;
		
		var req = new XMLHttpRequest();
		req.open("GET", url);
		
		req.onload = function() {
			var response = JSON.parse(req.responseText);
			if(!empty) {
				for(var i = 0; i < response.result.length; i++) {
					if(response.result[i].reward_rare_val == 4) {
						alert("SSR pulled. You have " + getNumTickets(doc) + " tickets remaining.");
						return;
					}
				}
			}
			
			if(max === 0) {
				var tickets = getNumTickets(doc);
				
				alert("Complete. You have " + getNumTickets(doc) + " tickets remaining.");
				return;
			}
			
			setTimeout(function() {
				gacha(uid, eventName, empty, max, doc);
			}, randomInt(minDelay, maxDelay));
		};
		
		req.send();
	}

	function getNumTickets(doc) {
		if(doc.getElementsByClassName("txt-gacha-point").length > 0) {
			return doc.getElementsByClassName("txt-gacha-point")[0].innerHTML;
		} else {
			return doc.getElementsByClassName("txt-medal-possessed")[0].innerHTML.replace(/[\D]/g, "");;
		}
	}
})();
