// Background service worker for Color Contrast Checker

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'contentScriptLoaded') {
    console.log('Content script loaded in:', sender.tab.url);
    sendResponse({ success: true });
  }

  // Forward messages between popup and content script
  if (message.action === 'startColorPicking') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && !tabs[0].url.startsWith('chrome://')) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'startColorPicking' }, (response) => {
          sendResponse(response);
        });
      }
    });
    return true; // Keep message channel open for async response
  }

  if (message.action === 'stopColorPicking') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'stopColorPicking' });
      }
    });
    sendResponse({ success: true });
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Color Contrast Checker installed');
  } else if (details.reason === 'update') {
    console.log('Color Contrast Checker updated');
  }
});
