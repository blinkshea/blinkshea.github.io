(function () {
  const catalog = window.MANDALAY_CLIENT_CATALOG || { products: [], addons: [] };
  const sectionLabels = {
    "single-vision": "Single vision",
    multifocal: "Bifocal",
    progressive: "Progressive",
    coating: "Coating",
  };
  const singleVisionTypes = {
    "single-vision-core": "Single vision",
    "anti-fatigue": "Anti-Fatigue",
    "iot-anti-fatigue": "IOT Anti-Fatigue",
  };
  const treatmentOptions = [
    ["all", "All treatments"],
    ["clear", "Clear"],
    ["photochromic", "Photochromic"],
    ["transition", "Transition"],
    ["polarized", "Polarized"],
  ];
  const indexOrder = ["CR-39", "Poly", "1.56", "TriVex", "1.60", "1.67", "1.74"];
  const progressiveDesigns = [
    { key: "mandalay", label: "Mandalay", amount: 0, group: "mandalay" },
    { key: "mandalay-plus", label: "Mandalay Plus", amount: 20, group: "mandalay" },
    { key: "mandalay-deluxe", label: "Mandalay Deluxe", amount: 40, group: "mandalay" },
    { key: "iot-essential", label: "IOT Essential", amount: 15, group: "iot" },
    { key: "iot-endless", label: "IOT Endless", amount: 35, group: "iot" },
    { key: "iot-camber", label: "IOT Camber", amount: 60, group: "iot", limited: true },
  ];

  const state = {
    section: "single-vision",
    singleVisionType: "single-vision-core",
    index: "all",
    treatment: "all",
    search: "",
    progressiveDesign: "mandalay",
  };

  const el = {
    activeSectionTitle: document.querySelector("#activeSectionTitle"),
    updatedLabel: document.querySelector("#updatedLabel"),
    sectionTabs: document.querySelector("#sectionTabs"),
    singleVisionControls: document.querySelector("#singleVisionControls"),
    singleVisionTabs: document.querySelector("#singleVisionTabs"),
    progressiveControls: document.querySelector("#progressiveControls"),
    mandalayDesignTabs: document.querySelector("#mandalayDesignTabs"),
    iotDesignTabs: document.querySelector("#iotDesignTabs"),
    indexFilter: document.querySelector("#indexFilter"),
    treatmentFilter: document.querySelector("#treatmentFilter"),
    searchInput: document.querySelector("#searchInput"),
    resultsTitle: document.querySelector("#resultsTitle"),
    resultCount: document.querySelector("#resultCount"),
    resultsHead: document.querySelector("#resultsHead"),
    resultsBody: document.querySelector("#resultsBody"),
    printViewButton: document.querySelector("#printViewButton"),
    copyLinkButton: document.querySelector("#copyLinkButton"),
    clientUrl: document.querySelector("#clientUrl"),
  };

  const esc = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const money = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 1) return "Quote";
    if (Number.isInteger(amount)) return `$${amount}`;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const normalize = (value) => String(value || "").toUpperCase().replace(/[^A-Z0-9]+/g, "");

  function displayMaterialName(value) {
    const normalized = String(value || "").trim().toUpperCase();
    if (normalized === "HI-VEX" || normalized === "TRIVEX") return "TriVex";
    if (normalized === "1.6" || normalized === "1.60") return "1.60";
    return String(value || "").trim();
  }

  function displayFamilyName(item) {
    if (item.tier === "Anti-Fatigue" && item.family === "Acomoda II") return "Anti-fatigue";
    if (item.tier === "Anti-Fatigue" && item.family === "IOT") return "IOT Endless Anti Fatigue";
    return item.family || "";
  }

  function selectedProgressiveDesign() {
    return progressiveDesigns.find((item) => item.key === state.progressiveDesign) || progressiveDesigns[0];
  }

  function isProgressiveBaseItem(item) {
    return item.category === "Digital Progressive" && item.family === "Mandalay" && item.tier === "Essential";
  }

  function isCamberAvailable(item) {
    const material = displayMaterialName(item.material);
    const usage = String(item.usage || "").trim().toLowerCase();
    const feature = String(item.feature || "").trim();
    return ["TriVex", "1.60", "1.67"].includes(material) && !feature && (usage === "clear" || usage === "transitions 8");
  }

  function progressivePrice(item) {
    const design = selectedProgressiveDesign();
    if (design.limited && !isCamberAvailable(item)) return null;
    const base = Number(item.price);
    return Number.isFinite(base) ? Number((base + design.amount).toFixed(2)) : null;
  }

  function matchesSingleVisionType(item) {
    if (state.singleVisionType === "single-vision-core") return item.category === "Single Vision";
    if (state.singleVisionType === "anti-fatigue") return item.tier === "Anti-Fatigue" && item.family === "Acomoda II";
    if (state.singleVisionType === "iot-anti-fatigue") return item.tier === "Anti-Fatigue" && item.family === "IOT";
    return false;
  }

  function matchesSection(item) {
    if (state.section === "single-vision") return matchesSingleVisionType(item);
    if (state.section === "multifocal") return item.category === "Multifocal";
    if (state.section === "progressive") return isProgressiveBaseItem(item);
    return false;
  }

  function matchesTreatment(item) {
    const usage = String(item.usage || "").toLowerCase();
    const feature = String(item.feature || "").toLowerCase();
    if (state.treatment === "all") return true;
    if (state.treatment === "clear") return usage === "clear";
    if (state.treatment === "photochromic") return usage.includes("photo");
    if (state.treatment === "transition") {
      return usage.includes("transition") || feature.includes("vantage") || feature.includes("xtractive");
    }
    if (state.treatment === "polarized") return feature.includes("polarized") || usage.includes("sun");
    return true;
  }

  function searchableText(item) {
    return [
      displayFamilyName(item),
      item.family,
      item.tier,
      item.category,
      item.material,
      item.design,
      item.usage,
      item.feature,
      item.name,
      item.section,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  function sortProducts(rows) {
    return [...rows].sort((left, right) => {
      const materialA = indexOrder.indexOf(displayMaterialName(left.material));
      const materialB = indexOrder.indexOf(displayMaterialName(right.material));
      const rankA = materialA === -1 ? indexOrder.length : materialA;
      const rankB = materialB === -1 ? indexOrder.length : materialB;
      return (
        String(displayFamilyName(left)).localeCompare(displayFamilyName(right), undefined, { numeric: true }) ||
        String(left.tier || "").localeCompare(right.tier || "", undefined, { numeric: true }) ||
        rankA - rankB ||
        String(left.usage || "").localeCompare(right.usage || "", undefined, { numeric: true }) ||
        String(left.feature || "").localeCompare(right.feature || "", undefined, { numeric: true })
      );
    });
  }

  function filteredProducts() {
    const search = state.search.trim().toLowerCase();
    return sortProducts(
      (catalog.products || []).filter((item) => {
        if (!matchesSection(item)) return false;
        if (state.index !== "all" && displayMaterialName(item.material) !== state.index) return false;
        if (!matchesTreatment(item)) return false;
        if (search && !searchableText(item).includes(search)) return false;
        return true;
      })
    );
  }

  function filteredAddons() {
    const search = state.search.trim().toLowerCase();
    return [...(catalog.addons || [])]
      .filter((item) => {
        if (search && !searchableText(item).includes(search)) return false;
        return true;
      })
      .sort((left, right) =>
        String(left.section || "").localeCompare(right.section || "") ||
        String(left.name || "").localeCompare(right.name || "", undefined, { numeric: true })
      );
  }

  function sourceProductsForFilters() {
    return (catalog.products || []).filter((item) => {
      if (state.section === "single-vision") return matchesSingleVisionType(item);
      if (state.section === "multifocal") return item.category === "Multifocal";
      if (state.section === "progressive") return isProgressiveBaseItem(item);
      return false;
    });
  }

  function availableIndexes() {
    return [...new Set(sourceProductsForFilters().map((item) => displayMaterialName(item.material)).filter(Boolean))].sort((left, right) => {
      const leftRank = indexOrder.indexOf(left);
      const rightRank = indexOrder.indexOf(right);
      if (leftRank !== -1 || rightRank !== -1) {
        if (leftRank === -1) return 1;
        if (rightRank === -1) return -1;
        return leftRank - rightRank;
      }
      return left.localeCompare(right, undefined, { numeric: true });
    });
  }

  function fillSelect(select, rows, current, allLabel) {
    select.innerHTML = "";
    [{ value: "all", label: allLabel }, ...rows.map((value) => ({ value, label: value }))].forEach((option) => {
      const element = document.createElement("option");
      element.value = option.value;
      element.textContent = option.label;
      element.selected = option.value === current;
      select.appendChild(element);
    });
  }

  function renderTabs() {
    const available = {
      "single-vision": (catalog.products || []).some((item) => item.category === "Single Vision"),
      multifocal: (catalog.products || []).some((item) => item.category === "Multifocal"),
      progressive: (catalog.products || []).some((item) => item.category === "Digital Progressive"),
      coating: (catalog.addons || []).length > 0,
    };
    el.sectionTabs.innerHTML = Object.entries(sectionLabels)
      .filter(([key]) => available[key])
      .map(([key, label]) => `<button class="chip ${state.section === key ? "is-active" : ""}" type="button" data-section="${key}">${esc(label)}</button>`)
      .join("");

    el.singleVisionControls.hidden = state.section !== "single-vision";
    el.singleVisionTabs.innerHTML = Object.entries(singleVisionTypes)
      .filter(([key]) => (catalog.products || []).some((item) => {
        const previous = state.singleVisionType;
        state.singleVisionType = key;
        const matches = matchesSingleVisionType(item);
        state.singleVisionType = previous;
        return matches;
      }))
      .map(([key, label]) => `<button class="chip ${state.singleVisionType === key ? "is-active" : ""}" type="button" data-single-vision="${key}">${esc(label)}</button>`)
      .join("");

    el.progressiveControls.hidden = state.section !== "progressive";
    el.mandalayDesignTabs.innerHTML = progressiveDesigns
      .filter((item) => item.group === "mandalay")
      .map(renderDesignButton)
      .join("");
    el.iotDesignTabs.innerHTML = progressiveDesigns
      .filter((item) => item.group === "iot")
      .map(renderDesignButton)
      .join("");
  }

  function renderDesignButton(item) {
    const priceLabel = item.amount ? `+$${item.amount}` : "$0";
    return `<button class="chip ${state.progressiveDesign === item.key ? "is-active" : ""}" type="button" data-progressive-design="${item.key}">${esc(item.label)} <small>${priceLabel}</small></button>`;
  }

  function renderFilters() {
    const indexes = availableIndexes();
    if (!indexes.includes(state.index)) state.index = "all";
    fillSelect(el.indexFilter, indexes, state.index, "All indexes");
    fillSelect(el.treatmentFilter, treatmentOptions.slice(1).map((item) => item[1]), treatmentLabel(state.treatment), "All treatments");
    el.indexFilter.disabled = state.section === "coating";
    el.treatmentFilter.disabled = state.section === "coating" || state.section === "multifocal";
  }

  function treatmentLabel(value) {
    return treatmentOptions.find((item) => item[0] === value)?.[1] || "All treatments";
  }

  function treatmentValue(label) {
    return treatmentOptions.find((item) => item[1] === label)?.[0] || "all";
  }

  function renderHeader(columns) {
    el.resultsHead.innerHTML = `<tr>${columns.map((column) => `<th class="${column.className || ""}">${esc(column.label)}</th>`).join("")}</tr>`;
  }

  function renderCell(column, item) {
    return `<td class="${column.className || ""}" data-label="${esc(column.label)}">${column.render(item)}</td>`;
  }

  function lensName(item) {
    return [displayMaterialName(item.material), item.design].filter(Boolean).join(" / ");
  }

  function renderProductRows(rows) {
    const design = selectedProgressiveDesign();
    const columns =
      state.section === "progressive"
        ? [
            {
              label: "Lens",
              render: (item) => `<span class="lens-title"><strong>${esc(lensName(item))}</strong><span class="muted">${esc(item.category)}</span></span>`,
            },
            { label: "Usage", render: (item) => `<span class="pill">${esc(item.usage || "General")}</span>` },
            { label: "Feature", render: (item) => esc(item.feature || "") },
            {
              label: `${design.label} Price`,
              className: "price",
              render: (item) => {
                const price = progressivePrice(item);
                return price === null ? '<span class="unavailable">Not available</span>' : money(price);
              },
            },
          ]
        : [
            { label: "Family", render: (item) => esc(displayFamilyName(item)) },
            {
              label: "Lens",
              render: (item) => `<span class="lens-title"><strong>${esc(lensName(item))}</strong><span class="muted">${esc(item.category)}</span></span>`,
            },
            { label: "Usage", render: (item) => `<span class="pill">${esc(item.usage || "General")}</span>` },
            { label: "Feature", render: (item) => esc(item.feature || "") },
            { label: "Price", className: "price", render: (item) => money(item.price) },
          ];

    renderHeader(columns);
    el.resultsBody.innerHTML = rows.length
      ? rows.map((item) => `<tr>${columns.map((column) => renderCell(column, item)).join("")}</tr>`).join("")
      : `<tr><td class="empty-state" colspan="${columns.length}">No prices match the current filters.</td></tr>`;
  }

  function renderAddonRows(rows) {
    const columns = [
      { label: "Section", render: (item) => esc(item.section || "Extras") },
      { label: "Add-On", render: (item) => `<strong>${esc(item.name)}</strong>` },
      { label: "Price", className: "price", render: (item) => money(item.price) },
    ];
    renderHeader(columns);
    el.resultsBody.innerHTML = rows.length
      ? rows.map((item) => `<tr>${columns.map((column) => renderCell(column, item)).join("")}</tr>`).join("")
      : `<tr><td class="empty-state" colspan="${columns.length}">No add-ons match the current search.</td></tr>`;
  }

  function renderResults() {
    const title = state.section === "coating" ? "Coatings and extras" : `${sectionLabels[state.section]} prices`;
    el.resultsTitle.textContent = title;
    const rows = state.section === "coating" ? filteredAddons() : filteredProducts();
    el.resultCount.textContent = `${rows.length} ${rows.length === 1 ? "item" : "items"}`;
    if (state.section === "coating") renderAddonRows(rows);
    else renderProductRows(rows);
  }

  function renderUpdatedLabel() {
    const date = catalog.generatedAt ? new Date(catalog.generatedAt) : null;
    el.updatedLabel.textContent =
      date && !Number.isNaN(date.getTime()) ? `Price book ${date.toLocaleDateString()}` : "Mandalay Lens Book";
  }

  function render() {
    el.activeSectionTitle.textContent = sectionLabels[state.section];
    renderUpdatedLabel();
    renderTabs();
    renderFilters();
    renderResults();
  }

  function printCurrentView() {
    const rows = state.section === "coating" ? filteredAddons() : filteredProducts();
    const title = state.section === "coating" ? "Coatings and Add-Ons" : `${sectionLabels[state.section]} Price Guide`;
    const heading =
      state.section === "progressive" ? `${selectedProgressiveDesign().label} Progressive Prices` : title;
    const bodyRows = rows
      .map((item) => {
        if (state.section === "coating") {
          return `<tr><td>${esc(item.section || "Extras")}</td><td>${esc(item.name)}</td><td>${money(item.price)}</td></tr>`;
        }
        const price = state.section === "progressive" ? progressivePrice(item) : item.price;
        return `<tr><td>${esc(displayFamilyName(item))}</td><td>${esc(lensName(item))}</td><td>${esc([item.usage, item.feature].filter(Boolean).join(" / "))}</td><td>${price === null ? "Not available" : money(price)}</td></tr>`;
      })
      .join("");
    const popup = window.open("", "mandalay-client-print", "width=1100,height=900");
    if (!popup) return;
    popup.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(heading)}</title><style>body{font-family:Arial,sans-serif;margin:0;padding:.28in;color:#0c1422}h1{font-family:Arial,sans-serif;margin:0 0 6px;font-size:24px}.eyebrow{color:#0b5db8;text-transform:uppercase;font-weight:800;letter-spacing:.12em;font-size:11px}.lead{margin:0 0 14px;color:#53657a}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #d9e4f2;padding:6px 8px;text-align:left}th{background:#061425;color:white}.price,td:last-child{text-align:right;font-weight:800;color:#0b5db8}@media print{body{padding:.18in}}</style></head><body><p class="eyebrow">Mandalay Optical Labs</p><h1>${esc(heading)}</h1><p class="lead">Client price guide</p><table><thead><tr>${state.section === "coating" ? "<th>Section</th><th>Add-On</th><th>Price</th>" : "<th>Family</th><th>Lens</th><th>Usage</th><th>Price</th>"}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`);
    popup.document.close();
    popup.focus();
    popup.print();
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    const section = target.getAttribute?.("data-section");
    const singleVision = target.getAttribute?.("data-single-vision");
    const progressiveDesign = target.getAttribute?.("data-progressive-design");
    if (section) {
      state.section = section;
      state.index = "all";
      state.treatment = "all";
      render();
    }
    if (singleVision) {
      state.singleVisionType = singleVision;
      state.index = "all";
      state.treatment = "all";
      render();
    }
    if (progressiveDesign) {
      state.progressiveDesign = progressiveDesign;
      render();
    }
  });

  el.indexFilter.addEventListener("change", () => {
    state.index = el.indexFilter.value;
    renderResults();
  });

  el.treatmentFilter.addEventListener("change", () => {
    state.treatment = treatmentValue(el.treatmentFilter.value);
    renderResults();
  });

  el.searchInput.addEventListener("input", () => {
    state.search = el.searchInput.value;
    renderResults();
  });

  el.printViewButton.addEventListener("click", printCurrentView);

  el.copyLinkButton.addEventListener("click", async () => {
    const link = el.clientUrl.textContent.trim();
    try {
      await navigator.clipboard.writeText(link);
      el.copyLinkButton.textContent = "Copied";
      window.setTimeout(() => {
        el.copyLinkButton.textContent = "Copy Link";
      }, 1600);
    } catch (error) {
      window.prompt("Copy this link", link);
    }
  });

  render();
})();
