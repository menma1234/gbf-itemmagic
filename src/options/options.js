var initDone = false;

// Loads options from storage and populates the page
function restoreOptions() {
	chrome.storage.sync.get( {
			minDelay: 300,
			maxDelay: 800
		}, function(items) {
			document.getElementById("minDelay").value = items.minDelay;
			document.getElementById("maxDelay").value = items.maxDelay;
		});
}

// Save options to storage
function save() {
	var minDelay = parseInt(document.getElementById("minDelay").value);
	var maxDelay = parseInt(document.getElementById("maxDelay").value);
	
	if(isNaN(minDelay) || minDelay < 0) {
		minDelay = 300;
	}
	
	if(isNaN(maxDelay) || maxDelay < 0) {
		maxDelay = 800;
	}
	
	if(minDelay > maxDelay) {
		maxDelay = minDelay;
	}
	
	chrome.storage.sync.set( {
			minDelay: minDelay,
			maxDelay: maxDelay
		} );
}

// Add click handler for save button
function addHandlers() {
	if(initDone) {
		return;
	}
	
	document.getElementById("save").addEventListener("click", save);
	
	document.getElementById("minDelay").addEventListener("keydown", function() {
			if(event.keyCode === 13) {
				save();
			}
		});
	document.getElementById("maxDelay").addEventListener("keydown", function() {
			if(event.keyCode === 13) {
				save();
			}
		});
	
	initDone = true;
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.addEventListener("DOMContentLoaded", addHandlers);
