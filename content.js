document.addEventListener('contentScriptRemoved', () => {
  console.log('Previous content script instance received cleanup signal');
  observer?.disconnect();
});
console.log("YouTube Content Filter running...");

let disallowedTopics = [];
let hideSettings = {};

function loadSettings() {
  chrome.storage.sync.get(['disallowedTopics', 'hideSettings'], (data) => {
    disallowedTopics = data.disallowedTopics || [];
    hideSettings = data.hideSettings || {};
    console.log("Settings loaded:", { disallowedTopics, hideSettings });
    applyAllFilters();
  });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    if (changes.disallowedTopics) {
      disallowedTopics = changes.disallowedTopics.newValue || [];
    }
    if (changes.hideSettings) {
      hideSettings = changes.hideSettings.newValue || {};
    }
    console.log("Settings updated, applying filters...");
    applyAllFilters();
  }
});

function applyAllFilters() {
  filterVideos();
  hideSections();
}

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
  // Home Feed
  if (hideSettings.hideHomeFeed) {
    document.querySelector('ytd-browse[page-subtype="home"] #contents')?.style.setProperty('display', 'none', 'important');
  }

  // Video Sidebar (recommendations next to video)
  if (hideSettings.hideVideoSidebar) {
    document.querySelector('#secondary')?.style.setProperty('display', 'none', 'important');
  }

  // Recommended videos
  if (hideSettings.hideRecommended) {
    document.querySelectorAll('ytd-recommendation-section').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  }

  // Live Chat
  if (hideSettings.hideLiveChat) {
    document.querySelector('ytd-live-chat-frame')?.style.setProperty('display', 'none', 'important');
  }

  // Playlist
  if (hideSettings.hidePlaylist) {
    document.querySelector('ytd-playlist-panel-renderer')?.style.setProperty('display', 'none', 'important');
  }

  // Fundraiser
  if (hideSettings.hideFundraiser) {
    document.querySelector('ytd-fundraiser-renderer')?.style.setProperty('display', 'none', 'important');
  }

  // End Screen Feed
  if (hideSettings.hideEndScreenFeed) {
    document.querySelector('ytd-watch-next-secondary-results-renderer')?.style.setProperty('display', 'none', 'important');
  }

  // End Screen Cards
  if (hideSettings.hideEndScreenCards) {
    document.querySelectorAll('.ytp-ce-element').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  }

  // Shorts
  if (hideSettings.hideShorts) {
    document.querySelectorAll('[is-shorts]').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
    document.querySelectorAll('[title="Shorts"]').forEach(el => {
      el.closest('ytd-rich-section-renderer, ytd-reel-shelf-renderer')?.style.setProperty('display', 'none', 'important');
    });
  }

  // Comments
  if (hideSettings.hideComments) {
    document.querySelector('ytd-comments')?.style.setProperty('display', 'none', 'important');
  }

  // Mixes
  if (hideSettings.hideMixes) {
    document.querySelectorAll('ytd-radio-renderer').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  }

  // Merch, Tickets, Offers
  if (hideSettings.hideMerch) {
    document.querySelectorAll('ytd-merch-shelf-renderer').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  }

  // Video Info (description, etc.)
  if (hideSettings.hideVideoInfo) {
    document.querySelector('#info')?.style.setProperty('display', 'none', 'important');
  }

  // Top Header
  if (hideSettings.hideTopHeader) {
    document.querySelector('#masthead-container')?.style.setProperty('display', 'none', 'important');
  }

  // Notifications
  if (hideSettings.hideNotifications) {
    document.querySelector('ytd-notification-topbar-button-renderer')?.style.setProperty('display', 'none', 'important');
  }

  // Inapt Search Results
  if (hideSettings.hideInaptSearchResults) {
    document.querySelectorAll('ytd-search-pyv-renderer').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  }

  // Explore, Trending
  if (hideSettings.hideExploreTrending) {
    document.querySelectorAll('ytd-guide-entry-renderer a[title="Explore"], ytd-guide-entry-renderer a[title="Trending"]').forEach(el => {
      el.closest('ytd-guide-entry-renderer')?.style.setProperty('display', 'none', 'important');
    });
  }

  // More from YouTube
  if (hideSettings.hideMoreFromYouTube) {
    document.querySelectorAll('ytd-horizontal-card-list-renderer').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  }

  // Subscriptions
  if (hideSettings.hideSubscriptions) {
    document.querySelector('ytd-browse[page-subtype="subscriptions"] #contents')?.style.setProperty('display', 'none', 'important');
  }

  // Autoplay
  if (hideSettings.disableAutoplay) {
    const checkbox = document.querySelector('#toggle');
    if (checkbox && checkbox.checked) {
      checkbox.click();
    }
  }
}

// MutationObserver to handle dynamic content
const observer = new MutationObserver((mutations) => {
  applyAllFilters();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false
});

// Initial load
loadSettings();