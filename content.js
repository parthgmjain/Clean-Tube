let disallowedTopics = [];
let hideSettings = {};
let colorSettings = {};
let styleElements = {};

// ---- Load settings ----
function loadSettings() {
  chrome.storage.sync.get(['disallowedTopics', 'hideSettings'], (data) => {
    disallowedTopics = data.disallowedTopics || [];
    hideSettings = data.hideSettings || {};
    applyAllFilters();
  });
}

function loadColorSettings() {
  chrome.storage.sync.get(null, (data) => {
    colorSettings = {};
    for (const key in data) {
      if (typeof data[key] === 'object' && 'R' in data[key]) {
        colorSettings[key] = data[key];
      }
    }
    applyColorSettings();
  });
}

// ---- Apply all ----
function applyAllFilters() {
  filterVideos();
  hideSections();
}

// ---- Persistent Style Application ----
function applyPersistentStyle(id, css) {
  if (!styleElements[id]) {
    styleElements[id] = document.createElement('style');
    styleElements[id].id = `yt-customizer-${id}`;
    document.head.appendChild(styleElements[id]);
  }
  styleElements[id].textContent = css;
}

function applyColorSettings() {
  for (const section in colorSettings) {
    const color = colorSettings[section];
    const rgbValue = `${color.R}, ${color.G}, ${color.B}`;

    switch (section) {
      case 'headerBg':
        applyPersistentStyle('header', `
          #masthead-container, ytd-app-header {
            background-color: rgb(${rgbValue}) !important;
          }
        `);
        break;

      case 'sidebarBg':
        applyPersistentStyle('sidebar', `
          #guide, #guide-content, ytd-guide-renderer,
          #guide-inner-content, #sections, #items {
            background-color: rgb(${rgbValue}) !important;
          }
          ytd-guide-entry-renderer {
            background-color: transparent !important;
          }
          #title, #label {
            color: white !important;
          }
        `);
        break;

      case 'pageBg':
        applyPersistentStyle('page', `
          body, ytd-app, #content, #page-manager, #primary, #contents,
          ytd-rich-grid-renderer, ytd-two-column-browse-results-renderer,
          #secondary, #player-container {
            background-color: rgb(${rgbValue}) !important;
          }
          ytd-rich-item-renderer {
            background-color: transparent !important;
          }
        `);
        break;

      case 'videoTitle':
        document.querySelectorAll('#video-title').forEach(el => 
          el.style.setProperty('color', `rgb(${rgbValue})`, 'important'));
        break;

      case 'channelName':
        document.querySelectorAll('#channel-name').forEach(el => 
          el.style.setProperty('color', `rgb(${rgbValue})`, 'important'));
        break;

      case 'commentsBg':
        document.querySelector('#comments')?.style.setProperty(
          'background-color', `rgb(${rgbValue})`, 'important');
        break;

        case 'commentsText':
          applyPersistentStyle('allText', `
            *:not(input):not(textarea):not(button):not(a):not(.ytp-progress-bar) {
              color: rgb(${rgbValue}) !important;
            }
            a, a * {
              color: rgb(${Math.min(255, color.R + 40)}, 
                      ${Math.min(255, color.G + 40)}, 
                      ${Math.min(255, color.B + 40)}) !important;
            }
          `);
          break;
    }
  }
}

// ---- Filters ----
function filterVideos() {
  const videos = document.querySelectorAll("ytd-rich-item-renderer, ytd-compact-video-renderer");
  videos.forEach(video => {
    const titleEl = video.querySelector("#video-title");
    const title = titleEl?.textContent.toLowerCase() || "";
    const channelEl = video.querySelector("ytd-channel-name, #channel-name");
    const channel = channelEl?.textContent.toLowerCase() || "";
    const isDisallowed = disallowedTopics.some(topic =>
      title.includes(topic.toLowerCase()) || channel.includes(topic.toLowerCase())
    );
    if (isDisallowed) video.style.display = 'none';
  });
}

function hideSections() {
  // ... (keep your existing hideSections implementation exactly the same)
}

// ---- Mutation Observer ----
const observer = new MutationObserver((mutations) => {
  const needsUpdate = mutations.some(mutation => 
    mutation.addedNodes.length > 0 || 
    mutation.attributeName === 'class'
  );
  if (needsUpdate) debouncedApplyChanges();
});

let applyTimeout;
function debouncedApplyChanges() {
  clearTimeout(applyTimeout);
  applyTimeout = setTimeout(() => {
    applyAllFilters();
    applyColorSettings();
  }, 300);
}

// ---- Message Handling ----
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'applyColor') {
    colorSettings[message.section] = message.color;
    applyColorSettings();
  }
});

// ---- Storage Change Listener ----
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    if (changes.disallowedTopics) disallowedTopics = changes.disallowedTopics.newValue || [];
    if (changes.hideSettings) hideSettings = changes.hideSettings.newValue || {};
    Object.keys(changes).forEach(key => {
      if (typeof changes[key].newValue === 'object' && 'R' in changes[key].newValue) {
        colorSettings[key] = changes[key].newValue;
      }
    });
    applyAllFilters();
    applyColorSettings();
  }
});

// ---- Initialization ----
function initialize() {
  loadSettings();
  loadColorSettings();
  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });
  
  // Backup periodic application
  setInterval(applyColorSettings, 5000);
  
  // YouTube navigation event listener
  window.addEventListener('yt-navigate-start', debouncedApplyChanges);
}

initialize();