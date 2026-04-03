(async function mountHostedApp() {
  try {
    const appText = await window.loadCompressedText("./data/app-data.b64.gz.txt");
    new Function(appText)();
  } catch (error) {
    console.error("Unable to load hosted app", error);
  }
})();
