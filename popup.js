const pickBtn = document.getElementById("pickBtn");
const preview = document.getElementById("preview");
const colorValueEl = document.getElementById("colorValue");
const copyArea = document.getElementById("copyArea");
const recentBox = document.getElementById("recent");
const toast = document.getElementById("toast");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const tabs = document.querySelectorAll(".tab");

/* State */
let currentHex = "#FFFFFF";
let currentFormat = "hex"; // hex, rgb, hsl, cmyk

/* Load saved preference */
chrome.storage.local.get(["lastFormat"], res => {
  if (res.lastFormat) {
    switchTab(res.lastFormat);
  }
});

/* Tab Switching */
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    switchTab(tab.dataset.format);
  });
});

function switchTab(format) {
  currentFormat = format;
  chrome.storage.local.set({ lastFormat: format });

  // UI Update
  tabs.forEach(t => t.classList.remove("active"));
  document.querySelector(`.tab[data-format="${format}"]`).classList.add("active");

  updateDisplay();
}

/* Pick from screen */
pickBtn.addEventListener("click", async () => {
  if (!window.EyeDropper) {
    showToast("EyeDropper not supported");
    return;
  }

  try {
    const eye = new EyeDropper();
    const { sRGBHex } = await eye.open();
    applyColor(sRGBHex);
  } catch (e) {
    console.log(e);
  }
});

/* Apply picked color */
function applyColor(hex) {
  currentHex = hex;
  updateDisplay();
  saveRecent(hex);
  loadRecent();

  // Auto copy on pick
  copyToClipboard(colorValueEl.textContent);
}

/* Update main display text based on current format */
function updateDisplay() {
  preview.style.background = currentHex;

  const rgb = hexToRgb(currentHex);
  let val = currentHex;

  if (currentFormat === "rgb") {
    val = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  } else if (currentFormat === "hsl") {
    const hsl = rgbToHsl(rgb);
    val = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  } else if (currentFormat === "cmyk") {
    const cmyk = rgbToCmyk(rgb);
    val = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
  }

  colorValueEl.textContent = val;
}

/* Copy Functionality */
copyArea.addEventListener("click", () => {
  copyToClipboard(colorValueEl.textContent);
});

function copyToClipboard(text, silent = false) {
  navigator.clipboard.writeText(text).then(() => {
    if (!silent) showToast("Copied!");
  });
}

/* Recent Colors */
function saveRecent(color) {
  chrome.storage.local.get(["recent"], r => {
    let list = r.recent || [];
    list = list.filter(c => c !== color);
    list.unshift(color);
    if (list.length > 14) list.pop(); // limit to 14 (7x2 grid)
    chrome.storage.local.set({ recent: list });
  });
}

function loadRecent() {
  chrome.storage.local.get(["recent"], r => {
    recentBox.innerHTML = "";
    const list = r.recent || [];

    if (list.length === 0) {
      recentBox.innerHTML = '<span style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 11px; padding: 10px;">No recent colors</span>';
      return;
    }

    list.forEach(c => {
      const d = document.createElement("div");
      d.style.background = c;
      d.title = c;
      d.onclick = () => applyColor(c);
      recentBox.appendChild(d);
    });
  });
}

/* Clear History */
clearHistoryBtn.addEventListener("click", () => {
  chrome.storage.local.set({ recent: [] }, () => {
    loadRecent();
    showToast("History cleared");
  });
});

/* Toast Notification */
let toastTimeout;
function showToast(msg, duration = 2000) {
  const toastMsg = document.getElementById("toastMsg");
  if (toastMsg) toastMsg.textContent = msg;

  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/* Initialize */
loadRecent();
updateDisplay(); /* Show default white */
