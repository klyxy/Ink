/* Declarations */

// Imports
(async () => {
  const module = await import(chrome.runtime.getURL("src/exports.js"));
  const { opacities, defaults } = module;

  // Constants
  const style = document.documentElement.style;

  /* Content */

  // Load Colors
  chrome.storage.local.get(
    [
      "hex",
      "string",
      "boot",
      "opacity",
      "border",
      "contrast",
      "calculated",
      "debug",
      "update",
    ],

    function (result) {
      const settings = { ...defaults, ...result };

      style.setProperty("--ink-hex", settings.hex || "#FFA500");
      style.setProperty(
        "--ink-color",
        `${settings.hex || "#FFA500"}${opacities[settings.opacity] || "80"}`
      );
      style.setProperty("--ink-border", settings.border || "Solid");

      if (settings.contrast == true) {
        style.setProperty("--ink-calculated", settings.calculated);
      } else {
        style.setProperty("--ink-calculated", undefined);
      }

      document.documentElement.setAttribute("ink-debug", settings.debug);
      document.documentElement.setAttribute("ink-update", settings.update);

      // Check Version
      if (
        window.location.href.includes("home") &&
        document.documentElement.getAttribute("ink-update") == "true"
      ) {
        (async () => {
          try {
            const response = await fetch(
              "https://api.github.com/repos/klyxy/Ink/releases/latest"
            );
            if (!response.ok)
              throw new Error(`GitHub API error: ${response.status}`);

            const releaseData = await response.json();

            const result = compare(
              releaseData.tag_name,
              chrome.runtime.getManifest().version
            );

            const banner = document.createElement("div");
            banner.className = "grading-period-warning messages warning";
            banner.id = "ink-banner";

            if (result > 0) {
              console.warn("Outdated");
              banner.innerHTML = `You are using an outdated version of <strong>Ink</strong>. Please update <a href="https://github.com/klyxy/Ink/releases/latest" target="_blank">here</a> <strong>OR</strong> disable this check in <a href="${chrome.runtime.getURL(
                "src/options.html"
              )}" target="_blank">options</a>`;
            } else if (result < 0) {
              console.log("Unpublished version");
              banner.innerHTML =
                "You are using an unpublished/development version of <strong>Ink</strong>";
            } else {
              console.log("Up to date");
            }

            if (result != 0) {
              document
                .querySelector("#body")
                .insertBefore(
                  banner,
                  document.querySelector("#body").querySelector("#wrapper")
                );
            }
          } catch (error) {
            console.error("Github Error: ", error);
          }
        })();
      }
    }
  );

  // Compare Versions
  function compare(version1, version2) {
    const v1 = String(version1).split(".").map(Number);
    const v2 = String(version2).split(".").map(Number);
    console.log(`${v1}, ${v2}`);

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
})();
