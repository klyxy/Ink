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

// Compare Versions
function compare(version1, version2) {
  const v1 = String(version1).split('.').map(Number);
  const v2 = String(version2).split('.').map(Number);
  console.log(`${v1}, ${v2}`)

  for (let i = 0; i < 3; i++) {
    if (v1[i] > v2[i]) {
      return 1;
    }
    if (v1[i] < v2[i]) {
      return -1;
    }
  }

  return 0;
}

// Check Version
if (window.location.href.includes('home')) {
  (async () => {
    try {
      const response = await fetch("https://api.github.com/repos/klyxy/Ink/releases/latest");
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

      const releaseData = await response.json();

      const result = compare(releaseData.tag_name, chrome.runtime.getManifest().version)

      const banner = document.createElement("div");
      banner.className = "grading-period-warning messages warning";
      banner.id = "ink-banner"

      if (result > 0) {
        console.warn("Outdated");
        banner.innerHTML = 'You are using an outdated version of Ink. Please update <a href="https://github.com/klyxy/Ink/releases/latest" target="_blank">here</a>';
      } else if (result < 0) {
        console.log("Unpublished version")
        banner.innerText = "You are using an unpublished/development version of Ink";
      } else {
        console.log("Up to date");
      }

      if (result != 0) {
        document.querySelector("#body").insertBefore(banner, document.querySelector("#body").querySelector("#wrapper"));
      }

    } catch (error) {
      console.error("Github Error: ", error);
    }
  })();
};