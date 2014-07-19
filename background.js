var currentUrl;
var newWindowMode;
var windowToAddTo = -1;

chrome.browserAction.onClicked.addListener(function(tab) {
	// Get the mode (normal or incognito) to change the tab to
	chrome.windows.getCurrent(function(window_) {
		newWindowMode = (window_.incognito == true ? false : true);
	});

	// Look for a existing window to add the tab to
	chrome.windows.getAll(function(allWindows) {
		for(var i = 0; i < allWindows.length; i++) {
			if(allWindows[i].incognito == newWindowMode) {
				windowToAddTo = allWindows[i].id;
			}
		}
	});

	// Perform the mode switch
	chrome.tabs.query({currentWindow: true, active: true}, function(tabList) {
		// Get the url of the current tab and encode it
		currentUrl = encodeURI(tabList[0].url);
		// Check if tab is a settings tab
		if(currentUrl.indexOf("chrome://") == -1) {
			if(windowToAddTo == -1) {
				chrome.windows.create({url: currentUrl, incognito: newWindowMode});
			}
			else {
				chrome.tabs.create({windowId: windowToAddTo, url: currentUrl, active: true});
				chrome.windows.update(windowToAddTo, {focused: true});
			}
			chrome.tabs.remove(tabList[0].id);
		}
	});
});