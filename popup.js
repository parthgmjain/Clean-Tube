document.addEventListener('DOMContentLoaded', () => {
  const sections = [
    'headerBg',
    'sidebarBg',
    'videoTitle',
    'ChipsBar',
    'commentsBg',
    'Text',
    'pageBg'
  ];

  const disallowedInput = document.getElementById("disallowedInput");
  const addDisallowed = document.getElementById("addDisallowed");
  const disallowedListEl = document.getElementById("disallowedList");
  const hideSectionsForm = document.getElementById("hideSectionsForm");
  let disallowedTopics = [];
  let hideSettings = {};

  chrome.storage.sync.get(['disallowedTopics', 'hideSettings', 'colorSettings'], (data) => {
    disallowedTopics = data.disallowedTopics || [];
    hideSettings = data.hideSettings || {};
    
    sections.forEach(section => {
      updateUI(section, data.colorSettings?.[section] || { R: 255, G: 255, B: 255 });
    });
    
    renderAll();
    loadHideSettings();
  });

  sections.forEach(section => {
    ['R', 'G', 'B'].forEach(channel => {
      const slider = document.querySelector(`input[name=${section + channel}]`);
      const input = document.querySelector(`input[name=${section + channel}Input]`);

      slider.addEventListener('input', () => {
        input.value = slider.value;
        updateColor(section);
      });

      input.addEventListener('input', () => {
        let val = parseInt(input.value);
        if (isNaN(val) || val < 0) val = 0;
        if (val > 255) val = 255;
        slider.value = val;
        input.value = val;
        updateColor(section);
      });
    });
  });

  document.getElementById('resetColors').addEventListener('click', () => {
    const defaultColors = {
      'headerBg': { R: 32, G: 33, B: 36 },
      'sidebarBg': { R: 32, G: 33, B: 36 },
      'videoTitle': { R: 0, G: 0, B: 0 },
      'ChipsBar': { R: 255, G: 255, B: 255 },
      'commentsBg': { R: 24, G: 24, B: 24 },
      'Text': { R: 0, G: 0, B: 0 },
      'pageBg': { R: 18, G: 18, B: 18 }
    };

    sections.forEach(section => {
      updateUI(section, defaultColors[section]);
      saveColor(section, defaultColors[section]);
      sendColor(section, defaultColors[section]);
    });
  });

  function updateUI(section, color) {
    ['R', 'G', 'B'].forEach(channel => {
      document.querySelector(`input[name=${section + channel}]`).value = color[channel];
      document.querySelector(`input[name=${section + channel}Input]`).value = color[channel];
    });
    updatePreview(section, color);
  }

  function updateColor(section) {
    const color = {
      R: parseInt(document.querySelector(`input[name=${section + 'R'}]`).value),
      G: parseInt(document.querySelector(`input[name=${section + 'G'}]`).value),
      B: parseInt(document.querySelector(`input[name=${section + 'B'}]`).value)
    };
    updatePreview(section, color);
    saveColor(section, color);
    sendColor(section, color);
  }

  function updatePreview(section, color) {
    const preview = document.getElementById(section + 'Preview');
    preview.style.backgroundColor = `rgb(${color.R}, ${color.G}, ${color.B})`;
  }

  function saveColor(section, color) {
    chrome.storage.sync.get(['colorSettings'], (data) => {
      const currentSettings = data.colorSettings || {};
      currentSettings[section] = color;
      chrome.storage.sync.set({ colorSettings: currentSettings });
    });
  }

  function sendColor(section, color) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'applyColor',
        section: section,
        color: color
      });
    });
  }

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

  function loadHideSettings() {
    const checkboxes = hideSectionsForm.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      const settingName = checkbox.name;
      checkbox.checked = hideSettings[settingName] || false;
    });
  }

  function saveTopics() {
    chrome.storage.sync.set({ disallowedTopics });
  }

  function saveHideSettings() {
    chrome.storage.sync.set({ hideSettings });
  }

  addDisallowed.onclick = () => {
    const val = disallowedInput.value.trim().toLowerCase();
    if (val && !disallowedTopics.includes(val)) {
      disallowedTopics.push(val);
      disallowedInput.value = "";
      saveTopics();
      renderAll();
    }
  };

  hideSectionsForm.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
      hideSettings[e.target.name] = e.target.checked;
      saveHideSettings();
    }
  });

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const id = tab.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(id).classList.add('active');
    });
  });

  renderAll();
});