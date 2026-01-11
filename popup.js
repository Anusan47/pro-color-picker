const pickBtn = document.getElementById("pickBtn");
const preview = document.getElementById("preview");
const hexEl = document.getElementById("hex");
const rgbEl = document.getElementById("rgb");
const hslEl = document.getElementById("hsl");
const recentBtn = document.getElementById("recentBtn");
const recentBox = document.getElementById("recent");

/* Auto-copy format (default HEX) */
let autoCopyFormat = "hex";

/* Load saved auto-copy preference */
chrome.storage.local.get(["autoCopyFormat"], res => {
  if (res.autoCopyFormat) {
    autoCopyFormat = res.autoCopyFormat;
    document.querySelector(`input[value="${autoCopyFormat}"]`).checked = true;
  }
});

/* Handle radio selection */
document.querySelectorAll('input[name="autoCopy"]').forEach(radio => {
  radio.addEventListener("change", () => {
    autoCopyFormat = radio.value;
    chrome.storage.local.set({ autoCopyFormat });
  });
});

/* Pick from screen */
pickBtn.addEventListener("click", async () => {
  if (!window.EyeDropper) {
    alert("EyeDropper not supported");
    return;
  }

  try {
    const eye = new EyeDropper();
    const { sRGBHex } = await eye.open();
    applyColor(sRGBHex);
  } catch {
    // user cancelled
  }
});

/* Apply picked color */
function applyColor(hex) {
  preview.style.background = hex;
  hexEl.textContent = hex;

  const rgb = hexToRgb(hex);
  rgbEl.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  const hsl = rgbToHsl(rgb);
  hslEl.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  /* AUTO COPY SELECTED FORMAT */
  if (autoCopyFormat === "hex") navigator.clipboard.writeText(hexEl.textContent);
  if (autoCopyFormat === "rgb") navigator.clipboard.writeText(rgbEl.textContent);
  if (autoCopyFormat === "hsl") navigator.clipboard.writeText(hslEl.textContent);

  saveRecent(hex);
  loadRecent();
}

/* Individual copy buttons */
document.querySelectorAll(".copy-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    if (type === "hex") navigator.clipboard.writeText(hexEl.textContent);
    if (type === "rgb") navigator.clipboard.writeText(rgbEl.textContent);
    if (type === "hsl") navigator.clipboard.writeText(hslEl.textContent);
  });
});

/* Recent colors */
function saveRecent(color) {
  chrome.storage.local.get(["recent"], r => {
    let list = r.recent || [];
    list = list.filter(c => c !== color);
    list.unshift(color);
    if (list.length > 25) list.pop();
    chrome.storage.local.set({ recent: list });
  });
}

function loadRecent() {
  chrome.storage.local.get(["recent"], r => {
    recentBox.innerHTML = "";
    (r.recent || []).forEach(c => {
      const d = document.createElement("div");
      d.style.background = c;
      d.onclick = () => applyColor(c);
      recentBox.appendChild(d);
    });
  });
}

recentBtn.addEventListener("click", () => {
  recentBox.classList.toggle("hidden");
  loadRecent();
});
