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
        startCount = null;
        endCount = null;
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
        var url = buildUrl("/recycling/recommend_list/" + (summons ? "2" : "1"), uid);
        
        var req = new XMLHttpRequest();
        req.open("GET", url);
        req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        req.setRequestHeader("X-VERSION", version);
        
        req.onload = function() {
            var response = JSON.parse(req.responseText);
            var list = response.recommend_list;
            
            if (startCount === null) {
                if (list === null) {
                    alert("No matching angels found.");
                }
                
                startCount = +response.recycling_item.before_number;
            }
            
            if (list !== null) {
                doReserve(list.map(function(e) {
                    return e.id;
                }))
            } else {
                alert("Result:\nTotal EXP gained: " + exp + "\nVessels gained: " + (endCount - startCount));
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
            
            exp += response.exp;
            endCount = response.after_number;
            getList();
        };
        
        req.onerror = function() {
            alert("An error occurred while trying to execute reserving.");
        };
        
        req.send(JSON.stringify({
            special_token: null,
            materials: ids,
            possession_type: summons ? 2 : 1,
            is_recommend: true
        }));
    }
})();
