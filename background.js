var invalidURL = [
    "chrome://bookmarks/#1",
    "chrome://chrome/",
    "chrome://devices/",
    "chrome://extensions/",
    "chrome://help/",
    "chrome://history/",
    "chrome://settings/",
    "chrome://suggestions/",
    "chrome://thumbnails/",
];

chrome.browserAction.onClicked.addListener(function () {
    // Swap the window mode (normal or incognito)
    chrome.windows.getCurrent(function (window_) {
        let newWindowMode = !window_.incognito;

        chrome.windows.getAll(function (allWindows) {
            let windowId = getWindowIdToAddTo(allWindows, newWindowMode);
            chrome.tabs.query(
                { currentWindow: true, highlighted: true },
                function (tabList_) {
                    const tabList = tabList_.filter(
                        (tab) => invalidURL.indexOf(tab.url) === -1
                    );
                    const [first, ...rest] = tabList;

                    if (windowId === -1) {
                        chrome.windows.create(
                            { url: first.url, incognito: newWindowMode },
                            (newWindow) =>
                                removeTabAndMoveRemaining(
                                    newWindow.id,
                                    first.id,
                                    rest
                                )
                        );
                    } else {
                        moveTabs(windowId, tabList);
                    }
                }
            );
        });
    });
});

function moveTabs(windowId, tabs) {
    if (tabs.length == 0) {
        chrome.windows.update(windowId, {
            focused: true,
        });
        return;
    }

    const [tabToMove, ...remainingTabs] = tabs;
    chrome.tabs.create(
        { windowId: windowId, url: tabToMove.url, active: true },
        (_) => removeTabAndMoveRemaining(windowId, tabToMove.id, remainingTabs)
    );
}

function removeTabAndMoveRemaining(windowId, tabId, remainingTabs) {
    chrome.tabs.remove(tabId, (_) => moveTabs(windowId, remainingTabs));
}

function getWindowIdToAddTo(windows, windowMode) {
    for (const window of windows) {
        if (window.incognito === windowMode) {
            return window.id;
        }
    }
    return -1;
}
