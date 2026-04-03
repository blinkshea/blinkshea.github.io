(async function mountHostedCatalog() {
  const partCount = 17;
  const partPaths = Array.from({ length: partCount }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return `./data/catalog-part-${number}.txt`;
  });

  try {
    const responses = await Promise.all(partPaths.map((path) => fetch(path, { cache: "no-store" })));
    const texts = await Promise.all(
      responses.map(async (response, index) => {
        if (!response.ok) {
          throw new Error(`Catalog part ${index + 1} failed with ${response.status}`);
        }
        return response.text();
      })
    );

    new Function(texts.join(""))();

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
