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
    var catalogText = await window.loadCompressedText("./data/catalog-data.b64.gz.txt?v=public-admin-1");
    var jsonText = catalogText.replace(/^\s*window\.DEFAULT_CATALOG\s*=\s*/, "").replace(/;\s*$/, "");
    window.DEFAULT_CATALOG = JSON.parse(jsonText);
    var appScript = document.createElement("script");
    appScript.src = "./app.js?v=public-admin-1";
    document.body.appendChild(appScript);
  } catch (error) {
    console.error("Unable to load hosted catalog", error);
    var detail = error && error.message ? " " + error.message : "";
    showHostedCatalogError("The catalog could not be loaded." + detail);
  }
})();
