let disallowedTopics = [];
let hideSettings = {};
let colorSettings = {};
let styleElements = {};

function loadSettings() {
  chrome.storage.sync.get(['disallowedTopics', 'hideSettings', 'colorSettings'], (data) => {
    disallowedTopics = data.disallowedTopics || [];
    hideSettings = data.hideSettings || {};
    colorSettings = data.colorSettings || {};
    applyAllFilters();
    applyColorSettings();
  });
}

function applyAllFilters() {
  filterVideos();
  hideSections();
}

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
          #guide, #guide-content, ytd-guide-renderer {
            background-color: rgb(${rgbValue}) !important;
          }
        `);
        break;

      case 'videoTitle':
        applyPersistentStyle('videoTitle', `
          #video-title {
            color: rgb(${rgbValue}) !important;
          }
        `);
        break;

      case 'ChipsBar':
        applyPersistentStyle('chipsBar', `
          #chips-wrapper.style-scope.ytd-feed-filter-chip-bar-renderer {
            background-color: rgb(${rgbValue}) !important;
          }
        `);
        break;

      case 'commentsBg':
        applyPersistentStyle('comments', `
          #comments {
            background-color: rgb(${rgbValue}) !important;
          }
        `);
        break;

      case 'Text':
        applyPersistentStyle('text', `
          body, body *:not(input):not(textarea):not(button) {
            color: rgb(${rgbValue}) !important;
          }
        `);
        break;

      case 'pageBg':
        applyPersistentStyle('page', `
          body, ytd-app, #content, #page-manager {
            background-color: rgb(${rgbValue}) !important;
          }
        `);
        break;
    }
  }
}

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
  if (hideSettings.hideHomeFeed) {
    document.querySelector('ytd-browse[page-subtype="home"] #contents')?.style.setProperty('display', 'none', 'important');
  }
  if (hideSettings.hideVideoSidebar) {
    document.querySelector('#secondary')?.style.setProperty('display', 'none', 'important');
  }
  if (hideSettings.hideRecommended) {
    document.querySelectorAll('ytd-recommendation-section').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  }
  if (hideSettings.hideLiveChat) {
    document.querySelector('ytd-live-chat-frame')?.style.setProperty('display', 'none', 'important');
  }
  if (hideSettings.hidePlaylist) {
    document.querySelector('ytd-playlist-panel-renderer')?.style.setProperty('display', 'none', 'important');
  }
  if (hideSettings.hideFundraiser) {
    document.querySelector('ytd-fundraiser-renderer')?.style.setProperty('display', 'none', 'important');
  }
  if (hideSettings.hideEndScreenFeed) {
    document.querySelector('ytd-watch-next-secondary-results-renderer')?.style.setProperty('display', 'none', 'important');
  }
  if (hideSettings.hideEndScreenCards) {
    document.querySelectorAll('.ytp-ce-element').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  }
  if (hideSettings.hideShorts) {
    document.querySelectorAll('[is-shorts]').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
    document.querySelectorAll('[title="Shorts"]').forEach(el => {
      el.closest('ytd-rich-section-renderer, ytd-reel-shelf-renderer')?.style.setProperty('display', 'none', 'important');
    });
  }
  if (hideSettings.hideComments) {
    document.querySelector('ytd-comments')?.style.setProperty('display', 'none', 'important');
  }
  if (hideSettings.hideMixes) {
    document.querySelectorAll('ytd-radio-renderer').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  }
  if (hideSettings.hideMerch) {
    document.querySelectorAll('ytd-merch-shelf-renderer').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  }
  if (hideSettings.hideVideoInfo) {
    document.querySelector('#info')?.style.setProperty('display', 'none', 'important');
  }
  if (hideSettings.hideTopHeader) {
    document.querySelector('#masthead-container')?.style.setProperty('display', 'none', 'important');
  }
  if (hideSettings.hideNotifications) {
    document.querySelector('ytd-notification-topbar-button-renderer')?.style.setProperty('display', 'none', 'important');
  }
  if (hideSettings.hideInaptSearchResults) {
    document.querySelectorAll('ytd-search-pyv-renderer').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  }
  if (hideSettings.hideExploreTrending) {
    document.querySelectorAll('ytd-guide-entry-renderer a[title="Explore"], ytd-guide-entry-renderer a[title="Trending"]').forEach(el => {
      el.closest('ytd-guide-entry-renderer')?.style.setProperty('display', 'none', 'important');
    });
  }
  if (hideSettings.hideMoreFromYouTube) {
    document.querySelectorAll('ytd-horizontal-card-list-renderer').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  }
  if (hideSettings.hideSubscriptions) {
    document.querySelector('ytd-browse[page-subtype="subscriptions"] #contents')?.style.setProperty('display', 'none', 'important');
  }
  if (hideSettings.disableAutoplay) {
    const checkbox = document.querySelector('#toggle');
    if (checkbox && checkbox.checked) {
      checkbox.click();
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'applyColor') {
    colorSettings[message.section] = message.color;
    applyColorSettings();
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    if (changes.disallowedTopics) disallowedTopics = changes.disallowedTopics.newValue || [];
    if (changes.hideSettings) hideSettings = changes.hideSettings.newValue || {};
    if (changes.colorSettings) colorSettings = changes.colorSettings.newValue || {};
    applyAllFilters();
  }
});

const observer = new MutationObserver(() => {
  applyAllFilters();
  applyColorSettings();
});

function initialize() {
  loadSettings();
  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });
  
  setInterval(() => {
    applyAllFilters();
    applyColorSettings();
  }, 5000);
}

initialize();