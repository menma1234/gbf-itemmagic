chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(!("tabId" in request)) {
			return;
		}
		
		chrome.tabs.sendMessage(request.tabId, request);
	});
