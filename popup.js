document.addEventListener('DOMContentLoaded', () => {
  const disallowedInput = document.getElementById("disallowedInput");
  const addDisallowed = document.getElementById("addDisallowed");
  const disallowedListEl = document.getElementById("disallowedList");
  const hideSectionsForm = document.getElementById("hideSectionsForm");

  let disallowedTopics = [];
  let hideSettings = {};

  // Load saved data
  chrome.storage.sync.get(['disallowedTopics', 'hideSettings'], (data) => {
    disallowedTopics = data.disallowedTopics || [];
    hideSettings = data.hideSettings || {};
    renderAll();
    loadHideSettings();
  });

  function renderList(items, listEl) {
    listEl.innerHTML = "";
    items.forEach((item, index) => {
      const li = document.createElement("li");
      li.textContent = item;
      li.title = "Click to remove";
      li.onclick = () => {
        items.splice(index, 1);
        saveTopics();
        renderAll();
      };
      listEl.appendChild(li);
    });
  }

  function renderAll() {
    renderList(disallowedTopics, disallowedListEl);
  }

  // Load hide settings into checkboxes
  function loadHideSettings() {
    const checkboxes = hideSectionsForm.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      const settingName = checkbox.name;
      checkbox.checked = hideSettings[settingName] || false;
    });
  }

  // Save topics to storage
  function saveTopics() {
    chrome.storage.sync.set({ disallowedTopics });
  }

  // Save hide settings to storage
  function saveHideSettings() {
    chrome.storage.sync.set({ hideSettings });
  }

  // Add new disallowed keyword
  addDisallowed.onclick = () => {
    const val = disallowedInput.value.trim().toLowerCase();
    if (val && !disallowedTopics.includes(val)) {
      disallowedTopics.push(val);
      disallowedInput.value = "";
      saveTopics();
      renderAll();
    }
  };

  // Handle checkbox changes
  hideSectionsForm.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
      hideSettings[e.target.name] = e.target.checked;
      saveHideSettings();
    }
  });

  // Tab switching functionality
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Set active tab
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
  
      // Show matching content
      const id = tab.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(id).classList.add('active');
    });
  });

  // Initial render
  renderAll();
});