(function setupHostedDiagnostics() {
  function showHostedError(message) {
    if (document.querySelector("[data-hosted-error]")) return;

    const notice = document.createElement("div");
    notice.setAttribute("data-hosted-error", "true");
    notice.style.maxWidth = "720px";
    notice.style.margin = "24px auto";
    notice.style.padding = "18px 20px";
    notice.style.border = "1px solid rgba(122, 183, 255, 0.22)";
    notice.style.borderRadius = "18px";
    notice.style.background = "rgba(9, 14, 24, 0.96)";
    notice.style.color = "#f5f8ff";
    notice.style.fontFamily = '"Manrope", sans-serif';
    notice.style.lineHeight = "1.6";
    notice.textContent = message;
    document.body.appendChild(notice);
  }

  window.showHostedError = showHostedError;
})();

(async function mountHostedApp() {
  try {
    const appText = await window.loadCompressedText("./data/app-data.b64.gz.txt");
    new Function(appText)();
  } catch (error) {
    console.error("Unable to load hosted app", error);
    const detail = error && error.message ? " " + error.message : "";
    window.showHostedError("The interactive price book could not be loaded." + detail);
  }
})();
