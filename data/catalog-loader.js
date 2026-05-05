if (typeof window.structuredClone !== "function") {
  window.structuredClone = function (value) { return JSON.parse(JSON.stringify(value)); };
}

function showHostedCatalogError(message) {
  if (document.querySelector("[data-hosted-error]")) return;
  var notice = document.createElement("div");
  notice.setAttribute("data-hosted-error", "true");
  notice.style.maxWidth = "720px";
  notice.style.margin = "24px auto";
  notice.style.padding = "18px 20px";
  notice.style.border = "1px solid rgba(122, 183, 255, 0.22)";
  notice.style.borderRadius = "18px";
  notice.style.background = "rgba(9, 14, 24, 0.92)";
  notice.style.color = "#f5f8ff";
  notice.style.fontFamily = '"Manrope", sans-serif';
  notice.style.lineHeight = "1.6";
  notice.textContent = message;
  document.body.appendChild(notice);
}

function installHostedStyleOverrides() {
  if (document.querySelector("[data-hosted-style-overrides]")) return;
  var style = document.createElement("style");
  style.setAttribute("data-hosted-style-overrides", "true");
  style.textContent = ".upgrade-chip-limited{border-color:var(--line);color:var(--text);background:rgba(12,19,29,.88);}";
  document.head.appendChild(style);
}

var HOSTED_HERO_IMAGE_CHUNKS = [
  "./data/hero-cover-sharp-webp-q35-0.txt?v=sharp-webp-q35-20260505",
  "./data/hero-cover-sharp-webp-q35-1.txt?v=sharp-webp-q35-20260505",
  "./data/hero-cover-sharp-webp-q35-2.txt?v=sharp-webp-q35-20260505",
  "./data/hero-cover-sharp-webp-q35-3.txt?v=sharp-webp-q35-20260505",
  "./data/hero-cover-sharp-webp-q35-4.txt?v=sharp-webp-q35-20260505",
  "./data/hero-cover-sharp-webp-q35-5.txt?v=sharp-webp-q35-20260505",
  "./data/hero-cover-sharp-webp-q35-6.txt?v=sharp-webp-q35-20260505",
  "./data/hero-cover-sharp-webp-q35-7.txt?v=sharp-webp-q35-20260505"
];

function refreshHostedHeroImage() {
  var heroImage = document.querySelector(".hero-background-image");
  if (!heroImage) return Promise.resolve();

  return Promise.all(HOSTED_HERO_IMAGE_CHUNKS.map(function (path) {
    return fetch(path, { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error("Unable to load " + path + ": " + response.status);
      return response.text();
    });
  })).then(function (parts) {
    heroImage.src = "data:image/webp;base64," + parts.join("").replace(/\s/g, "");
  });
}

window.loadCompressedText = async function loadCompressedText(path) {
  var response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load " + path + ": " + response.status);
  var base64 = (await response.text()).trim();
  var binary = Uint8Array.from(atob(base64), function (character) { return character.charCodeAt(0); });
  if (typeof DecompressionStream === "function") {
    var stream = new Blob([binary]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).text();
  }
  if (window.fflate && typeof window.fflate.gunzipSync === "function") {
    return new TextDecoder().decode(window.fflate.gunzipSync(binary));
  }
  throw new Error("This browser does not support gzip decompression.");
};

(async function mountHostedCatalog() {
  try {
    refreshHostedHeroImage();
    installHostedStyleOverrides();
    var catalogText = await window.loadCompressedText("./data/catalog-data.b64.gz.txt?v=single-vision-start-20260505");
    var jsonText = catalogText.replace(/^\s*window\.DEFAULT_CATALOG\s*=\s*/, "").replace(/;\s*$/, "");
    window.DEFAULT_CATALOG = JSON.parse(jsonText);
    var appText = await window.loadCompressedText("./data/app-data.b64.gz.txt?v=single-vision-start-20260505");
    appText = appText.replace(/catalogSection: "progressive"/g, 'catalogSection: "single-vision"');
    var appScript = document.createElement("script");
    appScript.text = appText + "\n//# sourceURL=app.js";
    document.body.appendChild(appScript);
  } catch (error) {
    console.error("Unable to load hosted catalog", error);
    var detail = error && error.message ? " " + error.message : "";
    showHostedCatalogError("The catalog could not be loaded." + detail);
  }
})();
