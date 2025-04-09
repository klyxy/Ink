/* Declarations */

// Imports
import { colors, opacities, defaults, textColor } from "./exports.js";

// Constants
const versionElement = document.querySelector("#version");
const audioElement = document.querySelector("#audio");

const bootElement = document.querySelector("#boot");
const opacityElement = document.querySelector("#opacity");
const borderElement = document.querySelector("#border");
const contrastElement = document.querySelector("#contrast");
const customElement = document.querySelector("#custom");
const customBoxElement = document.querySelector("#custom-color-box");
const customTextElement = document.querySelector("#custom-color");
const developerElement = document.querySelector("#debug");
const updateElement = document.querySelector("#update");

const resetElement = document.querySelector("#reset");
const closeElement = document.querySelector("#close");
const dataElement = document.querySelector("#data");
const viewElement = document.querySelector("#view");

const style = document.documentElement.style;

const tabs = document.querySelectorAll("menu button");
const tabContents = document.querySelectorAll("article");

/* Functions */

// Contrast
function updateContrast(
  contrast = contrastElement.checked,
  color = style.getPropertyValue("--ink-color")
) {
  if (contrast == true) {
    style.setProperty("--ink-contrast", calculateContrast(color));
  } else {
    style.setProperty("--ink-contrast", textColor);
  }

  chrome.storage.local.set(
    { calculated: style.getPropertyValue("--ink-contrast") },
    function () {}
  );
}

function calculateContrast(hex, background = "#ffffff") {
  hex = hex.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const a = parseInt(hex.substring(6, 8), 16) / 255;

  const bg = background.replace("#", "");
  const br = parseInt(bg.substring(0, 2), 16);
  const bgG = parseInt(bg.substring(2, 4), 16);
  const bb = parseInt(bg.substring(4, 6), 16);

  const finalR = Math.round(r * a + br * (1 - a));
  const finalG = Math.round(g * a + bgG * (1 - a));
  const finalB = Math.round(b * a + bb * (1 - a));

  const brightness = (finalR * 299 + finalG * 587 + finalB * 114) / 1000;

  return brightness > 128 ? "#000000" : "#FFFFFF";
}

/* Options */

// Initialize
versionElement.textContent = `Version: ${chrome.runtime.getManifest().version}`;

// Load Data
chrome.storage.local.get(
  ["hex", "string", "boot", "opacity", "border", "contrast", "debug", "update"],
  function (result) {
    const settings = { ...defaults, ...result };

    // Generate New Data
    if (!result.hex) {
      console.log("Generating new data");

      chrome.storage.local.set(settings);
    }

    console.log(`Data loaded: ${settings}`);

    //  Update HTML
    const colorElement = document.querySelector(`#${settings.string}`);

    colorElement.checked = true;
    bootElement.checked = settings.boot;
    borderElement.value = settings.border;
    opacityElement.value = settings.opacity;
    contrastElement.checked = settings.contrast;
    developerElement.checked = settings.debug;
    updateElement.checked = settings.update;

    if (settings.string == "custom") {
      customTextElement.value = settings.hex;
      customTextElement.textContent = settings.hex;
      customBoxElement.style = "display: inherit;";
    }

    // Update Contrast
    updateContrast(
      settings.contrast,
      `${settings.hex}${opacities[settings.opacity]}`
    );

    // Update CSS
    style.setProperty("--ink-hex", settings.hex);
    style.setProperty(
      "--ink-color",
      `${settings.hex}${opacities[settings.opacity]}`
    );
    style.setProperty("--ink-border", settings.border);

    // Boot
    if (settings.boot == true) {
      audioElement.play();
    }
  }
);

// String Selector
Object.keys(colors).forEach((string) => {
  document.querySelector(`#${string}`).addEventListener("click", () => {
    const hex = colors[string];

    chrome.storage.local.set({ hex: hex, string: string }, function () {
      style.setProperty("--ink-hex", hex);
      style.setProperty(
        "--ink-color",
        `${hex}${opacities[opacityElement.value]}`
      );

      updateContrast();
    });

    customBoxElement.style = "display: none;";
  });
});

// Custom Selector
customElement.addEventListener("click", () => {
  customBoxElement.style = "display: inherit;";
  customTextElement.value = "";
});

customTextElement.addEventListener("input", () => {
  const hex = customTextElement.value.trim();

  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    chrome.storage.local.set({ hex: hex, string: "custom" }, function () {
      style.setProperty("--ink-hex", hex);
      style.setProperty(
        "--ink-color",
        `${hex}${opacities[opacityElement.value]}`
      );
    });
  }
});

// Opacity Selector
opacityElement.addEventListener("input", function () {
  chrome.storage.local.set({ opacity: opacityElement.value }, function () {
    const hex = style.getPropertyValue("--ink-hex");
    style.setProperty("--ink-hex", hex);
    style.setProperty(
      "--ink-color",
      `${hex}${opacities[opacityElement.value]}`
    );

    updateContrast();
  });
});

// Border Selector
borderElement.addEventListener("change", function () {
  chrome.storage.local.set({ border: borderElement.value }, function () {
    style.setProperty("--ink-border", borderElement.value);
  });
});

// Boot Selector
bootElement.addEventListener("change", function () {
  chrome.storage.local.set({ boot: bootElement.checked }, function () {});
});

// Update Selector
updateElement.addEventListener("change", function () {
  chrome.storage.local.set({ update: updateElement.checked }, function () {});
});

// Contrast Selector
contrastElement.addEventListener("change", function () {
  chrome.storage.local.set({ contrast: contrastElement.checked }, function () {
    updateContrast();
    document.documentElement.setAttribute(
      "ink-contrast",
      contrastElement.checked
    );
  });
});

// Developer Selector
developerElement.addEventListener("change", function () {
  chrome.storage.local.set({ debug: developerElement.checked }, function () {});
});

/* UI */

// Tabs
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabContents.forEach((content) => (content.style.display = "none"));

    tabs.forEach((button) => button.setAttribute("aria-selected", "false"));

    const contentId = tab.getAttribute("aria-controls");
    const content = document.getElementById(contentId);
    content.style.display = "block";

    tab.setAttribute("aria-selected", "true");
  });
});

// Reset Button
resetElement.addEventListener("click", () => {
  chrome.storage.local.clear(function () {});

  window.location.reload();
});

// Close Button
closeElement.addEventListener("click", () => {
  dataElement.style = "width: 200px; display: none;";
});

// View Button
viewElement.addEventListener("click", () => {
  dataElement.style = "width: 200px; display: block;";

  chrome.storage.local.get(null, function (result) {
    let output = "";

    for (const [key, value] of Object.entries(result)) {
      output += `${key}: ${value} <br>`;
    }

    document.querySelector("pre").innerHTML = output;
  });
});
