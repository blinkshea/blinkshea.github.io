window.loadCompressedText = async function loadCompressedText(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Unable to load ${path}: ${response.status}`);
  }

  const base64 = (await response.text()).trim();
  const binary = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));

  if (typeof DecompressionStream === "function") {
    const stream = new Blob([binary]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).text();
  }

  if (window.fflate && typeof window.fflate.gunzipSync === "function") {
    const decompressed = window.fflate.gunzipSync(binary);
    return new TextDecoder().decode(decompressed);
  }

  throw new Error("This browser does not support gzip decompression.");
};

(async function mountHostedCatalog() {
  try {
    const catalogText = await window.loadCompressedText("./data/catalog-data.b64.gz.txt");
    new Function(catalogText)();

    const appScript = document.createElement("script");
    appScript.src = "./app.js";
    document.body.appendChild(appScript);
  } catch (error) {
    console.error("Unable to load hosted catalog", error);

    const notice = document.createElement("div");
    notice.style.maxWidth = "720px";
    notice.style.margin = "24px auto";
    notice.style.padding = "18px 20px";
    notice.style.border = "1px solid rgba(122, 183, 255, 0.22)";
    notice.style.borderRadius = "18px";
    notice.style.background = "rgba(9, 14, 24, 0.92)";
    notice.style.color = "#f5f8ff";
    notice.style.fontFamily = '"Manrope", sans-serif';
    notice.textContent = "The catalog could not be loaded. Please refresh the page in a moment.";
    document.body.appendChild(notice);
  }
})();
