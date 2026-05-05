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
  style.textContent = [
    ".upgrade-chip-limited{border-color:var(--line);color:var(--text);background:rgba(12,19,29,.88);}",
    ".page-shell{width:min(1380px,calc(100% - 32px))!important;max-width:1380px!important;margin-left:auto!important;margin-right:auto!important;}",
    ".hero{width:100%!important;max-width:1380px!important;margin-left:auto!important;margin-right:auto!important;}",
    ".hero-background-image{object-fit:cover!important;object-position:center right!important;filter:url(#hostedHeroSharpen) brightness(1.2) contrast(1.16) saturate(1.08)!important;}",
    ".hero::after{background:radial-gradient(circle at 18% 22%,rgba(93,186,255,.14),transparent 22%),linear-gradient(90deg,rgba(4,8,16,.76) 0%,rgba(5,10,18,.56) 24%,rgba(6,12,22,.18) 54%,rgba(3,6,12,.04) 100%)!important;}"
  ].join("");
  document.head.appendChild(style);
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("data-hosted-hero-filter", "true");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.position = "absolute";
  svg.style.pointerEvents = "none";
  svg.innerHTML = '<filter id="hostedHeroSharpen" color-interpolation-filters="sRGB"><feConvolveMatrix order="3" kernelMatrix="0 -0.2 0 -0.2 1.8 -0.2 0 -0.2 0" divisor="1" bias="0" preserveAlpha="true"/></filter>';
  document.body.appendChild(svg);
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
    appText = appText
      .replace(/catalogSection: "progressive"/g, 'catalogSection: "single-vision"')
      .replace(/clientExit: "Mandalay905"/g, 'clientExit: "Mandalay"')
      .replace(
        'if (entry === expectedValue) return true;',
        'const expectedValues = (Array.isArray(expectedValue) ? expectedValue : [expectedValue]).map((value) => String(value ?? "").trim()).filter(Boolean);\\n    if (expectedValues.includes(String(entry).trim())) return true;'
      )
      .replace(
        "const matches = await confirmPassword(state.passwords.clientExit, {",
        "const matches = await confirmPassword([state.passwords.clientExit, DEFAULT_PASSWORDS.clientExit], {"
      )
      .replace(
        'const confirmed = window.confirm("Restore the local admin and client-view passwords to Mandalay905?");',
        'const confirmed = window.confirm("Restore the local admin password to Mandalay905 and the client-view exit password to Mandalay?");'
      )
      .replace(
        'window.alert("Local passwords restored to Mandalay905.");',
        'window.alert("Local passwords restored. Admin: Mandalay905. Client-view exit: Mandalay.");'
      );
    var appScript = document.createElement("script");
    appScript.text = appText + "\n//# sourceURL=app.js";
    document.body.appendChild(appScript);
  } catch (error) {
    console.error("Unable to load hosted catalog", error);
    var detail = error && error.message ? " " + error.message : "";
    showHostedCatalogError("The catalog could not be loaded." + detail);
  }
})();
