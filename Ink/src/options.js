/* Colors */
const colors = {
  red: "#FF0000",
  orange: "#FFA500",
  yellow: "#FFFF00",
  green: "#008000",
  blue: "#0000FF",
  purple: "#800080",
  custom: "#000000",
};

/* Opacities */
const opacities = {
  1: "1A",
  2: "33",
  3: "4D",
  4: "66",
  5: "80",
  6: "99",
  7: "B3",
  8: "CC",
  9: "E6",
  10: "FF",
};

// Version
document.querySelector("#version").textContent = `Version: ${chrome.runtime.getManifest().version}`;

// Load Data
chrome.storage.local.get(["hex", "color", "bootsound", "opacity", "border"], function (result) {
  if (!result.hex) {
    console.log("New data!");

    result.hex = "#0000FF";
    result.color = "blue";
    result.bootsound = false;
    result.opacity = 5;
    result.border = "Solid";

    document.querySelector(`#boot-sound`).checked = result.bootsound;

    chrome.storage.local.set(
      { hex: result.hex, color: result.color, bootsound: result.bootsound, opacity: result.opacity, border: result.border },
    );
  }

  // Set CSS
  document.documentElement.style.setProperty("--ink-hex", result.hex);
  document.documentElement.style.setProperty("--ink-border", result.border);
  document.documentElement.style.setProperty("--ink-color", `${result.hex}${opacities[result.opacity]}`);

  // Update HTML
  document.querySelector(`#${result.color}`).checked = true;
  document.querySelector(`#boot-sound`).checked = result.bootsound;
  document.getElementById("opacity").value = result.opacity;
  document.getElementById("border").value = result.border;

  // Update Custom HTML
  if (result.color == "custom") {
    document.querySelector(`#custom-color`).value = result.hex;
    document.querySelector(`#custom-color-box`).style = "display: inherit;";
    document.querySelector("#custom-color").textContent = result.hex;
  }

  // Boot Sound
  if (result.bootsound == true) {
    document.getElementById("audio").play();
  }
});

// Opacity Slider
document.getElementById("opacity").addEventListener("input", function () {
  chrome.storage.local.set({ opacity: document.getElementById("opacity").value }, function () {
    const hex = document.documentElement.style.getPropertyValue("--ink-hex");
    document.documentElement.style.setProperty("--ink-hex", hex);
    document.documentElement.style.setProperty("--ink-color", `${hex}${opacities[document.getElementById("opacity").value]}`);
  });
});

document.getElementById("border").addEventListener("change", function () {
  chrome.storage.local.set({ border: document.getElementById("border").value }, function () {
    document.documentElement.style.setProperty("--ink-border", document.getElementById("border").value);
  });
});

// Color Selectors
Object.keys(colors).forEach((color) => {
  document.querySelector(`#${color}`).addEventListener("click", () => {
    const hex = colors[color];
    chrome.storage.local.set({ hex: hex, color: color }, function () {
      document.documentElement.style.setProperty("--ink-hex", hex);
      document.documentElement.style.setProperty("--ink-color", `${hex}${opacities[document.getElementById("opacity").value]}`);
    });

    document.querySelector(`#custom-color-box`).style = "display: none;";
  });
});

// Custom Selector
document.querySelector(`#custom`).addEventListener("click", () => {
  document.querySelector(`#custom-color-box`).style = "display: inherit;";
  document.querySelector(`#custom-color`).value = "";
});

// Custom Textbox
document.querySelector(`#custom-color`).addEventListener("input", () => {
  const hex = document.querySelector(`#custom-color`).value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    chrome.storage.local.set({ hex: hex, color: "custom"}, function () {
      document.documentElement.style.setProperty("--ink-hex", hex);
      document.documentElement.style.setProperty("--ink-color", `${hex}${opacities[document.getElementById("opacity").value]}`);
    });
  }
});

// Boot Sound
document.querySelector(`#boot-sound`).addEventListener("change", function () {
  chrome.storage.local.set(
    { bootsound: document.querySelector(`#boot-sound`).checked },
    function () { }
  );
});

// Tab HTML
const tabs = document.querySelectorAll("menu button");
const tabContents = document.querySelectorAll("article");

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

// Reset Data Button
document.querySelector("#reset").addEventListener("click", () => {
  chrome.storage.local.clear(function () { });

  window.location.reload();
});

// View Data Button
document.querySelector("#view").addEventListener("click", () => {
  document.querySelector("#data").style = "width: 200px; display: block;";

  chrome.storage.local.get(["hex", "color", "bootsound", "opacity", "border"], function (result) {
    document.querySelector(
      "pre"
    ).innerHTML = `color: ${result.color} <br>hex: ${result.hex} <br>boot-sound: ${result.bootsound} <br>opacity: ${result.opacity} <br>border: ${result.border}`;
  });
});

// Close Button
document.querySelector("#close").addEventListener("click", () => {
  document.querySelector("#data").style = "width: 200px; display: none;";
});