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

// Load Colors
chrome.storage.local.get(["hex", "opacity", "border"], function (result) {
  document.documentElement.style.setProperty(
    "--ink-hex",
    result.hex || "#0000FF"
  );
  document.documentElement.style.setProperty(
    "--ink-color",
    `${result.hex || "#0000FF"}${opacities[result.opacity] || "80"}`
  );
  document.documentElement.style.setProperty("--ink-border", result.border);
});