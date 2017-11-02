(function() {
	var uid;
	
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(!("action" in request) || request.action !== "ship") {
			return;
		}
		
		getUid(function(uidResult) {
			uid = uidResult;
            getRecommendedMaterial();
		});
	});

	function getRecommendedMaterial() {
		var url = buildUrl("/recommend/recommend_guildship_material/", uid);
		
		var req = new XMLHttpRequest();
		req.open("GET", url);
		
		req.onload = function() {
			var data = JSON.parse(req.responseText);
            var materials = data.material_list;
            
            if (materials.length) {
                confirm(materials);
            } else {
                alert("Complete.");
            }
		};
		
		req.send();
	}
	
	function confirm(materials) {
		var url = buildUrl("/guild_airship/weapon_strength_confirm", uid);
		
		var req = new XMLHttpRequest();
		req.open("POST", url);
		
		req.onload = function() {
			var data = JSON.parse(req.responseText);
            var duplicateKey = data.duplicate_key;
			
            if (!data.success) {
                alert("An error occurred when confirming the materials. Please try again.\n\nDetails: " + req.responseText);
            } else {
                feed(materials, duplicateKey);
            }
		};
		
		req.send(JSON.stringify({special_token: null, select: materials}));
	}

	function feed(materials, duplicateKey) {
		var url = buildUrl("/guild_airship/weapon_strength", uid);
		
		var req = new XMLHttpRequest();
		req.open("POST", url);
		
		req.onload = function() {
			var data = JSON.parse(req.responseText);
			
            if (!data.success) {
                alert("An error occurred when feeding the materials. Please try again.\n\nDetails: " + req.responseText);
            } else {
                getRecommendedMaterial(materials, duplicateKey);
            }
		};
		
		req.send(JSON.stringify({special_token: null, select: materials, duplicate_key: duplicateKey}));
	}
})();
