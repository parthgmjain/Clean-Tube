console.log("Running disallowed filter...");

let disallowedTopics = [];

// Load topics from storage
chrome.storage.sync.get(['disallowedTopics'], (data) => {
  disallowedTopics = data.disallowedTopics || [];
  console.log("Disallowed:", disallowedTopics);
  filterVideos();
});

// Watch for changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.disallowedTopics) {
    disallowedTopics = changes.disallowedTopics.newValue || [];
    console.log("Updated disallowedTopics:", disallowedTopics);
    filterVideos();
  }
});

function filterVideos() {
  const videos = document.querySelectorAll("ytd-rich-item-renderer");

  videos.forEach(video => {
    const titleEl = video.querySelector("#video-title");
    const title = titleEl ? titleEl.textContent.toLowerCase() : "";

    const channelEl = video.querySelector("ytd-channel-name");
    const channel = channelEl ? channelEl.textContent.toLowerCase() : "";

    const isDisallowed = disallowedTopics.some(topic =>
      title.includes(topic) || channel.includes(topic)
    );

    if (isDisallowed) {
      video.remove();
    } else {
      console.log("Keeping video:", title);
    }
  });
}

const observer = new MutationObserver(filterVideos);
observer.observe(document.body, { childList: true, subtree: true });
