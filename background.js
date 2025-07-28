chrome.action.onClicked.addListener(async (tab) => {
  console.log("Extension icon clicked - reloading content script");
  
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const event = new CustomEvent('contentScriptRemoved');
        document.dispatchEvent(event);
      }
    });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  } catch (error) {
    console.error('Injection failed:', error);
  }
});
  