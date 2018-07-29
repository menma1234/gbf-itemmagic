(function() {
    var summons, stashNum;
    var uid, version;
    var startCount = null;
    
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if(!("action" in request) || request.action !== "reserve") {
            return;
        }
        
        if(!("summons" in request)) {
            return;
        }
        
        summons = request.summons;
        
        getUid(function(_uid) {
            uid = _uid;
            
            getVersion(function(_version) {
                version = _version;
                
                getList(1, []);
            });
        });
    });

    function getList(index, list) {
        var url = buildUrl("/" + (summons ? "summon" : "weapon") + "/list/" + index + "/7", uid);
        
        var req = new XMLHttpRequest();
        req.open("POST", url);
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        req.setRequestHeader("X-VERSION", version);
        
        req.onload = function() {
            var response = JSON.parse(req.responseText);
            
            for(var i = 0; i < response.list.length; i++) {
                var entry = response.list[i];
                if(entry.param.quality === "0" && ((summons && angelSummonIds.indexOf(entry.master.id) >= 0) || (!summons && angelWeaponIds.indexOf(entry.master.id) >= 0))) {
                    list.push(entry);
                }
            }
            
            if(response.next <= index) {
                // Done
                if(list.length === 0) {
                    alert("No angels were found in your inventory.");
                    return;
                }
                
                if(window.confirm(list.length + " angel " + (summons ? "summon" : "weapon") + (list.length > 1 ? "s" : "") + " will be reserved.")) {
                    var ids = list.map(function(val) {
                        return +val.param.id;
                    });
                    
                    confirmReserve(ids, 0);
                }
            } else {
                // There are more pages, keep going
                getList(index + 1, list);
            }
        };
        
        req.onerror = function() {
            alert("An error occurred while trying to get the contents of your inventory.");
        };
        
        req.send(JSON.stringify({special_token: null, is_new: false, status: 1}));
    }

    function confirmReserve(ids, exp) {
        var url = buildUrl("/recycling/confirm");
        
        var req = new XMLHttpRequest();
        req.open("POST", url);
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        req.setRequestHeader("X-VERSION", version);
        
        req.onload = function() {
            if (startCount === null) {
                var response = JSON.parse(req.responseText);
                startCount = +response.before_number;
            }
            
            doReserve(ids, exp);
        };
        
        req.onerror = function() {
            alert("An error occurred while trying to confirm reserving.");
        };
        
        req.send(JSON.stringify({
            special_token: null,
            materials: ids.slice(0, 20),
            possession_type: summons ? 2 : 1
        }));
    }

    function doReserve(ids, exp) {
        var url = buildUrl("/recycling/execute", uid);
        
        var req = new XMLHttpRequest();
        req.open("POST", url);
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        req.setRequestHeader("X-VERSION", version);
        
        req.onload = function() {
            var response = JSON.parse(req.responseText);
            
            exp += response.exp;
            if (ids.length > 0) {
                confirmReserve(ids, exp);
            } else {
                alert("Result:\nTotal EXP gained: " + exp + "\nVessels gained: " + (response.after_number - startCount));
            }
        };
        
        req.onerror = function() {
            alert("An error occurred while trying to execute reserving.");
        };
        
        req.send(JSON.stringify({
            special_token: null,
            materials: ids.splice(0, 20),
            possession_type: summons ? 2 : 1
        }));
    }
})();
