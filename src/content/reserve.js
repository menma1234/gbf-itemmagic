(function() {
    var summons;
    var uid, version;
    var startCount, endCount;
    var exp;
    
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if(!("action" in request) || request.action !== "reserve") {
            return;
        }
        
        if(!("summons" in request)) {
            return;
        }
        
        summons = request.summons;
        vesselId = summons ? 2 : 1;
        startCount = {};
        endCount = {};
        exp = 0;
        
        getUid(function(_uid) {
            uid = _uid;
            
            getVersion(function(_version) {
                version = _version;
                
                getList();
            });
        });
    });

    function getList() {
        var url = buildUrl("/recycling/recommend_list/" + vesselId, uid);
        
        var req = new XMLHttpRequest();
        req.open("GET", url);
        req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        req.setRequestHeader("X-VERSION", version);
        
        req.onload = function() {
            var response = JSON.parse(req.responseText);
            var list = response.recommend_list;
            
            if (Object.keys(startCount).length === 0) {
                if (!list) {
                    alert("No matching items found.");
                    return;
                }
                
                for (id in response.recycling_item.accumulate_exp_result) {
                    startCount[id] = +response.recycling_item.accumulate_exp_result[id].before_number;
                }
            }
            
            if (list) {
                doReserve(list.map(function(e) {
                    return e.id;
                }))
            } else {
                var message = "Result:\nTotal EXP gained: " + exp + "\nVessels gained: " + (endCount[vesselId] - startCount[vesselId]);
                if (!summons) {
                    message += "\nSSR Skill Points gained: " + (endCount[3] - startCount[3]);
                    message += "\nSR Skill Points gained: " + (endCount[4] - startCount[4]);
                    message += "\nR Skill Points gained: " + (endCount[5] - startCount[5]);
                }
                alert(message);
            }
        };
        
        req.onerror = function() {
            alert("An error occurred while trying to get the recommended items to reserve.");
        };
        
        req.send();
    }

    function doReserve(ids) {
        var url = buildUrl("/recycling/execute", uid);
        
        var req = new XMLHttpRequest();
        req.open("POST", url);
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        req.setRequestHeader("X-VERSION", version);
        
        req.onload = function() {
            var response = JSON.parse(req.responseText);
            
            exp += response.accumulate_exp_result[vesselId].exp;
            for (id in response.accumulate_exp_result) {
                endCount[id] = response.accumulate_exp_result[id].after_number
            }
            getList();
        };
        
        req.onerror = function() {
            alert("An error occurred while trying to execute reserving.");
        };
        
        req.send(JSON.stringify({
            special_token: null,
            materials: ids,
            possession_type: vesselId,
            is_recommend: true
        }));
    }
})();
