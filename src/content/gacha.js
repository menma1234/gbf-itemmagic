(function() {
    var minDelay, maxDelay;
    var uid;
    var eventName;
    var empty;
    var max;
    var autoReset;
    var isEventEnded;
    var version;

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (!("action" in request) || request.action !== "gacha") {
            return;
        }
        
        if (!("empty" in request) || !("numTickets" in request) || !("autoReset" in request)) {
            return;
        }
        
        empty = request.empty;
        max = request.numTickets;
        autoReset = request.autoReset;
        
        var hash = window.location.hash;
        if (hash.length === 0 || !hash.startsWith("#event/")) {
            alert("Please navigate to the event page first.");
            return;
        }
        
        eventName = hash.replace(/^#event\/(.*?)(\/.*?)?$/, "$1");
        if (!eventName) {
            alert("Invalid event page URL.");
            return;
        }
        
        isEventEnded = hash.indexOf("end") >= 0;
        
        var gachaButtons = getGachaButtons(document);
        if (gachaButtons.length === 0) {
            alert("Please navigate to the gacha page first.");
            return;
        }
        
        if (!empty && autoReset && hasResetButton(document)) {
            resetBox(document, doGetUid);
            return;
        }
        
        doGetUid(document);
    });
    
    function doGetUid(doc) {
        getVersion(function(v) {
            version = v;
            getUid(function(uidResult) {
                uid = uidResult;
                chrome.storage.sync.get({
                    minDelay: 300,
                    maxDelay: 800
                }, function(items) {
                    minDelay = items.minDelay;
                    maxDelay = items.maxDelay;
                    
                    gacha(doc);
                });
            });
        });
    }
    
    function doBulkPull(id, bulkPullCost, bulkDetails) {
        var path = "/rest/gacha/bulk_play";
        if (bulkDetails.attributes["data-box-fill"].value) {
            path = "/rest/gacha/bulk_box_play";
        }
        var url = buildUrl(mungeRestUrl("/" + eventName + path), uid);
        
        var req = new XMLHttpRequest();
        req.open("POST", url);
        
        req.onload = function() {
            if(max) {
                max -= bulkPullCost;
            }
            contentAction(id);
        };
        
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify({special_token: null, gacha_id: id}));
    }
    
    function mungeRestUrl(url) {
        if (url.indexOf("rest") > -1 && url.indexOf("teamforce") > -1) {
            var parts = url.split("/");
            var restIndex, nameIndex;
            
            for (var i = 0; i < parts.length; i++) {
                if (parts[i] === "rest") {
                    restIndex = i;
                } else if (parts[i].indexOf("teamforce") > -1) {
                    nameIndex = i;
                }
            }
            
            parts[restIndex] = parts[nameIndex];
            parts[nameIndex] = "rest";
            
            url = parts.join("/");
        }
        
        return url;
    }

    function gacha(doc) {
        var gachaButtons = getGachaButtons(doc);
        var multi, single;
        
        if (gachaButtons.length === 2) {
            multi = gachaButtons[0];
            single = gachaButtons[1];
        } else {
            multi = null;
            single = gachaButtons[0];
        }
        
        if (single.getAttribute("disable") === "true") {
            var tickets = getNumTickets(doc);
            
            if (tickets > 1 && doc.getElementsByClassName("btn-reset").length) {
                if (!autoReset) {
                    alert("The box is empty. Please reset the box and try again.");
                } else {
                    resetBox(doc, gacha);
                }
            } else {
                alert("Out of tickets.");
            }
            
            return;
        }
        
        if (max !== null && max <= 0) {
            alert("Complete. You have " + getNumTickets(doc) + " tickets remaining.");
            return;
        }
        
        var id = parseInt(single.getAttribute("data-id"));
        
        var bulkDetails = doc.getElementById("js-btn-gacha-play-all");
        if (bulkDetails) {
            var bulkPullCost = parseInt(bulkDetails.attributes["data-consume"].value, 10);
            var shouldBulkPull = bulkDetails.attributes["data-can-bulk-play"].value && (max === null || max >= bulkPullCost);
            if (empty && shouldBulkPull) {
                doBulkPull(id, bulkPullCost, bulkDetails);
                return;
            }
        }
        
        var duplicateKey = single.getAttribute("data-duplicate-key");
        var count = 1;
        var cost = getSinglePullTicketCost(doc);
        
        if (multi !== null) {
            count = multi.getAttribute("count");
        }
        
        if (max !== null && max < count * cost) {
            count = 1;
        }
        
        var url = buildUrl(mungeRestUrl("/" + eventName + "/rest/gacha/play"), uid);
        
        var req = new XMLHttpRequest();
        req.open("POST", url);
        
        req.onload = function() {
            if (max) {
                max -= count * cost;
            }
            contentAction(id);
        };
        
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify({special_token: null, gacha_id: id, count: count, duplicate_key: duplicateKey}));
    }

    function contentAction(eventId) {
        var url = buildUrl("/" + eventName + "/gacha/content/action/" + eventId, uid);
        var seq = url.replace(/.*_=([\d]+).*/, "$1");
        
        var req = new XMLHttpRequest();
        req.open("GET", url);
        
        req.onload = function() {
            result1(eventId, seq);
        };
        
        req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        req.setRequestHeader("X-VERSION", version);
        req.send();
    }

    function result1(eventId, seq) {
        seq++;
        var url = buildUrl(mungeRestUrl("/" + eventName + "/rest/gacha/result/" + eventId), uid, seq);
        
        var req = new XMLHttpRequest();
        req.open("GET", url);
        
        req.onload = function() {
            contentResult(eventId, seq);
        };
        
        req.send();
    }

    function contentResult(eventId, seq) {
        seq++;
        var url = buildUrl("/" + eventName + "/gacha/content/result/" + eventId, uid, seq);
        
        var req = new XMLHttpRequest();
        req.open("GET", url);
        
        req.onload = function() {
            var docString = decodeURIComponent(JSON.parse(req.responseText).data);
            var doc = new DOMParser().parseFromString(docString, "text/html");
            
            result2(eventId, seq, doc);
        };
        
        req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        req.setRequestHeader("X-VERSION", version);
        req.send();
    }

    function result2(eventId, seq, doc) {
        seq++;
        var url = buildUrl(mungeRestUrl("/" + eventName + "/rest/gacha/result/" + eventId), uid, seq);
        
        var req = new XMLHttpRequest();
        req.open("GET", url);
        
        req.onload = function() {
            var response = JSON.parse(req.responseText);
            if (!empty) {
                for (var i = 0; i < response.result.length; i++) {
                    if (response.result[i].reward_rare_val == 4 || response.result[i].rareitem_flg) {
                        if (!autoReset) {
                            alert("SSR pulled. You have " + getNumTickets(doc) + " tickets remaining.");
                        } else {
                            if (hasResetButton(doc)) {
                                resetBox(doc, gacha);
                            } else {
                                alert("SSR pulled but can't reset. Please enable the option to not stop on SSR.");
                            }
                        }
                        return;
                    }
                }
            }
            
            if (max === 0) {
                alert("Complete. You have " + getNumTickets(doc) + " tickets remaining.");
                return;
            }
            
            setTimeout(function() {
                gacha(doc);
            }, randomInt(minDelay, maxDelay));
        };
        
        req.send();
    }
    
    function getGachaButtons(doc) {
        var gachaButtons = doc.getElementsByClassName("btn-medal");
        if (gachaButtons.length === 0) {
            gachaButtons = doc.getElementsByClassName("btn-gacha");
        }
        
        return gachaButtons;
    }

    function getNumTickets(doc) {
        var div = doc.querySelector(".txt-gacha-point");
        if (!div) {
            div = doc.querySelector(".txt-current-point");
        }
        
        return parseInt(div.textContent, 10);
    }

    function getSinglePullTicketCost(doc) {
        var costDiv = doc.querySelector(".prt-medal-obtain:not(.multi) .txt-medal-cost");
        if (!costDiv) {
            costDiv = doc.querySelector(".prt-gacha-obtain:not(.multi) .txt-gacha-cost");
        }
        
        if (costDiv) {
            return parseInt(costDiv.textContent, 10);
        }
        
        return null;
    }

    function hasResetButton(doc) {
        return doc.getElementsByClassName("btn-reset").length > 0;
    }

    function resetBox(doc, callback) {
        var resetButton = doc.getElementsByClassName("btn-reset")[0];
        var gachaId = parseInt(resetButton.getAttribute("data-gacha-id"), 10);
        var boxId = parseInt(resetButton.getAttribute("data-box-id"), 10);
        var duplicateKey = resetButton.getAttribute("data-duplicate-key");
        
        var url = buildUrl(mungeRestUrl("/" + eventName + "/rest/gacha/reset_box"), uid);
        
        var req = new XMLHttpRequest();
        req.open("POST", url);
        
        req.onload = function() {
            getGachaIndex(callback);
        };
        
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify({special_token: null, gacha_id: gachaId, box_id: boxId, duplicate_key: duplicateKey}));
    }
    
    function getGachaIndex(callback) {
        var url;
        if (eventName.startsWith("teamraid") || eventName.indexOf("teamforce") > -1) {
            url = buildUrl("/" + eventName + "/gacha/content/index", uid);
        } else {
            if (isEventEnded) {
                url = buildUrl("/" + eventName + "/end/content/newindex", uid);
            } else {
                url = buildUrl("/" + eventName + "/top/content/newindex", uid);
            }
        }
        
        var req = new XMLHttpRequest();
        req.open("GET", url);
        
        req.onload = function() {
            var docString = decodeURIComponent(JSON.parse(req.responseText).data);
            var doc = new DOMParser().parseFromString(docString, "text/html");
            
            callback(doc);
        };
        
        req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        req.setRequestHeader("X-VERSION", version);
        req.send();
    }
})();
