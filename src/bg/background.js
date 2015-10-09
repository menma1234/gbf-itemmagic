chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(!("summons" in request) || !("rarity" in request) || !("angels" in request) || !("uid" in request) || !("tabId" in request)) {
			return;
		}
		
		chrome.tabs.sendMessage(request.tabId, request);
	});
