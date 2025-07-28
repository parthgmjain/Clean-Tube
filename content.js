
let disallowedTopics = [];
let hideSettings = {};
let colorSettings = {};

// ---- Load settings ----
function loadSettings() {
  chrome.storage.sync.get(['disallowedTopics', 'hideSettings'], (data) => {
    disallowedTopics = data.disallowedTopics || [];
    hideSettings = data.hideSettings || {};
    console.log("Settings loaded:", { disallowedTopics, hideSettings });
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
    console.log("Color settings loaded:", colorSettings);
    applyColorSettings();
  });
}

// ---- Apply all ----
function applyAllFilters() {
  filterVideos();
  hideSections();
}

function applyColorSettings() {
  for (const section in colorSettings) {
    const color = colorSettings[section];
    const rgb = `rgb(${color.R}, ${color.G}, ${color.B})`;

    switch (section) {
      case 'headerBg':
        document.querySelector('#masthead-container')?.style.setProperty('background-color', rgb, 'important');
        break;

      case 'sidebarBg':
        document.querySelector('#app')?.style.setProperty('background-color', rgb, 'important');
        break;

      case 'videoTitle':
        document.querySelectorAll('#video-title').forEach(el => el.style.setProperty('color', rgb, 'important'));
        break;

      case 'channelName':
        document.querySelectorAll('#channel-name').forEach(el => el.style.setProperty('color', rgb, 'important'));
        break;

      case 'commentsBg':
        document.querySelector('#comments')?.style.setProperty('background-color', rgb, 'important');
        break;

      case 'commentsText':
        document.querySelectorAll('#comments #content-text').forEach(el => el.style.setProperty('color', rgb, 'important'));
        break;

      case 'pageBg':
        document.body.style.setProperty('background-color', rgb, 'important');
        break;
    }
  }
}


// ---- Filters ----
function filterVideos() {
  const videos = document.querySelectorAll("ytd-rich-item-renderer, ytd-compact-video-renderer");

  videos.forEach(video => {
    const titleEl = video.querySelector("#video-title");
    const title = titleEl ? titleEl.textContent.toLowerCase() : "";

    const channelEl = video.querySelector("ytd-channel-name, #channel-name");
    const channel = channelEl ? channelEl.textContent.toLowerCase() : "";

    const isDisallowed = disallowedTopics.some(topic =>
      title.includes(topic.toLowerCase()) || channel.includes(topic.toLowerCase())
    );

    if (isDisallowed) {
      video.style.display = 'none';
    }
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
    document.querySelectorAll('ytd-recommendation-section').forEach(el => el.style.setProperty('display', 'none', 'important'));
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
    document.querySelectorAll('.ytp-ce-element').forEach(el => el.style.setProperty('display', 'none', 'important'));
  }
  if (hideSettings.hideShorts) {
    document.querySelectorAll('[is-shorts]').forEach(el => el.style.setProperty('display', 'none', 'important'));
    document.querySelectorAll('[title="Shorts"]').forEach(el => {
      el.closest('ytd-rich-section-renderer, ytd-reel-shelf-renderer')?.style.setProperty('display', 'none', 'important');
    });
  }
  if (hideSettings.hideComments) {
    document.querySelector('ytd-comments')?.style.setProperty('display', 'none', 'important');
  }
  if (hideSettings.hideMixes) {
    document.querySelectorAll('ytd-radio-renderer').forEach(el => el.style.setProperty('display', 'none', 'important'));
  }
  if (hideSettings.hideMerch) {
    document.querySelectorAll('ytd-merch-shelf-renderer').forEach(el => el.style.setProperty('display', 'none', 'important'));
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
    document.querySelectorAll('ytd-search-pyv-renderer').forEach(el => el.style.setProperty('display', 'none', 'important'));
  }
  if (hideSettings.hideExploreTrending) {
    document.querySelectorAll('ytd-guide-entry-renderer a[title="Explore"], ytd-guide-entry-renderer a[title="Trending"]').forEach(el => {
      el.closest('ytd-guide-entry-renderer')?.style.setProperty('display', 'none', 'important');
    });
  }
  if (hideSettings.hideMoreFromYouTube) {
    document.querySelectorAll('ytd-horizontal-card-list-renderer').forEach(el => el.style.setProperty('display', 'none', 'important'));
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

// ---- Handle messages ----
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'applyColor') {
    const { section, color } = message;
    const rgb = `rgb(${color.R}, ${color.G}, ${color.B})`;
    console.log(`Applying color to ${section}: ${rgb}`);

    switch (section) {
      case 'headerBg':
        document.querySelector('#masthead-container')?.style.setProperty('background-color', rgb, 'important');
        break;
      case 'sidebarBg':
        document.querySelector('#guide')?.style.setProperty('background-color', rgb, 'important');
        break;
      case 'videoTitle':
        document.querySelectorAll('#video-title').forEach(el => el.style.setProperty('color', rgb, 'important'));
        break;
      case 'channelName':
        document.querySelectorAll('#channel-name').forEach(el => el.style.setProperty('color', rgb, 'important'));
        break;
      case 'commentsBg':
        document.querySelector('#comments')?.style.setProperty('background-color', rgb, 'important');
        break;
      case 'commentsText':
        document.querySelectorAll('#comments #content-text').forEach(el => el.style.setProperty('color', rgb, 'important'));
        break;
      case 'pageBg':
        document.body.style.setProperty('background-color', rgb, 'important');
        break;
    }
  }
});

// ---- Watch for SPA navigation & changes ----
const observer = new MutationObserver(() => {
  applyAllFilters();
  applyColorSettings();
});

observer.observe(document.body, { childList: true, subtree: true });

// ---- React to any storage changes ----
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    if (changes.disallowedTopics) {
      disallowedTopics = changes.disallowedTopics.newValue || [];
    }
    if (changes.hideSettings) {
      hideSettings = changes.hideSettings.newValue || {};
    }
    if (Object.keys(changes).some(k =>
      k.includes('Bg') || k.includes('Title') || k.includes('Name') || k.includes('Text') || k.includes('pageBg')
    )) {
      loadColorSettings();
    }
    applyAllFilters();
    applyColorSettings();
  }
});

// ---- Init ----
loadSettings();
loadColorSettings();