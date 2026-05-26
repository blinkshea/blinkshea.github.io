(function () {
  const access = window.MANDALAY_CLIENT_ACCESS || { mode: "unlocked" };
  const gateId = "clientAccessGate";
  const appScript = "./app.js";
  let appLoaded = false;

  function storageKey() {
    return `mandalay-client-catalog:${access.cacheKey || access.generatedAt || "current"}`;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function injectStyles() {
    if (document.getElementById("clientAccessStyles")) return;
    const style = document.createElement("style");
    style.id = "clientAccessStyles";
    style.textContent = `
      body.client-access-pending .page-shell,
      body.client-access-gated .page-shell,
      body.client-access-locked .page-shell {
        display: none !important;
      }

      .client-access-panel {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 30px 18px;
        color: #eef6ff;
        background:
          radial-gradient(circle at 30% 20%, rgba(89, 184, 255, 0.24), transparent 34%),
          linear-gradient(135deg, #050a12 0%, #071629 58%, #02050a 100%);
        font-family: Manrope, "Segoe UI", Arial, sans-serif;
      }

      .client-access-panel[hidden] {
        display: none !important;
      }

      .client-access-card {
        width: min(520px, 100%);
        border: 1px solid rgba(127, 199, 255, 0.34);
        border-radius: 18px;
        padding: 34px;
        background: rgba(6, 14, 26, 0.88);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
      }

      .client-access-eyebrow {
        margin: 0 0 10px;
        color: #59b8ff;
        font-family: "Barlow Condensed", Manrope, sans-serif;
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .client-access-card h1 {
        margin: 0 0 12px;
        color: #ffffff;
        font-size: clamp(30px, 6vw, 48px);
        line-height: 0.98;
      }

      .client-access-message {
        margin: 0 0 22px;
        color: #b7c9df;
        font-size: 16px;
        line-height: 1.55;
      }

      .client-access-form {
        display: grid;
        gap: 12px;
      }

      .client-access-form label {
        display: grid;
        gap: 8px;
        color: #b7c9df;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .client-access-form input {
        width: 100%;
        min-height: 48px;
        border: 1px solid rgba(127, 199, 255, 0.32);
        border-radius: 14px;
        padding: 0 14px;
        color: #ffffff;
        background: rgba(2, 8, 16, 0.88);
        font: 700 18px Manrope, "Segoe UI", Arial, sans-serif;
      }

      .client-access-form input:focus {
        border-color: #59b8ff;
        outline: 3px solid rgba(89, 184, 255, 0.22);
      }

      .client-access-form button {
        min-height: 48px;
        border: 0;
        border-radius: 999px;
        color: #031224;
        background: linear-gradient(135deg, #59b8ff, #3f73ff);
        font: 900 16px Manrope, "Segoe UI", Arial, sans-serif;
        cursor: pointer;
      }

      .client-access-error {
        min-height: 20px;
        margin: 2px 0 0;
        color: #ff9dad;
        font-size: 14px;
        font-weight: 800;
      }
    `;
    document.head.appendChild(style);
  }

  function getGate() {
    let gate = document.getElementById(gateId);
    if (!gate) {
      gate = document.createElement("div");
      gate.id = gateId;
      gate.className = "client-access-panel";
      gate.hidden = true;
      document.body.prepend(gate);
    }
    return gate;
  }

  function saveCatalog(catalog) {
    try {
      sessionStorage.setItem(storageKey(), JSON.stringify(catalog));
    } catch (error) {
      // Browser storage can be blocked; the current page can still use the decrypted catalog.
    }
  }

  function readCachedCatalog() {
    try {
      const cached = sessionStorage.getItem(storageKey());
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      return null;
    }
  }

  function loadApp() {
    if (appLoaded) return;
    appLoaded = true;
    const script = document.createElement("script");
    script.src = appScript;
    script.defer = true;
    script.onerror = () => showLocked("Mandalay Lens Book could not load", "Refresh the page and try again.");
    document.body.appendChild(script);
  }

  function openClient(catalog) {
    if (catalog) {
      window.MANDALAY_CLIENT_CATALOG = catalog;
      saveCatalog(catalog);
    }
    document.body.classList.remove("client-access-pending", "client-access-gated", "client-access-locked");
    const gate = getGate();
    gate.hidden = true;
    loadApp();
  }

  function base64ToBytes(value) {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }

  async function decryptCatalog(password) {
    const encrypted = access.encryptedCatalog;
    if (!encrypted || !window.crypto || !window.crypto.subtle) {
      throw new Error("This browser cannot unlock the protected guide.");
    }
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: base64ToBytes(encrypted.salt),
        iterations: encrypted.iterations,
        hash: encrypted.hash || "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(encrypted.iv) },
      key,
      base64ToBytes(encrypted.ciphertext)
    );
    return JSON.parse(new TextDecoder().decode(decrypted));
  }

  function showLocked(title, message) {
    injectStyles();
    document.body.classList.remove("client-access-pending", "client-access-gated");
    document.body.classList.add("client-access-locked");
    const gate = getGate();
    gate.innerHTML = `
      <div class="client-access-card" role="status" aria-live="polite">
        <p class="client-access-eyebrow">Mandalay Optical Labs</p>
        <h1>${escapeHtml(title || access.title || "Lens Book Locked")}</h1>
        <p class="client-access-message">${escapeHtml(message || access.message || "This client lens book is temporarily locked.")}</p>
      </div>
    `;
    gate.hidden = false;
  }

  function showPasswordGate() {
    const cached = readCachedCatalog();
    if (cached) {
      openClient(cached);
      return;
    }

    injectStyles();
    document.body.classList.remove("client-access-pending", "client-access-locked");
    document.body.classList.add("client-access-gated");
    const gate = getGate();
    gate.innerHTML = `
      <div class="client-access-card">
        <p class="client-access-eyebrow">Mandalay Optical Labs</p>
        <h1>${escapeHtml(access.title || "Enter Client Password")}</h1>
        <p class="client-access-message">${escapeHtml(access.message || "This Mandalay Lens Book is password protected.")}</p>
        <form class="client-access-form" id="clientAccessForm">
          <label>
            Password
            <input id="clientAccessPassword" type="password" autocomplete="current-password" />
          </label>
          <button type="submit">Unlock Lens Book</button>
          <p class="client-access-error" id="clientAccessError" aria-live="polite"></p>
        </form>
      </div>
    `;
    gate.hidden = false;

    const form = document.getElementById("clientAccessForm");
    const input = document.getElementById("clientAccessPassword");
    const error = document.getElementById("clientAccessError");
    input.focus();
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      error.textContent = "";
      const password = input.value;
      if (!password) {
        error.textContent = "Enter the password to continue.";
        return;
      }
      form.querySelector("button").disabled = true;
      try {
        const catalog = await decryptCatalog(password);
        openClient(catalog);
      } catch (problem) {
        error.textContent = "That password did not unlock the lens book.";
        form.querySelector("button").disabled = false;
        input.select();
      }
    });
  }

  if (access.mode === "locked") {
    showLocked();
    return;
  }

  if (access.mode === "password") {
    showPasswordGate();
    return;
  }

  openClient(window.MANDALAY_CLIENT_CATALOG);
})();
