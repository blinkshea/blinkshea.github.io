(function () {
  var ADMIN_PASSWORD = "Heypeeps";
  var CLIENT_EXIT_PASSWORD = "Mandalay";
  var INDEX_ORDER = ["CR-39", "Poly", "1.56", "TriVex", "1.60", "1.67", "1.74"];
  var TREATMENTS = [
    ["all", "All treatments"],
    ["clear", "Clear"],
    ["photochromic", "Photochromic"],
    ["transition", "Transition"],
    ["polarized", "Polarized"]
  ];
  var catalog = window.DEFAULT_CATALOG || { products: [], addons: [] };
  var state = {
    section: "none",
    svType: "single-vision-core",
    index: "all",
    treatment: "all",
    program: "mandalay",
    tier: "good",
    search: "",
    provider: "default",
    clientView: false,
    adminUnlocked: false,
    skuVisible: false
  };

  function $(id) { return document.getElementById(id); }
  function q(selector) { return document.querySelector(selector); }
  function clean(value) { return String(value === null || value === undefined ? "" : value); }
  function esc(value) {
    return clean(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function money(value) {
    if (value === null || value === undefined || value === "" || isNaN(Number(value))) return "-";
    return "$" + Number(value).toFixed(2);
  }
  function materialName(value) {
    var normalized = clean(value).trim().toUpperCase();
    if (normalized === "HI-VEX") return "TriVex";
    if (normalized === "1.6" || normalized === "1.60") return "1.60";
    return clean(value).trim();
  }
  function familyName(item) {
    if (item.family === "Mandalay Plus") return "Mandalay +";
    if (item.family === "Horizon") return "Horizon";
    return clean(item.family);
  }
  function hasValue(value) { return value !== null && value !== undefined && value !== ""; }
  function hasConant(item) { return hasValue(item.mandalayWholesale) || hasValue(item.mandalayRetail); }
  function hasTog(item) { return hasValue(item.proposedPrice); }
  function displayPrice(item) {
    if (state.provider === "conant") return item.mandalayRetail;
    if (state.provider === "tog") return item.proposedPrice;
    if (hasValue(item.proposedPrice)) return item.proposedPrice;
    if (hasValue(item.targetSellingPrice)) return item.targetSellingPrice;
    if (hasValue(item.mandalayRetail)) return item.mandalayRetail;
    return null;
  }
  function priceLabel() {
    if (state.provider === "conant") return "Conant Price";
    if (state.provider === "tog") return "TOG Proposal";
    return "Price";
  }
  function providerMatch(item) {
    if (state.provider === "conant") return hasConant(item);
    if (state.provider === "tog") return hasTog(item);
    return true;
  }
  function sku(item) {
    function token(value, fallback) {
      var text = clean(value).toUpperCase().replace(/HI[- ]?VEX/g, "TRIVEX").replace(/[^A-Z0-9]+/g, "");
      return (text || fallback).slice(0, 4);
    }
    return ["MOL", token(familyName(item), "LENS"), token(item.tier, "BASE"), token(item.category, "CAT"), token(materialName(item.material), "MAT"), token(item.usage || "CLEAR", "USE")].join("-");
  }
  function progressiveProgram(item) {
    if (item.family === "IOT" && (item.tier === "Essential" || item.tier === "Endless" || item.tier === "Camber")) return "iot";
    if (item.family === "Mandalay" && item.tier === "Essential") return "mandalay";
    if (item.family === "Mandalay Plus" && item.tier === "Endless") return "mandalay";
    if (item.family === "Horizon" && item.tier === "Camber") return "mandalay";
    return "";
  }
  function progressiveTier(item) {
    if (item.tier === "Essential") return "good";
    if (item.tier === "Endless") return "better";
    if (item.tier === "Camber") return "best";
    return "";
  }
  function matchesSvType(item) {
    if (state.svType === "single-vision-core") return item.category === "Single Vision";
    if (state.svType === "anti-fatigue") return item.tier === "Anti-Fatigue" && item.family === "Acomoda II";
    if (state.svType === "iot-anti-fatigue") return item.tier === "Anti-Fatigue" && item.family === "IOT";
    return false;
  }
  function treatmentMatch(item) {
    var usage = clean(item.usage).toLowerCase();
    var feature = clean(item.feature).toLowerCase();
    if (state.treatment === "all") return true;
    if (state.treatment === "clear") return usage === "clear";
    if (state.treatment === "photochromic") return usage.indexOf("photo") >= 0;
    if (state.treatment === "transition") return usage.indexOf("transition") >= 0 || feature.indexOf("vantage") >= 0 || feature.indexOf("xtractive") >= 0;
    if (state.treatment === "polarized") return feature.indexOf("polarized") >= 0;
    return true;
  }
  function sectionMatch(item) {
    if (state.section === "none") return false;
    if (state.section === "single-vision") return matchesSvType(item);
    if (state.section === "bifocal") return item.category === "Multifocal";
    if (state.section === "progressive") return item.category === "Digital Progressive" && progressiveProgram(item) === state.program && progressiveTier(item) === state.tier;
    return false;
  }
  function searchable(item) {
    return [item.family, item.tier, item.category, item.material, item.design, item.usage, item.feature, sku(item)].join(" ").toLowerCase();
  }
  function sortedRows(rows) {
    return rows.slice().sort(function (a, b) {
      var ai = INDEX_ORDER.indexOf(materialName(a.material));
      var bi = INDEX_ORDER.indexOf(materialName(b.material));
      if (ai < 0) ai = 999;
      if (bi < 0) bi = 999;
      if (ai !== bi) return ai - bi;
      return clean(a.usage).localeCompare(clean(b.usage)) || clean(a.feature).localeCompare(clean(b.feature));
    });
  }
  function filteredProducts() {
    var term = state.search.toLowerCase();
    return sortedRows((catalog.products || []).filter(function (item) {
      if (!providerMatch(item) || !sectionMatch(item)) return false;
      if (state.index !== "all" && materialName(item.material) !== state.index) return false;
      if ((state.section === "single-vision" || state.section === "bifocal" || state.section === "progressive") && !treatmentMatch(item)) return false;
      if (term && searchable(item).indexOf(term) < 0) return false;
      return true;
    }));
  }
  function filteredAddons() {
    var term = state.search.toLowerCase();
    return (catalog.addons || []).filter(function (item) {
      if (state.provider === "conant" && !hasConant(item)) return false;
      if (state.provider === "tog" && !hasTog(item)) return false;
      var text = [item.section, item.name, item.notes].join(" ").toLowerCase();
      return !term || text.indexOf(term) >= 0;
    });
  }
  function chip(label, attrs, active) {
    var html = '<button class="family-chip' + (active ? ' is-active' : '') + '" type="button"';
    for (var key in attrs) html += ' ' + key + '="' + esc(attrs[key]) + '"';
    return html + '>' + esc(label) + '</button>';
  }
  function fillSelect(select, values, current, allLabel) {
    if (!select) return;
    var html = '<option value="all">' + esc(allLabel) + '</option>';
    for (var i = 0; i < values.length; i++) html += '<option value="' + esc(values[i]) + '">' + esc(values[i]) + '</option>';
    select.innerHTML = html;
    select.value = current;
  }
  function renderFilters() {
    $("familySwitcher").innerHTML = [
      chip("Single vision", { "data-section": "single-vision" }, state.section === "single-vision"),
      chip("Bifocal", { "data-section": "bifocal" }, state.section === "bifocal"),
      chip("Progressive", { "data-section": "progressive" }, state.section === "progressive"),
      chip("Coating", { "data-section": "coating" }, state.section === "coating")
    ].join("");
    $("activeFamilyTitle").textContent = state.section === "none" ? "Choose a section" : state.section.replace("-", " ");
    $("searchWrap").hidden = state.section === "none";
    $("singleVisionFiltersPanel").hidden = state.section !== "single-vision";
    $("progressiveFiltersPanel").hidden = state.section !== "progressive";
    $("lensFiltersPanel").hidden = state.section === "none" || state.section === "coating";
    $("singleVisionTypeSwitcher").innerHTML = [
      chip("Single vision", { "data-sv": "single-vision-core" }, state.svType === "single-vision-core"),
      chip("Mandalay Anti-Fatigue", { "data-sv": "anti-fatigue" }, state.svType === "anti-fatigue"),
      chip("IOT Anti-Fatigue", { "data-sv": "iot-anti-fatigue" }, state.svType === "iot-anti-fatigue")
    ].join("");
    $("progressiveProgramSwitcher").innerHTML = [chip("Mandalay", { "data-program": "mandalay" }, state.program === "mandalay"), chip("IOT", { "data-program": "iot" }, state.program === "iot")].join("");
    $("progressiveTierSwitcher").innerHTML = [chip("Good", { "data-tier": "good" }, state.tier === "good"), chip("Better", { "data-tier": "better" }, state.tier === "better"), chip("Best", { "data-tier": "best" }, state.tier === "best")].join("");
    fillSelect($("indexFilter"), INDEX_ORDER, state.index, "All indexes");
    var opts = [];
    for (var i = 1; i < TREATMENTS.length; i++) opts.push(TREATMENTS[i][1]);
    fillSelect($("treatmentFilter"), opts, treatmentLabel(state.treatment), "All treatments");
    $("clientViewButton").textContent = state.clientView ? "Exit Client View" : "Client View";
    q(".admin-menu").hidden = state.clientView;
    $("toggleSkuButton").textContent = state.skuVisible ? "Hide SKUs" : "Show SKUs";
    $("toggleConantButton").textContent = state.provider === "conant" ? "Viewing Conant" : "View Conant";
    $("toggleTogButton").textContent = state.provider === "tog" ? "Viewing TOG" : "View TOG";
  }
  function treatmentLabel(value) {
    for (var i = 0; i < TREATMENTS.length; i++) if (TREATMENTS[i][0] === value) return TREATMENTS[i][1];
    return "All treatments";
  }
  function treatmentValue(label) {
    for (var i = 0; i < TREATMENTS.length; i++) if (TREATMENTS[i][1] === label) return TREATMENTS[i][0];
    return "all";
  }
  function renderRows() {
    var head = $("resultsHead"), body = $("resultsBody"), addonsPanel = $("addonsPanel"), addonsList = $("addonsList");
    if (state.section === "coating") {
      var addons = filteredAddons();
      head.innerHTML = ""; body.innerHTML = ""; addonsPanel.hidden = false;
      addonsList.innerHTML = addons.length ? addons.map(function (item) {
        return '<div class="stack-item"><strong>' + esc(item.name) + '</strong><p>' + esc(item.section || "Coating") + ' | ' + esc(item.notes || "") + '</p><p class="price">' + money(displayPrice(item)) + '</p></div>';
      }).join("") : '<p class="empty-state">No coatings match the current filters.</p>';
      return;
    }
    addonsPanel.hidden = true; addonsList.innerHTML = "";
    var rows = filteredProducts();
    var headers = ["Family", "Product", "Usage", priceLabel()];
    if (state.skuVisible) headers.splice(1, 0, "SKU");
    head.innerHTML = '<tr>' + headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join("") + '</tr>';
    if (state.section === "none") {
      body.innerHTML = '<tr><td colspan="' + headers.length + '" class="muted">Choose Single vision, Bifocal, Progressive, or Coating to view lenses.</td></tr>';
      return;
    }
    body.innerHTML = rows.length ? rows.map(function (item) {
      var product = '<strong>' + esc(materialName(item.material) + ' ' + (item.design || item.category || 'Lens')) + '</strong><br><span class="muted">' + esc(item.tier || item.category || '') + '</span>';
      var cells = ['<td>' + esc(familyName(item)) + '</td>', '<td>' + product + '</td>', '<td><span class="pill">' + esc(item.usage || 'Clear') + '</span>' + (item.feature ? '<br><span class="muted">' + esc(item.feature) + '</span>' : '') + '</td>', '<td class="price">' + money(displayPrice(item)) + '</td>'];
      if (state.skuVisible) cells.splice(1, 0, '<td><span class="sku-text">' + esc(sku(item)) + '</span></td>');
      return '<tr>' + cells.join("") + '</tr>';
    }).join("") : '<tr><td colspan="' + headers.length + '" class="muted">No products match the current filters.</td></tr>';
  }
  function render() { renderFilters(); renderRows(); }
  function askPassword(expected, title, message, callback) {
    var dialog = $("passwordDialog");
    var input = $("passwordInput");
    if (!dialog || typeof dialog.showModal !== "function") {
      callback(window.prompt(message || "Password") === expected);
      return;
    }
    $("passwordDialogTitle").textContent = title;
    $("passwordDialogMessage").textContent = message;
    $("passwordError").hidden = true;
    input.value = "";
    dialog.showModal();
    window.setTimeout(function () { input.focus(); }, 0);
    var done = function (ok) {
      dialog.close();
      $("passwordForm").onsubmit = null;
      $("passwordCancelButton").onclick = null;
      callback(ok);
    };
    $("passwordForm").onsubmit = function (event) { event.preventDefault(); done(input.value === expected); };
    $("passwordCancelButton").onclick = function () { done(false); };
  }
  function openPrint() {
    var rows = (catalog.products || []).filter(function (item) { return hasTog(item); }).slice(0, 500);
    var html = '<!doctype html><title>Mandalay Price Guide</title><style>body{font-family:Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #ddd;padding:6px;text-align:left;font-size:12px}h1{color:#111}</style><h1>Mandalay Optical Lab Price Guide</h1><table><thead><tr><th>Family</th><th>Product</th><th>Usage</th><th>Price</th></tr></thead><tbody>' + rows.map(function (item) { return '<tr><td>' + esc(familyName(item)) + '</td><td>' + esc(materialName(item.material) + ' ' + item.design) + '</td><td>' + esc(item.usage || '') + '</td><td>' + money(displayPrice(item)) + '</td></tr>'; }).join("") + '</tbody></table>';
    var popup = window.open("", "_blank");
    if (popup) { popup.document.write(html); popup.document.close(); popup.focus(); popup.print(); }
  }
  document.addEventListener("click", function (event) {
    var target = event.target;
    var section = target.getAttribute && target.getAttribute("data-section");
    var sv = target.getAttribute && target.getAttribute("data-sv");
    var program = target.getAttribute && target.getAttribute("data-program");
    var tier = target.getAttribute && target.getAttribute("data-tier");
    if (section) { state.section = section; state.search = ""; $("searchInput").value = ""; render(); return; }
    if (sv) { state.svType = sv; render(); return; }
    if (program) { state.program = program; state.tier = "good"; render(); return; }
    if (tier) { state.tier = tier; render(); return; }
  });
  $("searchInput").addEventListener("input", function (event) { state.search = event.target.value; render(); });
  $("indexFilter").addEventListener("change", function (event) { state.index = event.target.value; render(); });
  $("treatmentFilter").addEventListener("change", function (event) { state.treatment = treatmentValue(event.target.value); render(); });
  $("clientViewButton").addEventListener("click", function () {
    if (state.clientView) {
      askPassword(CLIENT_EXIT_PASSWORD, "Exit client view", "Enter the client-view exit password.", function (ok) { if (ok) { state.clientView = false; render(); } });
    } else { state.clientView = true; render(); }
  });
  q(".admin-menu summary").addEventListener("click", function (event) {
    event.preventDefault();
    var menu = q(".admin-menu");
    if (state.adminUnlocked) { menu.open = !menu.open; return; }
    askPassword(ADMIN_PASSWORD, "Unlock admin tools", "Enter the admin password.", function (ok) { if (ok) { state.adminUnlocked = true; menu.open = true; } });
  });
  $("toggleSkuButton").addEventListener("click", function () { state.skuVisible = !state.skuVisible; render(); });
  $("toggleConantButton").addEventListener("click", function () { state.provider = state.provider === "conant" ? "default" : "conant"; render(); });
  $("toggleTogButton").addEventListener("click", function () { state.provider = state.provider === "tog" ? "default" : "tog"; render(); });
  $("printBookletButton").addEventListener("click", openPrint);
  document.body.setAttribute("data-app-ready", "true");
  render();
})();
