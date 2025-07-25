document.addEventListener('DOMContentLoaded', () => {
  const disallowedInput = document.getElementById("disallowedInput");
  const addDisallowed = document.getElementById("addDisallowed");
  const disallowedListEl = document.getElementById("disallowedList");

  let disallowedTopics = [];

  // Load saved topics
  chrome.storage.sync.get(['allowedTopics', 'disallowedTopics'], (data) => {
    allowedTopics = data.allowedTopics || [];
    disallowedTopics = data.disallowedTopics || [];
    renderAll();
  });

  function renderList(items, listEl, type) {
    listEl.innerHTML = "";
    items.forEach((item, index) => {
      const li = document.createElement("li");
      li.textContent = item;
      li.title = "Click to remove";
      li.onclick = () => {
        items.splice(index, 1);
        save();
        renderAll();
      };
      listEl.appendChild(li);
    });
  }

  function renderAll() {
    renderList(disallowedTopics, disallowedListEl, "disallowed");
  }

  addDisallowed.onclick = () => {
    const val = disallowedInput.value.trim().toLowerCase();
    if (val && !disallowedTopics.includes(val)) {
      disallowedTopics.push(val);
      disallowedInput.value = "";
      save();
      renderAll();
    }
  };

  function save() {
    chrome.storage.sync.set({
      allowedTopics,
      disallowedTopics
    });
  }

  renderAll();
});
