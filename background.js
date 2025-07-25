chrome.action.onClicked.addListener((tab) => {
    console.log("Extension icon clicked!");
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  });
  