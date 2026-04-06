(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  function all(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  function closestButton(target) {
    while (target && target !== document) {
      if (target.tagName === "BUTTON") return target;
      target = target.parentNode;
    }
    return null;
  }

  function dispatchChange(select) {
    var event;
    if (typeof Event === "function") {
      event = new Event("change", { bubbles: true });
    } else {
      event = document.createEvent("Event");
      event.initEvent("change", true, true);
    }
    select.dispatchEvent(event);
  }

  function addStyle() {
    if ($("adminPolishStyles")) return;
    var style = document.createElement("style");
    style.id = "adminPolishStyles";
    style.textContent = [
      "#hostedAdminControls.is-admin-polished{justify-items:stretch;min-width:300px;gap:12px}",
      "#hostedAdminControls .admin-polished-field{width:100%;justify-items:stretch;gap:8px;font-size:.76rem;text-transform:uppercase;letter-spacing:.12em;font-weight:700}",
      "#hostedAdminControls .admin-polished-field select{display:none!important}",
      "#hostedAdminControls .admin-choice-bar{width:100%;gap:8px}",
      "#hostedAdminControls .admin-choice-bar .family-chip{flex:1 1 92px;justify-content:center;min-height:38px;padding:0 12px;font-size:.84rem;letter-spacing:0;text-transform:none;font-weight:600}",
      "#hostedAdminControls .admin-qr-note{text-align:left}",
      "#hostedAdminControls .admin-qr-label{text-align:center}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function syncButtons(select, bar) {
    all("[data-admin-choice]", bar).forEach(function (button) {
      button.className = button.className.replace(/\s*is-active/g, "");
      if (button.getAttribute("data-admin-choice") === select.value) {
        button.className += " is-active";
      }
    });
  }

  function polishSelect(select, options) {
    if (!select || select.getAttribute("data-admin-polished") === "true") return;

    select.setAttribute("data-admin-polished", "true");
    select.setAttribute("aria-hidden", "true");

    var field = select.parentNode;
    if (field && field.className.indexOf("admin-polished-field") < 0) {
      field.className += " admin-polished-field";
    }

    var bar = document.createElement("div");
    bar.className = "family-switcher admin-choice-bar";

    options.forEach(function (option) {
      var button = document.createElement("button");
      button.className = "family-chip";
      button.type = "button";
      button.setAttribute("data-admin-choice", option.value);
      button.textContent = option.label;
      bar.appendChild(button);
    });

    select.parentNode.insertBefore(bar, select.nextSibling);

    bar.addEventListener("click", function (event) {
      var button = closestButton(event.target);
      if (!button || !button.getAttribute("data-admin-choice")) return;
      select.value = button.getAttribute("data-admin-choice");
      syncButtons(select, bar);
      dispatchChange(select);
    });

    select.addEventListener("change", function () {
      syncButtons(select, bar);
    });

    syncButtons(select, bar);
  }

  function polishAdminControls() {
    var card = $("hostedAdminControls");
    if (!card) return;
    card.className = card.className.replace(/\s*is-admin-polished/g, "") + " is-admin-polished";

    if ($("toggleConantButton")) $("toggleConantButton").hidden = true;
    if ($("toggleTogButton")) $("toggleTogButton").hidden = true;

    polishSelect($("adminProviderSelect"), [
      { value: "default", label: "All pricing" },
      { value: "conant", label: "Conant" },
      { value: "tog", label: "TOG" }
    ]);

    polishSelect($("adminColumnModeSelect"), [
      { value: "pricing", label: "Pricing" },
      { value: "full", label: "Full admin" },
      { value: "client", label: "Client" }
    ]);
  }

  function hideSkuColumnWhenOff() {
    var toggle = $("toggleSkuButton");
    if (!toggle) return;
    var shouldHide = toggle.textContent.replace(/\s+/g, " ").trim().toLowerCase().indexOf("show skus") === 0;
    var headers = all("#resultsHead th");
    var skuIndex = -1;

    headers.forEach(function (header, index) {
      if (header.textContent.replace(/\s+/g, " ").trim().toLowerCase() === "sku") {
        skuIndex = index + 1;
      }
    });

    if (skuIndex < 1) return;
    all("#resultsHead th:nth-child(" + skuIndex + "), #resultsBody td:nth-child(" + skuIndex + ")").forEach(function (cell) {
      cell.style.display = shouldHide ? "none" : "";
    });
  }

  function polish() {
    addStyle();
    polishAdminControls();
    hideSkuColumnWhenOff();
  }

  var queued = false;
  function queuePolish() {
    if (queued) return;
    queued = true;
    window.setTimeout(function () {
      queued = false;
      polish();
    }, 0);
  }

  if (typeof MutationObserver === "function") {
    new MutationObserver(queuePolish).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  document.addEventListener("click", queuePolish);
  document.addEventListener("change", queuePolish);
  polish();
})();
