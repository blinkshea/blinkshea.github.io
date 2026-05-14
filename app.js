const STORAGE_KEY = "optical-lens-book.catalog";
const PASSWORD_STORAGE_KEY = "optical-lens-book.passwords";
const DEFAULT_CATALOG = { products: [], addons: [], shipping: [], stockReference: [] };
const DEFAULT_PASSWORDS = {
  admin: "Mandalay905",
  clientExit: "Mandalay",
  master: "",
};
const LEGACY_CLIENT_EXIT_PASSWORDS = ["Mandalay905"];
const SINGLE_VISION_CATEGORIES = ["Single Vision", "Lifestyle / Digital SV"];
const SECTION_LABELS = {
  none: "Choose a section",
  "single-vision": "Single vision",
  bifocal: "Bifocal",
  progressive: "Progressive",
  coating: "Coating",
};
const TREATMENT_OPTIONS = [
  { value: "all", label: "All treatments" },
  { value: "clear", label: "Clear" },
  { value: "photochromic", label: "Photochromic" },
  { value: "transition", label: "Transition" },
  { value: "polarized", label: "Polarized" },
];
const SINGLE_VISION_TYPE_LABELS = {
  "single-vision-core": "Single vision",
  "anti-fatigue": "Anti-Fatigue",
  "iot-anti-fatigue": "IOT Anti-Fatigue",
};
const PROGRESSIVE_PROGRAM_LABELS = {
  mandalay: "Mandalay",
  iot: "IOT",
};
const PROGRESSIVE_TIER_LABELS = {
  mandalay: {
    good: "Mandalay",
    better: "Mandalay Plus",
    best: "Mandalay Deluxe",
  },
  iot: {
    good: "IOT Essential (Good)",
    better: "IOT Endless (Better)",
    best: "IOT Camber (Best)",
  },
};
const INDEX_DISPLAY_ORDER = ["CR-39", "Poly", "1.56", "TriVex", "1.60", "1.67", "1.74"];
const HOUSE_BRAND_UPGRADES = [
  { key: "mandalay", label: "Mandalay", amount: 0 },
  { key: "mandalay-plus", label: "Mandalay Plus", amount: 20 },
  { key: "mandalay-deluxe", label: "Mandalay Deluxe", amount: 40 },
];
const IOT_UPGRADES = [
  { key: "iot-essential", label: "IOT Essential", amount: 15 },
  { key: "iot-endless", label: "IOT Endless", amount: 35 },
  { key: "iot-camber", label: "IOT Camber", amount: 60, limited: true },
];
const PROGRESSIVE_DESIGNS = [...HOUSE_BRAND_UPGRADES, ...IOT_UPGRADES];

const state = {
  catalog: normalizeCatalogSpelling(window.DEFAULT_CATALOG || DEFAULT_CATALOG),
  passwords: loadLocalPasswordSettings(),
  profitDisplayMode: {
    conant: "dollars",
    tog: "dollars",
  },
  hiddenProductColumns: [],
  hiddenCoatingColumns: [],
  hiddenPanels: [],
  compactPanels: {
    singleVisionCategory: false,
    lensFilters: false,
  },
  skuVisible: false,
  providerMode: "default",
  adminUnlocked: false,
  ownerUnlocked: false,
  editingProductId: null,
  addingItemType: "product",
  clientView: true,
  filters: {
    search: "",
    catalogSection: "single-vision",
    singleVisionType: "single-vision-core",
    singleVisionIndex: "all",
    singleVisionTreatment: "all",
    progressiveProgram: "mandalay",
    progressiveTier: "good",
    progressiveDesign: "mandalay",
  },
};

const el = {
  searchInput: document.querySelector("#searchInput"),
  indexFilter: document.querySelector("#indexFilter"),
  treatmentFilter: document.querySelector("#treatmentFilter"),
  contentGrid: document.querySelector("#contentGrid"),
  controlsPanel: document.querySelector("#controlsPanel"),
  resultsHead: document.querySelector("#resultsHead"),
  resultsBody: document.querySelector("#resultsBody"),
  columnControls: document.querySelector("#columnControls"),
  clientViewButton: document.querySelector("#clientViewButton"),
  activeFamilyTitle: document.querySelector("#activeFamilyTitle"),
  catalogListingPanel: document.querySelector("#catalogListingPanel"),
  familySwitcher: document.querySelector("#familySwitcher"),
  activeTierTitle: document.querySelector("#activeTierTitle"),
  singleVisionFiltersPanel: document.querySelector("#singleVisionFiltersPanel"),
  singleVisionFiltersSummary: document.querySelector("#singleVisionFiltersSummary"),
  singleVisionFiltersBody: document.querySelector("#singleVisionFiltersBody"),
  singleVisionTypeSwitcher: document.querySelector("#singleVisionTypeSwitcher"),
  progressiveFiltersPanel: document.querySelector("#progressiveFiltersPanel"),
  progressiveTitle: document.querySelector("#progressiveTitle"),
  progressiveProgramSwitcher: document.querySelector("#progressiveProgramSwitcher"),
  progressiveTierSwitcher: document.querySelector("#progressiveTierSwitcher"),
  lensFiltersPanel: document.querySelector("#lensFiltersPanel"),
  lensFiltersTitle: document.querySelector("#lensFiltersTitle"),
  lensFiltersSummary: document.querySelector("#lensFiltersSummary"),
  lensFiltersBody: document.querySelector("#lensFiltersBody"),
  adminMenu: document.querySelector(".admin-menu"),
  adminMenuSummary: document.querySelector(".admin-menu summary"),
  lockAdminButton: document.querySelector("#lockAdminButton"),
  changePasswordsButton: document.querySelector("#changePasswordsButton"),
  toggleSkuButton: document.querySelector("#toggleSkuButton"),
  toggleConantButton: document.querySelector("#toggleConantButton"),
  toggleTogButton: document.querySelector("#toggleTogButton"),
  priceEditorDialog: document.querySelector("#priceEditorDialog"),
  priceEditorForm: document.querySelector("#priceEditorForm"),
  priceEditorTitle: document.querySelector("#priceEditorTitle"),
  priceEditorMainPrice: document.querySelector("#priceEditorMainPrice"),
  priceEditorWholesale: document.querySelector("#priceEditorWholesale"),
  priceEditorTog: document.querySelector("#priceEditorTog"),
  priceEditorCancelButton: document.querySelector("#priceEditorCancelButton"),
  addonsControls: document.querySelector("#addonsControls"),
  addonsList: document.querySelector("#addonsList"),
  addonsPanel: document.querySelector("#addonsPanel"),
  secondaryPanelControls: document.querySelector("#secondaryPanelControls"),
  printBookletButton: document.querySelector("#printBookletButton"),
  exportDataButton: document.querySelector("#exportDataButton"),
  exportSkuButton: document.querySelector("#exportSkuButton"),
  resetDataButton: document.querySelector("#resetDataButton"),
  importFileInput: document.querySelector("#importFileInput"),
  addLensButton: document.querySelector("#addLensButton"),
  removeLensButton: document.querySelector("#removeLensButton"),
  addAddonButton: document.querySelector("#addAddonButton"),
  searchWrap: document.querySelector("#searchWrap"),
  addItemDialog: document.querySelector("#addItemDialog"),
  addItemForm: document.querySelector("#addItemForm"),
  addItemTitle: document.querySelector("#addItemTitle"),
  addItemFamily: document.querySelector("#addItemFamily"),
  addItemTier: document.querySelector("#addItemTier"),
  addItemCategory: document.querySelector("#addItemCategory"),
  addItemMaterial: document.querySelector("#addItemMaterial"),
  addItemDesign: document.querySelector("#addItemDesign"),
  addItemUsage: document.querySelector("#addItemUsage"),
  addItemFeature: document.querySelector("#addItemFeature"),
  addItemPrice: document.querySelector("#addItemPrice"),
  addItemWholesale: document.querySelector("#addItemWholesale"),
  addItemTog: document.querySelector("#addItemTog"),
  addItemCancelButton: document.querySelector("#addItemCancelButton"),
  removeItemDialog: document.querySelector("#removeItemDialog"),
  removeItemForm: document.querySelector("#removeItemForm"),
  removeItemFilter: document.querySelector("#removeItemFilter"),
  removeItemSelect: document.querySelector("#removeItemSelect"),
  removeItemCancelButton: document.querySelector("#removeItemCancelButton"),
  passwordDialog: document.querySelector("#passwordDialog"),
  passwordForm: document.querySelector("#passwordForm"),
  passwordDialogEyebrow: document.querySelector("#passwordDialogEyebrow"),
  passwordDialogTitle: document.querySelector("#passwordDialogTitle"),
  passwordDialogMessage: document.querySelector("#passwordDialogMessage"),
  passwordInput: document.querySelector("#passwordInput"),
  passwordError: document.querySelector("#passwordError"),
  passwordCancelButton: document.querySelector("#passwordCancelButton"),
  passwordSettingsDialog: document.querySelector("#passwordSettingsDialog"),
  passwordSettingsForm: document.querySelector("#passwordSettingsForm"),
  passwordSettingsAdmin: document.querySelector("#passwordSettingsAdmin"),
  passwordSettingsAdminConfirm: document.querySelector("#passwordSettingsAdminConfirm"),
  passwordSettingsClientExit: document.querySelector("#passwordSettingsClientExit"),
  passwordSettingsClientExitConfirm: document.querySelector("#passwordSettingsClientExitConfirm"),
  passwordSettingsMaster: document.querySelector("#passwordSettingsMaster"),
  passwordSettingsMasterConfirm: document.querySelector("#passwordSettingsMasterConfirm"),
  passwordSettingsError: document.querySelector("#passwordSettingsError"),
  passwordSettingsCancelButton: document.querySelector("#passwordSettingsCancelButton"),
  passwordSettingsResetButton: document.querySelector("#passwordSettingsResetButton"),
};

let pendingPasswordResolver = null;

const esc = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const currency = (value) =>
  value === null || value === undefined || Number.isNaN(Number(value))
    ? "-"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(Number(value));

const percent = (value) =>
  value === null || value === undefined || Number.isNaN(Number(value)) ? "-" : `${Number(value).toFixed(1)}%`;

function deepClone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function normalizeLocalPasswordSettings(value) {
  const clientExit = String(value?.clientExit || DEFAULT_PASSWORDS.clientExit).trim() || DEFAULT_PASSWORDS.clientExit;
  const master = String(value?.master || DEFAULT_PASSWORDS.master).trim();

  return {
    admin: String(value?.admin || DEFAULT_PASSWORDS.admin).trim() || DEFAULT_PASSWORDS.admin,
    clientExit: LEGACY_CLIENT_EXIT_PASSWORDS.includes(clientExit) ? DEFAULT_PASSWORDS.clientExit : clientExit,
    master,
  };
}

function loadLocalPasswordSettings() {
  try {
    const raw = window.localStorage.getItem(PASSWORD_STORAGE_KEY);
    return raw ? normalizeLocalPasswordSettings(JSON.parse(raw)) : deepClone(DEFAULT_PASSWORDS);
  } catch (error) {
    return deepClone(DEFAULT_PASSWORDS);
  }
}

function saveLocalPasswordSettings() {
  window.localStorage.setItem(PASSWORD_STORAGE_KEY, JSON.stringify(state.passwords));
}

function masterPassword() {
  return String(state.passwords.master || "").trim();
}

function hasMasterPassword() {
  return Boolean(masterPassword());
}

const isConantItem = (item) => item.proposedPrice === null || item.proposedPrice === undefined;
const mainPrice = (item) => item.proposedPrice ?? item.targetSellingPrice ?? item.mandalayRetail ?? item.pivotalRetail ?? null;
const clientBasePrice = (item) => item.basePrice ?? mainPrice(item);
const clientUpgradePrice = (item, amount) => {
  const base = clientBasePrice(item);
  return base === null || base === undefined ? null : Number((Number(base) + amount).toFixed(2));
};
const hasConantOption = (item) =>
  (item.mandalayWholesale !== null && item.mandalayWholesale !== undefined) ||
  (item.mandalayRetail !== null && item.mandalayRetail !== undefined);
const hasTogOption = (item) => item.proposedPrice !== null && item.proposedPrice !== undefined;
const byId = (id) => state.catalog.products.find((item) => item.id === id);
const normalizeIndex = (value) => (String(value || "").trim().toUpperCase() === "1.60" ? "1.6" : String(value || "").trim());
const marginFromPrice = (sellPrice, wholesale) =>
  sellPrice !== null && sellPrice !== undefined && wholesale !== null && wholesale !== undefined && Number(sellPrice) !== 0
    ? Number((((Number(sellPrice) - Number(wholesale)) / Number(sellPrice)) * 100).toFixed(1))
    : null;
const displayMaterialName = (value) => {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "HI-VEX") return "TriVex";
  if (normalized === "TRIVEX") return "TriVex";
  if (normalized === "1.6" || normalized === "1.60") return "1.60";
  return String(value || "").trim();
};

const compareText = (left, right) =>
  String(left || "").localeCompare(String(right || ""), undefined, { numeric: true });

function materialDisplayRank(item) {
  const material = displayMaterialName(normalizeIndex(item.material));
  const index = INDEX_DISPLAY_ORDER.indexOf(material);
  return index === -1 ? INDEX_DISPLAY_ORDER.length : index;
}

function compareProductRows(left, right) {
  const design = selectedProgressiveDesign();
  if (state.filters.catalogSection === "progressive" && design.limited) {
    const leftAvailabilityRank = isIotCamberAvailable(left) ? 0 : 1;
    const rightAvailabilityRank = isIotCamberAvailable(right) ? 0 : 1;
    if (leftAvailabilityRank !== rightAvailabilityRank) return leftAvailabilityRank - rightAvailabilityRank;
  }

  const materialCompare = materialDisplayRank(left) - materialDisplayRank(right);
  return (
    compareText(left.family, right.family) ||
    compareText(left.tier, right.tier) ||
    compareText(left.category, right.category) ||
    compareText(left.design, right.design) ||
    compareText(left.usage, right.usage) ||
    compareText(left.feature, right.feature) ||
    materialCompare ||
    compareText(displayMaterialName(left.material), displayMaterialName(right.material)) ||
    compareText(left.name, right.name)
  );
}

function sortProductRows(rows) {
  return [...rows].sort(compareProductRows);
}

function isProgressiveBaseItem(item) {
  return item.category === "Digital Progressive" && item.family === "Mandalay" && item.tier === "Essential";
}

function isIotCamberAvailable(item) {
  const material = displayMaterialName(normalizeIndex(item.material));
  const usage = String(item.usage || "").trim().toLowerCase();
  const feature = String(item.feature || "").trim();
  const isCamberMaterial = ["TriVex", "1.60", "1.67"].includes(material);
  if (!isCamberMaterial || feature) return false;
  return usage === "clear" || usage === "transition gen s" || usage === "transition 8" || usage === "transitions 8";
}

function renderUpgradePrice(item, upgrade) {
  if (upgrade.limited && !isIotCamberAvailable(item)) {
    return '<span class="upgrade-unavailable">Not available</span>';
  }
  return currency(clientUpgradePrice(item, upgrade.amount));
}

function selectedProgressiveDesign() {
  return PROGRESSIVE_DESIGNS.find((design) => design.key === state.filters.progressiveDesign) || PROGRESSIVE_DESIGNS[0];
}

function normalizeMandalayText(value) {
  return String(value || "")
    .replace(/Madalay/gi, "Mandalay")
    .replace(/Mandaly/gi, "Mandalay")
    .replace(/Mandlay/gi, "Mandalay")
    .replace(/MandalayPlus/gi, "Mandalay Plus");
}

function normalizeCatalogSpelling(catalog) {
  const normalized = deepClone(catalog || DEFAULT_CATALOG);

  normalized.products = (normalized.products || []).map((item) => ({
    ...item,
    family: normalizeMandalayText(item.family),
    sourceSheet: normalizeMandalayText(item.sourceSheet),
  }));

  normalized.shipping = (normalized.shipping || []).map((item) => ({
    ...item,
    vendor: normalizeMandalayText(item.vendor),
    method: normalizeMandalayText(item.method),
  }));

  normalized.generatedAt = catalog?.generatedAt;
  normalized.sourceWorkbook = catalog?.sourceWorkbook;
  return normalized;
}

const SKU_CODE_BOOK = {
  itemType: {
    LENS: "100",
    "COATING/ADD-ON": "900",
  },
  family: {
    MANDALAY: "110",
    "MANDALAY +": "120",
    "MANDALAY PLUS": "120",
    HORIZON: "130",
    IOT: "210",
    "ANTI-FATIGUE": "310",
    "ACOMODA II": "310",
    "IOT ENDLESS ANTI FATIGUE": "220",
  },
  tier: {
    CONVENTIONAL: "100",
    "ANTI-FATIGUE": "150",
    ESSENTIAL: "310",
    ENDLESS: "320",
    CAMBER: "330",
    BASE: "000",
  },
  category: {
    "SINGLE VISION": "100",
    "LIFESTYLE / DIGITAL SV": "150",
    MULTIFOCAL: "200",
    "DIGITAL PROGRESSIVE": "300",
    "ADD-ON": "900",
  },
  material: {
    "CR-39": "139",
    POLY: "200",
    "1.56": "156",
    TRIVEX: "300",
    "1.60": "160",
    "1.67": "167",
    "1.74": "174",
    NONE: "000",
  },
  design: {
    "SINGLE VISION": "100",
    "LENTICULAR LENS": "110",
    "LIFESTYLE LENS": "150",
    PROGRESSIVE: "300",
    "BIFOCAL FLAT TOP 28": "228",
    "BIFOCAL FLAT TOP 35": "235",
    "BIFOCAL FLAT TOP 45": "245",
    "BIFOCAL BLENDED 28": "328",
    "BIFOCAL BLENDED28": "328",
    "BIFOCAL CURVE TOP": "260",
    "BIFOCAL EXECUTIVE": "270",
    "BIFOCAL ROUND TOP": "280",
    "TRIFOCAL 7*28": "728",
    "TRIFOCAL 8*35": "835",
    NONE: "000",
  },
  usage: {
    CLEAR: "100",
    SUN: "200",
    PHOTO: "300",
    TRANSITION: "400",
    "TRANSITION 8": "408",
    "TRANSITIONS 8": "408",
    "TRANSITION GEN S": "410",
    "TRANSITIONS GEN S": "410",
    "TRANSITION XTRACTIVE": "420",
    NONE: "000",
  },
  feature: {
    STANDARD: "000",
    POLARIZED: "200",
    VANTAGE: "410",
    XTRACTIVE: "420",
    XTRACTIVE: "420",
    NONE: "000",
  },
  addonSection: {
    COATINGS: "910",
    OVERSIZE: "920",
  },
  addonName: {
    "STANDARD AR": "101",
    "PREMIUM AR": "102",
    "SUPER AR": "103",
    "BLUELIGHT FILTER": "104",
    "SOLID TINT": "201",
    "GRADIENT TINT": "202",
    "DOUBLE TINT": "203",
    MIRROR: "204",
    EDGING: "301",
    WRAP: "302",
    "PRISM OVER 2D": "401",
    "CYLINDER OVER 4D": "402",
    "SPHERE ABOVE 10D (1.50, 1.56, 1.59)": "403",
    "SPHERE ABOVE 14D (1.60, 1.67, 1.74)": "404",
    "80MM": "801",
    "85MM": "805",
  },
};

const SKU_SEGMENT_DEFINITIONS = [
  ["S1", "Item type", "100 = lens; 900 = coating/add-on"],
  ["S2", "Family / series or add-on section", "Lens family such as Mandalay, IOT, Horizon; or coating section such as Coatings/Oversize"],
  ["S3", "Tier / program or add-on name", "Lens tier such as Conventional, Essential, Endless, Camber; or the specific coating/add-on name"],
  ["S4", "Lens category", "Single vision, lifestyle/digital SV, multifocal, digital progressive, or add-on"],
  ["S5", "Material", "CR-39, Poly, 1.56, TriVex, 1.60, 1.67, 1.74"],
  ["S6", "Lens design", "Single vision, progressive, bifocal/trifocal design, lenticular, lifestyle lens"],
  ["S7", "Usage / treatment", "Clear, sun, photo, transition, transition generation"],
  ["S8", "Feature / coating flag", "Standard, polarized, Vantage, XTRActive, or coating feature"],
];

function skuLookupValue(value, part) {
  let normalized = normalizeMandalayText(String(value || "").trim());
  if (!normalized) return "NONE";
  if (part === "material") normalized = displayMaterialName(normalized);
  return normalized
    .replace(/HI[- ]?VEX/gi, "TriVex")
    .replace(/TRIVEX/gi, "TriVex")
    .replace(/1\.6$/g, "1.60")
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function numericFallbackCode(part, value) {
  const text = `${part}:${skuLookupValue(value, part)}`;
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 900;
  }
  return String(700 + (hash % 200)).padStart(3, "0");
}

function skuCode(part, value) {
  const key = skuLookupValue(value, part);
  return SKU_CODE_BOOK[part]?.[key] || numericFallbackCode(part, value);
}

function skuSegments(item) {
  return [
    { position: "S1", label: "Item type", code: skuCode("itemType", "Lens"), value: "Lens" },
    { position: "S2", label: "Family / series", code: skuCode("family", displayFamilyName(item)), value: displayFamilyName(item) || "Lens" },
    { position: "S3", label: "Tier / program", code: skuCode("tier", item.tier || "Base"), value: item.tier || "Base" },
    { position: "S4", label: "Lens category", code: skuCode("category", item.category), value: item.category || "Lens" },
    { position: "S5", label: "Material", code: skuCode("material", displayMaterialName(item.material) || "None"), value: displayMaterialName(item.material) || "None" },
    { position: "S6", label: "Lens design", code: skuCode("design", item.design || "None"), value: item.design || "None" },
    { position: "S7", label: "Usage / treatment", code: skuCode("usage", item.usage || "Clear"), value: item.usage || "Clear" },
    { position: "S8", label: "Feature / coating", code: skuCode("feature", item.feature || "Standard"), value: item.feature || "Standard" },
  ];
}

function lensSku(item) {
  return skuSegments(item).map((segment) => segment.code).join("-");
}

function addonSkuSegments(item) {
  return [
    { position: "S1", label: "Item type", code: skuCode("itemType", "Coating/Add-On"), value: "Coating/Add-On" },
    { position: "S2", label: "Add-on section", code: skuCode("addonSection", item.section || "Coatings"), value: item.section || "Coatings" },
    { position: "S3", label: "Add-on name", code: skuCode("addonName", item.name || "Add-On"), value: item.name || "Add-On" },
    { position: "S4", label: "Lens category", code: skuCode("category", "Add-On"), value: "Add-On" },
    { position: "S5", label: "Material", code: skuCode("material", "None"), value: "None" },
    { position: "S6", label: "Lens design", code: skuCode("design", "None"), value: "None" },
    { position: "S7", label: "Usage / treatment", code: skuCode("usage", "None"), value: "None" },
    { position: "S8", label: "Feature / coating", code: skuCode("feature", "Standard"), value: item.notes || "Standard" },
  ];
}

function addonSku(item) {
  return addonSkuSegments(item).map((segment) => segment.code).join("-");
}

function activeDisplayPrice(item) {
  if (state.providerMode === "conant") return item.mandalayRetail ?? null;
  if (state.providerMode === "tog") return item.proposedPrice ?? null;
  return mainPrice(item);
}

function activePriceLabel() {
  if (state.providerMode === "conant") return "Conant Price";
  if (state.providerMode === "tog") return "TOG Proposal";
  return "Price";
}

function providerSellPrice(item, provider) {
  if (provider === "conant") return item.mandalayRetail ?? null;
  if (provider === "tog") return item.proposedPrice ?? null;
  return null;
}

function profitAmount(sellPrice, wholesale) {
  return sellPrice !== null && sellPrice !== undefined && wholesale !== null && wholesale !== undefined
    ? Number((Number(sellPrice) - Number(wholesale)).toFixed(2))
    : null;
}

function profitColumnLabel(provider) {
  if (provider === "conant") {
    return state.profitDisplayMode.conant === "dollars" ? "Profit Conant" : "Margin Conant";
  }
  return state.profitDisplayMode.tog === "dollars" ? "Profit TOG" : "Margin TOG";
}

function profitToggleLabel(provider) {
  return state.profitDisplayMode[provider] === "dollars" ? "Show %" : "Show $";
}

function renderProfitValue(sellPrice, wholesale, provider) {
  const amount = profitAmount(sellPrice, wholesale);
  if (state.profitDisplayMode[provider] === "dollars") return currency(amount);
  return percent(marginFromPrice(sellPrice, wholesale));
}

function syncDynamicColumnLabels() {
  [...PRODUCT_COLUMNS, ...COATING_COLUMNS].forEach((column) => {
    if (column.key === "price") column.label = activePriceLabel();
    if (column.key === "margin") column.label = profitColumnLabel("conant");
    if (column.key === "margin-tog") column.label = profitColumnLabel("tog");
  });
}

const PRODUCT_COLUMNS = [
  { key: "family", label: "Family", render: (item) => esc(displayFamilyName(item)) },
  { key: "sku", label: "SKU", render: (item) => `<span class="sku-text">${esc(lensSku(item))}</span>` },
  {
    key: "product",
    label: "Product",
    render: (item) =>
      `<strong>${esc([displayMaterialName(item.material), item.design].filter(Boolean).join(" · "))}</strong>${state.skuVisible ? `<br /><span class="sku-badge">${esc(lensSku(item))}</span>` : ""}<br /><span class="muted lens-category">${esc(item.category)}</span>`,
  },
  { key: "usage", label: "Usage", render: (item) => `<span class="pill">${esc(item.usage || "General")}</span>` },
  { key: "price", label: "Price", className: "price", render: (item) => currency(activeDisplayPrice(item)) },
  { key: "wholesale-conant", label: "Wholesale Conant", className: "price", render: (item) => currency(item.mandalayWholesale) },
  {
    key: "margin",
    label: "Profit Conant",
    className: "price",
    render: (item) => renderProfitValue(providerSellPrice(item, "conant"), item.mandalayWholesale, "conant"),
  },
  { key: "wholesale-tog", label: "Wholesale TOG", className: "price", render: (item) => currency(item.togReference) },
  {
    key: "margin-tog",
    label: "Profit TOG",
    className: "price",
    render: (item) => renderProfitValue(providerSellPrice(item, "tog"), item.togReference, "tog"),
  },
];
const COATING_COLUMNS = [
  { key: "section", label: "Section", render: (item) => esc(item.section) },
  { key: "add-on", label: "Add-On", render: (item) => `<strong>${esc(item.name)}</strong>` },
  { key: "price", label: "Price", className: "price", render: (item) => currency(activeDisplayPrice(item)) },
  { key: "wholesale-conant", label: "Wholesale Conant", className: "price", render: (item) => currency(item.mandalayWholesale) },
  {
    key: "margin",
    label: "Profit Conant",
    className: "price",
    render: (item) => renderProfitValue(providerSellPrice(item, "conant"), item.mandalayWholesale, "conant"),
  },
  { key: "wholesale-tog", label: "Wholesale TOG", className: "price", render: (item) => currency(item.togReference) },
  {
    key: "margin-tog",
    label: "Profit TOG",
    className: "price",
    render: (item) => renderProfitValue(providerSellPrice(item, "tog"), item.togReference, "tog"),
  },
];
function progressivePriceColumns() {
  const design = selectedProgressiveDesign();
  return [
    {
      key: "product",
      label: "Lens",
      render: (item) =>
        `<strong>${esc([displayMaterialName(item.material), item.design].filter(Boolean).join(" / "))}</strong><br /><span class="muted lens-category">${esc(item.category)}</span>`,
    },
    { key: "usage", label: "Usage", render: (item) => `<span class="pill">${esc(item.usage || "General")}</span>` },
    { key: "feature", label: "Feature", render: (item) => esc(item.feature || "") },
    {
      key: "selected-price",
      label: `${design.label} Price`,
      className: "price upgrade-price",
      render: (item) => renderUpgradePrice(item, design),
    },
  ];
}
const SECONDARY_PANELS = [
  { key: "addons", label: "Coatings and extras", element: () => el.addonsPanel },
];

function displayFamilyName(item) {
  if (item.tier === "Anti-Fatigue" && item.family === "Acomoda II") return "Anti-fatigue";
  if (item.tier === "Anti-Fatigue" && item.family === "IOT") return "IOT Endless Anti Fatigue";
  return item.family;
}

function loadLocalCatalog() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const savedCatalog = normalizeCatalogSpelling(JSON.parse(raw));
    const bundledCatalog = normalizeCatalogSpelling(window.DEFAULT_CATALOG || DEFAULT_CATALOG);
    const savedGeneratedAt = Date.parse(savedCatalog.generatedAt || "");
    const bundledGeneratedAt = Date.parse(bundledCatalog.generatedAt || "");
    const savedProductCount = Array.isArray(savedCatalog.products) ? savedCatalog.products.length : 0;
    const bundledProductCount = Array.isArray(bundledCatalog.products) ? bundledCatalog.products.length : 0;

    if (
      bundledProductCount > savedProductCount ||
      (Number.isFinite(bundledGeneratedAt) && (!Number.isFinite(savedGeneratedAt) || bundledGeneratedAt > savedGeneratedAt))
    ) {
      state.catalog = deepClone(bundledCatalog);
      saveLocalCatalog();
      return;
    }

    state.catalog = savedCatalog;
    saveLocalCatalog();
  } catch (error) {
    console.warn("Unable to load saved catalog", error);
  }
}

function saveLocalCatalog() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.catalog));
}

function fillSelect(select, values, currentValue, allLabel) {
  select.innerHTML = "";
  [{ value: "all", label: allLabel }, ...values.map((value) => ({ value, label: value }))].forEach((optionData) => {
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.label;
    if (optionData.value === currentValue) option.selected = true;
    select.appendChild(option);
  });
}

function renderCompactPanel(key, panel, body, summaryEl, summaryText) {
  const expanded = Boolean(state.compactPanels[key]);
  const toggle = panel.querySelector(`[data-compact-panel-toggle="${key}"]`);
  panel.classList.toggle("is-collapsed", !expanded);
  if (body) body.hidden = !expanded;
  if (summaryEl) summaryEl.textContent = summaryText;
  if (!toggle) return;
  toggle.classList.toggle("triangle-toggle-visible", expanded);
  toggle.classList.toggle("triangle-toggle-hidden", !expanded);
  toggle.setAttribute("aria-expanded", String(expanded));
}

function parseFormNumber(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function searchableText(item) {
  return [item.family, item.tier, item.category, item.material, item.design, item.usage, item.feature, item.sourceSheet, lensSku(item)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function searchableAddonText(item) {
  return [item.section, item.name, item.notes, addonSku(item)].filter(Boolean).join(" ").toLowerCase();
}

function removeLensLabel(item) {
  return [
    displayFamilyName(item),
    item.tier,
    item.category,
    displayMaterialName(item.material),
    item.design,
    item.usage,
    item.feature,
  ]
    .filter(Boolean)
    .join(" | ");
}

function matchesSingleVisionType(item) {
  const type = state.filters.singleVisionType;
  if (type === "single-vision-core") return item.category === "Single Vision";
  if (type === "anti-fatigue") return item.tier === "Anti-Fatigue" && item.family === "Acomoda II";
  if (type === "iot-anti-fatigue") return item.tier === "Anti-Fatigue" && item.family === "IOT";
  return SINGLE_VISION_CATEGORIES.includes(item.category);
}

function matchesSection(item) {
  const section = state.filters.catalogSection;
  if (section === "none") return false;
  if (section === "single-vision") return matchesSingleVisionType(item);
  if (section === "bifocal") return item.category === "Multifocal";
  if (section === "progressive") return matchesProgressiveFilter(item);
  return false;
}

function progressiveProgramKey(item) {
  if (item.family === "IOT" && ["Essential", "Endless", "Camber"].includes(item.tier)) return "iot";
  if (item.family === "Mandalay" && item.tier === "Essential") return "mandalay";
  if (item.family === "Mandalay Plus" && item.tier === "Endless") return "mandalay";
  if (item.family === "Horizon" && item.tier === "Camber") return "mandalay";
  return "";
}

function progressiveTierKey(item) {
  if (item.tier === "Essential") return "good";
  if (item.tier === "Endless") return "better";
  if (item.tier === "Camber") return "best";
  return "";
}

function matchesProgressiveFilter(item) {
  return isProgressiveBaseItem(item);
}

function matchesSingleVisionTreatment(item) {
  const treatment = state.filters.singleVisionTreatment;
  const usage = String(item.usage || "").toLowerCase();
  const feature = String(item.feature || "").toLowerCase();
  if (treatment === "all") return true;
  if (treatment === "clear") return usage === "clear";
  if (treatment === "photochromic") return usage.includes("photo");
  if (treatment === "transition") return usage.includes("transition") || feature.includes("vantage") || feature.includes("xtractive");
  if (treatment === "polarized") return feature.includes("polarized");
  return true;
}

function matchesProviderMode(item) {
  if (state.providerMode === "conant" && !hasConantOption(item)) return false;
  if (state.providerMode === "tog" && !hasTogOption(item)) return false;
  return true;
}

function providerVisibleProducts() {
  return state.catalog.products.filter((item) => matchesProviderMode(item));
}

function providerVisibleCoatings() {
  return state.catalog.addons.filter((item) => matchesProviderMode(item));
}

function availableCatalogSections() {
  const products = providerVisibleProducts();
  return [
    ["single-vision", products.some((item) => SINGLE_VISION_CATEGORIES.includes(item.category))],
    ["bifocal", products.some((item) => item.category === "Multifocal")],
    ["progressive", products.some((item) => item.category === "Digital Progressive")],
    ["coating", providerVisibleCoatings().length > 0],
  ]
    .filter(([, available]) => available)
    .map(([value]) => value);
}

function availableSingleVisionTypes() {
  const products = providerVisibleProducts();
  return Object.keys(SINGLE_VISION_TYPE_LABELS).filter((value) => {
    if (value === "single-vision-core") return products.some((item) => item.category === "Single Vision");
    if (value === "anti-fatigue") return products.some((item) => item.tier === "Anti-Fatigue" && item.family === "Acomoda II");
    if (value === "iot-anti-fatigue") return products.some((item) => item.tier === "Anti-Fatigue" && item.family === "IOT");
    return false;
  });
}

function availableProgressivePrograms() {
  return Object.keys(PROGRESSIVE_PROGRAM_LABELS).filter((value) =>
    providerVisibleProducts().some((item) => item.category === "Digital Progressive" && progressiveProgramKey(item) === value)
  );
}

function availableProgressiveTiers(program) {
  return Object.keys(PROGRESSIVE_TIER_LABELS[program] || {}).filter((value) =>
    providerVisibleProducts().some(
      (item) => item.category === "Digital Progressive" && progressiveProgramKey(item) === program && progressiveTierKey(item) === value
    )
  );
}

function firstAvailableOr(currentValue, availableValues, fallbackValue) {
  if (availableValues.includes(currentValue)) return currentValue;
  return availableValues[0] ?? fallbackValue;
}

function ensureAvailableFilters() {
  const sections = availableCatalogSections();
  if (state.filters.catalogSection !== "none") {
    state.filters.catalogSection = firstAvailableOr(state.filters.catalogSection, sections, "none");
  }

  if (state.filters.catalogSection === "single-vision") {
    state.filters.singleVisionType = firstAvailableOr(state.filters.singleVisionType, availableSingleVisionTypes(), "single-vision-core");
  }

  if (state.filters.catalogSection === "progressive") {
    if (!PROGRESSIVE_DESIGNS.some((design) => design.key === state.filters.progressiveDesign)) {
      state.filters.progressiveDesign = "mandalay";
    }
    state.filters.progressiveProgram = firstAvailableOr(state.filters.progressiveProgram, availableProgressivePrograms(), "mandalay");
    state.filters.progressiveTier = firstAvailableOr(
      state.filters.progressiveTier,
      availableProgressiveTiers(state.filters.progressiveProgram),
      "good"
    );
  }
}

function getFilteredProducts() {
  return sortProductRows(state.catalog.products.filter((item) => {
    if (state.filters.catalogSection === "coating") return false;
    if (!matchesProviderMode(item)) return false;
    if (!matchesSection(item)) return false;
    if (state.filters.search && !searchableText(item).includes(state.filters.search.toLowerCase())) return false;
    if (state.filters.catalogSection === "single-vision" || state.filters.catalogSection === "progressive") {
      if (state.filters.singleVisionIndex !== "all" && displayMaterialName(normalizeIndex(item.material)) !== state.filters.singleVisionIndex) return false;
      if (!matchesSingleVisionTreatment(item)) return false;
    }
    return true;
  }));
}

function getVisibleCoatings() {
  return state.catalog.addons.filter((item) => {
    if (!matchesProviderMode(item)) return false;
    if (state.filters.search && !searchableAddonText(item).includes(state.filters.search.toLowerCase())) return false;
    return true;
  });
}

function renderCatalogSwitcher() {
  el.activeFamilyTitle.textContent = SECTION_LABELS[state.filters.catalogSection];
  const availableSections = availableCatalogSections();
  el.familySwitcher.innerHTML = [
    ["single-vision", "Single vision"],
    ["bifocal", "Bifocal"],
    ["progressive", "Progressive"],
    ["coating", "Coating"],
  ]
    .filter(([value]) => availableSections.includes(value))
    .map(
      ([value, label]) =>
        `<button class="family-chip ${value === "coating" ? "family-chip-coating" : ""} ${state.filters.catalogSection === value ? "is-active" : ""}" data-catalog-section="${value}" type="button">${label}</button>`
    )
    .join("");
}

function renderSingleVisionFilters() {
  const showing = state.filters.catalogSection === "single-vision";
  el.singleVisionFiltersPanel.hidden = !showing;
  renderCompactPanel(
    "singleVisionCategory",
    el.singleVisionFiltersPanel,
    el.singleVisionFiltersBody,
    el.singleVisionFiltersSummary,
    SINGLE_VISION_TYPE_LABELS[state.filters.singleVisionType]
  );
  el.activeTierTitle.textContent = showing
    ? SINGLE_VISION_TYPE_LABELS[state.filters.singleVisionType]
    : "Choose a lens category";
  if (!showing) return;

  const availableTypes = availableSingleVisionTypes();
  el.singleVisionTypeSwitcher.innerHTML = Object.entries(SINGLE_VISION_TYPE_LABELS)
    .filter(([value]) => availableTypes.includes(value))
    .map(
      ([value, label]) =>
        `<button class="family-chip ${state.filters.singleVisionType === value ? "is-active" : ""}" data-single-vision-type="${value}" type="button">${label}</button>`
    )
    .join("");
}

function renderProgressiveFilters() {
  const showing = state.filters.catalogSection === "progressive";
  el.progressiveFiltersPanel.hidden = !showing;
  if (!showing) return;

  el.progressiveTitle.textContent = "Progressive design upgrades";
  el.progressiveProgramSwitcher.innerHTML = HOUSE_BRAND_UPGRADES.map(
    (upgrade) =>
      `<button class="family-chip upgrade-chip ${state.filters.progressiveDesign === upgrade.key ? "is-active" : ""}" data-progressive-design="${upgrade.key}" type="button">${esc(upgrade.label)}${upgrade.amount ? ` +$${upgrade.amount}` : " base"}</button>`
  ).join("");
  el.progressiveTierSwitcher.innerHTML = IOT_UPGRADES.map(
    (upgrade) =>
      `<button class="family-chip upgrade-chip ${upgrade.limited ? "upgrade-chip-limited" : ""} ${state.filters.progressiveDesign === upgrade.key ? "is-active" : ""}" data-progressive-design="${upgrade.key}" type="button">${esc(upgrade.label)} +$${upgrade.amount}${upgrade.limited ? " limited" : ""}</button>`
  ).join("");
}

function renderLensFilters() {
  const showing = ["single-vision", "progressive"].includes(state.filters.catalogSection);
  el.lensFiltersPanel.hidden = !showing;
  if (!showing) return;

  const sourceProducts =
    state.filters.catalogSection === "progressive"
      ? providerVisibleProducts().filter((item) => matchesProgressiveFilter(item))
      : providerVisibleProducts().filter((item) => matchesSingleVisionType(item));

  const indexes = [...new Set(sourceProducts.map((item) => displayMaterialName(normalizeIndex(item.material))).filter(Boolean))].sort((a, b) => {
    const left = INDEX_DISPLAY_ORDER.indexOf(a);
    const right = INDEX_DISPLAY_ORDER.indexOf(b);
    if (left !== -1 || right !== -1) {
      if (left === -1) return 1;
      if (right === -1) return -1;
      return left - right;
    }
    return a.localeCompare(b, undefined, { numeric: true });
  });

  el.lensFiltersTitle.textContent =
    state.filters.catalogSection === "progressive"
      ? "Refine the selected progressive lenses"
      : "Refine the selected lens category";

  const selectedIndexLabel = state.filters.singleVisionIndex === "all" ? "All materials" : state.filters.singleVisionIndex;
  const selectedTreatmentLabel =
    TREATMENT_OPTIONS.find((item) => item.value === state.filters.singleVisionTreatment)?.label || TREATMENT_OPTIONS[0].label;
  renderCompactPanel(
    "lensFilters",
    el.lensFiltersPanel,
    el.lensFiltersBody,
    el.lensFiltersSummary,
    `${selectedIndexLabel} / ${selectedTreatmentLabel}`
  );

  fillSelect(el.indexFilter, indexes, state.filters.singleVisionIndex, "All materials");
  fillSelect(
    el.treatmentFilter,
    TREATMENT_OPTIONS.slice(1).map((item) => item.label),
    selectedTreatmentLabel,
    TREATMENT_OPTIONS[0].label
  );
}

function visibleProductColumns() {
  syncDynamicColumnLabels();
  const providerKeys =
    state.providerMode === "conant"
      ? ["family", "sku", "product", "usage", "wholesale-conant", "price", "margin"]
      : state.providerMode === "tog"
        ? ["family", "sku", "product", "usage", "wholesale-tog", "price", "margin-tog"]
        : null;
  return PRODUCT_COLUMNS.filter((column) => {
    if (providerKeys && !providerKeys.includes(column.key)) return false;
    if (column.key === "sku" && !state.skuVisible) return false;
    return !state.hiddenProductColumns.includes(column.key);
  });
}

function visibleCoatingColumns() {
  syncDynamicColumnLabels();
  const providerKeys =
    state.providerMode === "conant"
      ? ["section", "add-on", "wholesale-conant", "price", "margin"]
      : state.providerMode === "tog"
        ? ["section", "add-on", "wholesale-tog", "price", "margin-tog"]
        : null;
  return COATING_COLUMNS.filter((column) => {
    if (providerKeys && !providerKeys.includes(column.key)) return false;
    return !state.hiddenCoatingColumns.includes(column.key);
  });
}

function clientFacingProductColumns() {
  return visibleProductColumns().filter((column) => ["family", "sku", "product", "usage", "price"].includes(column.key));
}

function clientFacingCoatingColumns() {
  return visibleCoatingColumns().filter((column) => ["section", "add-on", "price"].includes(column.key));
}

function renderColumnControls() {
  if (state.clientView || state.filters.catalogSection === "none") {
    el.columnControls.innerHTML = "";
    el.addonsControls.innerHTML = "";
    return;
  }

  syncDynamicColumnLabels();
  const columns = state.filters.catalogSection === "coating" ? COATING_COLUMNS : PRODUCT_COLUMNS;
  const hiddenKeys = state.filters.catalogSection === "coating" ? state.hiddenCoatingColumns : state.hiddenProductColumns;
  const hidden = columns.filter((column) => hiddenKeys.includes(column.key));
  const resetLabel = state.filters.catalogSection === "coating" ? "Show all coating columns" : "Show all columns";
  const target = state.filters.catalogSection === "coating" ? el.addonsControls : el.columnControls;
  el.columnControls.innerHTML = "";
  el.addonsControls.innerHTML = "";
  target.innerHTML = `
    ${columns.map(
      (column) =>
        `<button class="column-toggle-chip ${hiddenKeys.includes(column.key) ? "is-hidden triangle-toggle-hidden" : "triangle-toggle-visible"}" type="button" data-column-toggle="${column.key}" aria-label="${hiddenKeys.includes(column.key) ? "Show" : "Hide"} ${column.label}">${column.label}</button>`
    ).join("")}
    ${hidden.map((column) => `<button class="column-restore-chip triangle-toggle-hidden" type="button" data-column-restore="${column.key}" aria-label="Show ${column.label}">${column.label}</button>`).join("")}
    <button class="column-reset-button" type="button" data-reset-columns>${resetLabel}</button>
  `;
}

function renderSecondaryPanels() {
  if (state.filters.catalogSection !== "coating") {
    SECONDARY_PANELS.forEach((panel) => {
      panel.element().hidden = true;
    });
    el.secondaryPanelControls.innerHTML = "";
    return;
  }

  SECONDARY_PANELS.forEach((panel) => {
    panel.element().hidden = state.hiddenPanels.includes(panel.key);
  });

  const hiddenPanels = SECONDARY_PANELS.filter((panel) => state.hiddenPanels.includes(panel.key));
  el.secondaryPanelControls.innerHTML = hiddenPanels.length
    ? `${hiddenPanels
        .map((panel) => `<button class="column-restore-chip triangle-toggle-hidden" type="button" data-panel-restore="${panel.key}" aria-label="Show ${panel.label}">${panel.label}</button>`)
        .join("")}
      <button class="column-reset-button" type="button" data-panels-reset>Show all lower panels</button>`
    : "";
}

function renderColumnHeaderCell(column) {
  if (state.clientView || column.key === "admin-edit") {
    return `<th>${column.label}</th>`;
  }

  const hideButton = `<button class="column-header-button triangle-toggle-visible" type="button" data-column-toggle="${column.key}" aria-label="Hide ${column.label}">${column.label}</button>`;

  if (column.key !== "margin" && column.key !== "margin-tog") {
    return `<th>${hideButton}</th>`;
  }

  const provider = column.key === "margin" ? "conant" : "tog";
  return `<th><div class="column-header-stack">${hideButton}<button class="column-mode-toggle" type="button" data-profit-toggle="${provider}" aria-label="Toggle ${column.label} between dollars and percent">${profitToggleLabel(provider)}</button></div></th>`;
}

function setTableHeaders(columns) {
  el.resultsHead.innerHTML = `
    <tr>
      ${columns.map((column) => renderColumnHeaderCell(column)).join("")}
    </tr>
  `;
}

function renderResponsiveCell(column, item) {
  return `<td class="${column.className || ""}" data-label="${esc(column.label)}">${column.render(item)}</td>`;
}

function renderResults(rows) {
  if (state.filters.catalogSection === "none") {
    el.resultsHead.innerHTML = "";
    el.columnControls.innerHTML = "";
    el.resultsBody.innerHTML =
      '<tr><td class="muted">Select Single vision, Bifocal, Progressive, or Coating to view the lens catalog.</td></tr>';
    return;
  }

  if (state.filters.catalogSection === "coating") {
    el.resultsHead.innerHTML = "";
    el.resultsBody.innerHTML = "";
    return;
  }

  const columns = state.filters.catalogSection === "progressive"
    ? progressivePriceColumns()
    : state.clientView
      ? clientFacingProductColumns()
      : visibleProductColumns();
  const displayColumns = state.adminUnlocked && !state.clientView && state.filters.catalogSection !== "progressive"
    ? [{ key: "admin-edit", label: "Edit", className: "price", render: (item) => `<button class="button button-ghost row-edit-button" type="button" data-edit-product="${item.id}">Edit</button>` }, ...columns]
    : columns;
  setTableHeaders(displayColumns);
  renderColumnControls();
  el.resultsBody.innerHTML = rows.length
    ? rows
        .map((item) => {
          return `
            <tr>
              ${displayColumns
                .map((column) => renderResponsiveCell(column, item))
                .join("")}
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="${Math.max(displayColumns.length, 1)}" class="muted">No products match the current search and filters.</td></tr>`;
}

function parseNullableNumber(value) {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function renderAddons() {
  if (state.filters.catalogSection === "coating") {
    const columns = state.clientView ? clientFacingCoatingColumns() : visibleCoatingColumns();
    renderColumnControls();
    el.addonsList.className = "table-wrap";
    const items = getVisibleCoatings();
    el.addonsList.innerHTML = `
      <table>
        <thead>
          <tr>
            ${columns.map((column) => renderColumnHeaderCell(column)).join("")}
          </tr>
        </thead>
        <tbody>
          ${
            items.length
              ? items
                  .map(
                    (item) => `
                      <tr>
                        ${columns
                          .map((column) => renderResponsiveCell(column, item))
                          .join("")}
                      </tr>
                    `
                  )
                  .join("")
              : `<tr><td colspan="${Math.max(columns.length, 1)}" class="muted">No add-ons match the current search.</td></tr>`
          }
        </tbody>
      </table>
    `;
    return;
  }

  el.addonsControls.innerHTML = "";
  el.addonsList.className = "stack-list";
  el.addonsList.innerHTML = "";
}

function openPrintBooklet() {
  const products = state.catalog.products.filter((item) => mainPrice(item) !== null && mainPrice(item) !== undefined);
  const sortBookletRows = sortProductRows;
  const makeLensSection = (title, rows, eyebrow = "Catalog") => ({
    type: "lens",
    eyebrow,
    title,
    rows: sortBookletRows(rows),
  });
  const makeProgressiveSection = (rows) => ({
    type: "progressive",
    eyebrow: "Progressives",
    title: `${selectedProgressiveDesign().label} Progressive Prices`,
    rows: sortBookletRows(rows),
  });
  const renderStandardBookletSection = (section) =>
    `<section class="booklet-section"><p class="eyebrow">${esc(section.eyebrow)}</p><h2>${esc(section.title)}</h2><table class="booklet-table"><thead><tr><th>Lens</th><th>Usage</th><th>Feature</th><th>Pricing</th></tr></thead><tbody>${section.rows
      .map((item) => `<tr><td>${esc([displayMaterialName(item.material), item.design].filter(Boolean).join(" / "))}</td><td>${esc(item.usage || "")}</td><td>${esc(item.feature || "")}</td><td>${currency(mainPrice(item))}</td></tr>`)
      .join("")}</tbody></table></section>`;
  const renderProgressiveBookletSection = (section) =>
    `<section class="booklet-section progressive-booklet-section"><p class="eyebrow">${esc(section.eyebrow)}</p><h2>${esc(section.title)}</h2><table class="booklet-table progressive-booklet-table"><thead><tr><th>Lens</th><th>Usage</th><th>${esc(selectedProgressiveDesign().label)} Pricing</th></tr></thead><tbody>${section.rows
      .map(
        (item) =>
          `<tr><td>${esc([displayMaterialName(item.material), item.design].filter(Boolean).join(" / "))}</td><td>${esc([item.usage, item.feature].filter(Boolean).join(" / "))}</td><td>${renderUpgradePrice(item, selectedProgressiveDesign())}</td></tr>`
      )
      .join("")}</tbody></table></section>`;
  const sections = [
    makeLensSection("Single Vision", products.filter((item) => item.category === "Single Vision")),
    makeLensSection(
      "Mandalay Anti-Fatigue",
      products.filter((item) => item.tier === "Anti-Fatigue" && item.family === "Acomoda II")
    ),
    makeLensSection("Bifocal", products.filter((item) => item.category === "Multifocal")),
    makeProgressiveSection(products.filter((item) => isProgressiveBaseItem(item))),
  ].filter((section) => section.rows.length);
  const coatingRows = sortBookletRows(
    state.catalog.addons.filter((item) => mainPrice(item) !== null && mainPrice(item) !== undefined)
  );
  const popup = window.open("", "client-price-guide", "width=1100,height=900");
  if (!popup) return window.alert("Please allow pop-ups so the booklet can open for printing.");
  popup.document.write(`
    <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Client Price Guide</title>
    <style>body{font-family:Georgia,serif;padding:18px;color:#221a14;background:#fff;font-size:12px;line-height:1.3}h1{margin:0 0 8px;font-size:26px}h2{margin:0 0 8px;font-size:18px}h3{margin:0 0 6px;font-size:13px}section{margin-bottom:14px;break-inside:avoid}.cover-page{page-break-after:always;break-after:page;min-height:30vh;padding:8px 0 4px}.eyebrow{text-transform:uppercase;letter-spacing:.18em;color:#2f6dcf;font:700 10px Arial,sans-serif}.lead{max-width:680px;color:#6f5b4d;line-height:1.4;margin:0}.booklet-section{padding:10px 0 4px;border-top:1px solid #e6d9cb}.booklet-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:11px}.booklet-table th,.booklet-table td{border:1px solid #d7c6b2;padding:4px 6px;text-align:left;vertical-align:top}.booklet-table th{background:#1f5fbf;color:#fff}.progressive-booklet-table{font-size:10px}.progressive-booklet-table td:nth-child(n+3){font-variant-numeric:tabular-nums;white-space:nowrap}.coating-group{margin-top:10px}.coating-group:first-child{margin-top:0}.coating-group h3{font-size:13px;color:#2f6dcf;margin-bottom:4px}@media print{body{padding:0.2in}.cover-page{min-height:auto}}</style></head><body>
    <section class="cover-page"><p class="eyebrow">Client Price Guide</p><h1>Mandalay Optical Lens Book</h1><p class="lead">A client-facing booklet organized for quick price review, with progressives shown as the selected design's final price.</p></section>
    ${sections
      .map(
        (section) => (section.type === "progressive" ? renderProgressiveBookletSection(section) : renderStandardBookletSection(section))
      )
      .join("")}
    <section class="booklet-section"><p class="eyebrow">Coatings</p><h2>Coatings and Add-Ons</h2>${[...new Set(coatingRows.map((item) => item.section || "Extras"))]
      .map((sectionName) => {
        const rows = coatingRows.filter((item) => (item.section || "Extras") === sectionName);
        return `<div class="coating-group"><h3>${esc(sectionName)}</h3><table class="booklet-table"><thead><tr><th>Add-On</th><th>Pricing</th></tr></thead><tbody>${rows
          .map((item) => `<tr><td>${esc(item.name)}</td><td>${currency(mainPrice(item))}</td></tr>`)
          .join("")}</tbody></table></div>`;
      })
      .join("")}</section>
    </body></html>`);
  popup.document.close();
  popup.focus();
  popup.print();
}

function sortSkuProducts(rows) {
  return sortProductRows(rows);
}

function skuExportSections() {
  const products = state.catalog.products || [];
  const usedIds = new Set();
  const productSection = (name, predicate) => {
    const rows = sortSkuProducts(products.filter(predicate));
    rows.forEach((item) => usedIds.add(item.id));
    return { name, type: "product", rows };
  };

  const sections = [
    productSection("Single Vision", (item) => item.category === "Single Vision"),
    productSection("Mandalay Anti-Fatigue", (item) => item.tier === "Anti-Fatigue" && item.family === "Acomoda II"),
    productSection("Bifocal", (item) => item.category === "Multifocal"),
    productSection("Progressive Base Prices", (item) => isProgressiveBaseItem(item)),
  ].filter((section) => section.rows.length);

  const otherRows = sortSkuProducts(products.filter((item) => !usedIds.has(item.id)));
  if (otherRows.length) sections.push({ name: "Other Lens SKUs", type: "product", rows: otherRows });

  const addonRows = [...(state.catalog.addons || [])].sort(
    (left, right) => String(left.section || "").localeCompare(String(right.section || "")) || String(left.name || "").localeCompare(String(right.name || ""))
  );
  if (addonRows.length) sections.push({ name: "Coatings Add-Ons", type: "addon", rows: addonRows });

  return sections;
}

function skuProductExportRow(sectionName, item) {
  const segments = skuSegments(item);
  return [
    sectionName,
    lensSku(item),
    ...segments.map((segment) => `${segment.code} = ${segment.value}`),
    displayFamilyName(item),
    item.tier || "",
    item.category || "",
    displayMaterialName(item.material),
    item.design || "",
    item.usage || "",
    item.feature || "",
    currency(mainPrice(item)),
    currency(item.mandalayWholesale),
    currency(item.mandalayRetail),
    currency(item.togReference),
    currency(item.proposedPrice),
    item.sourceSheet || "",
  ];
}

function skuAddonExportRow(sectionName, item) {
  const segments = addonSkuSegments(item);
  return [
    sectionName,
    addonSku(item),
    ...segments.map((segment) => `${segment.code} = ${segment.value}`),
    item.section || "",
    item.name || "",
    "Add-On",
    "",
    "",
    "",
    item.notes || "",
    currency(mainPrice(item)),
    currency(item.mandalayWholesale),
    currency(item.mandalayRetail),
    currency(item.togReference),
    currency(item.proposedPrice),
    "",
  ];
}

function skuExportHeaderRow() {
  return [
    "Book Section",
    "Numeric SKU",
    "S1 Item Type",
    "S2 Family/Section",
    "S3 Tier/Add-On",
    "S4 Category",
    "S5 Material",
    "S6 Design",
    "S7 Usage",
    "S8 Feature/Coating",
    "Family / Section",
    "Tier / Add-On",
    "Category",
    "Material",
    "Design",
    "Usage",
    "Feature / Notes",
    "Main Price",
    "Wholesale Conant",
    "Conant Retail",
    "Wholesale TOG",
    "TOG Proposal",
    "Source Sheet",
  ];
}

function skuCodeLegendRows() {
  const seen = new Map();
  const addSegments = (segments, appliesTo) => {
    segments.forEach((segment) => {
      const key = `${segment.position}|${segment.code}|${segment.value}|${appliesTo}`;
      seen.set(key, [segment.position, segment.label, segment.code, segment.value, appliesTo]);
    });
  };

  (state.catalog.products || []).forEach((item) => addSegments(skuSegments(item), "Lens"));
  (state.catalog.addons || []).forEach((item) => addSegments(addonSkuSegments(item), "Coating/Add-On"));

  return [...seen.values()].sort((left, right) => {
    const leftPosition = Number(left[0].replace("S", ""));
    const rightPosition = Number(right[0].replace("S", ""));
    if (leftPosition !== rightPosition) return leftPosition - rightPosition;
    return String(left[2]).localeCompare(String(right[2])) || String(left[3]).localeCompare(String(right[3]));
  });
}

function skuTemplateRows() {
  return [
    ["Mandalay Optical Lab SKU Template"],
    ["SKU format", "S1-S2-S3-S4-S5-S6-S7-S8"],
    ["Example meaning", "Each 3-digit group points to one part of the lens or coating setup."],
    [],
    ["Segment", "Meaning", "How the lab should read it"],
    ...SKU_SEGMENT_DEFINITIONS,
    [],
    ["Current Code Book"],
    ["Segment", "Segment Name", "Code", "Value", "Applies To"],
    ...skuCodeLegendRows(),
  ];
}

function excelXmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function excelWorksheetName(name) {
  return String(name || "Sheet")
    .replace(/[\[\]\:\*\?\/\\]/g, " ")
    .slice(0, 31);
}

function worksheetXml(name, rows) {
  return `<Worksheet ss:Name="${excelXmlEscape(excelWorksheetName(name))}"><Table>${rows
    .map(
      (row) =>
        `<Row>${row
          .map((cell) => `<Cell><Data ss:Type="String">${excelXmlEscape(cell)}</Data></Cell>`)
          .join("")}</Row>`
    )
    .join("")}</Table></Worksheet>`;
}

function downloadTextFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportSkuWorkbook() {
  const sections = skuExportSections();
  const allProductRows = sortSkuProducts(state.catalog.products || []).map((item) => skuProductExportRow("All Lens SKUs", item));
  const sheets = [
    { name: "SKU Template", rows: skuTemplateRows() },
    { name: "All Lens SKUs", rows: [skuExportHeaderRow(), ...allProductRows] },
    ...sections.map((section) => ({
      name: section.name,
      rows: [
        skuExportHeaderRow(),
        ...section.rows.map((item) =>
          section.type === "addon" ? skuAddonExportRow(section.name, item) : skuProductExportRow(section.name, item)
        ),
      ],
    })),
  ];
  const workbook = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${sheets
    .map((sheet) => worksheetXml(sheet.name, sheet.rows))
    .join("")}</Workbook>`;

  downloadTextFile(workbook, "mandalay-optical-numeric-sku-workbook.xls", "application/vnd.ms-excel;charset=utf-8");
}

function exportCatalog() {
  downloadTextFile(JSON.stringify(state.catalog, null, 2), "optical-lens-catalog.json", "application/json");
}

function resetCatalog() {
  const confirmed = window.confirm(
    "Reset the portal back to the original workbook data? This will remove your current local edits unless you export them first."
  );
  if (!confirmed) return;

  window.localStorage.removeItem(STORAGE_KEY);
  state.catalog = deepClone(window.DEFAULT_CATALOG || DEFAULT_CATALOG);
  state.filters = {
    search: "",
    catalogSection: "single-vision",
    singleVisionType: "single-vision-core",
    singleVisionIndex: "all",
    singleVisionTreatment: "all",
    progressiveProgram: "mandalay",
    progressiveTier: "good",
    progressiveDesign: "mandalay",
  };
  el.searchInput.value = "";
  render();
}

function openAddItemDialog(type) {
  state.addingItemType = type;
  el.adminMenu.open = false;
  el.addItemTitle.textContent = type === "addon" ? "Add coating / add-on" : "Add lens product";
  el.addItemFamily.value = type === "addon" ? "Coatings" : "Custom";
  el.addItemTier.value = type === "addon" ? "" : "Draft";
  el.addItemCategory.value = type === "addon" ? "Add-On" : "Single Vision";
  el.addItemMaterial.value = "";
  el.addItemDesign.value = "";
  el.addItemUsage.value = "";
  el.addItemFeature.value = "";
  el.addItemPrice.value = "";
  el.addItemWholesale.value = "";
  el.addItemTog.value = "";
  el.addItemDialog.showModal();
}

function closeAddItemDialog() {
  if (el.addItemDialog.open) el.addItemDialog.close();
}

function renderRemoveLensOptions() {
  const filterValue = String(el.removeItemFilter.value || "").trim().toLowerCase();
  const options = state.catalog.products
    .map((item) => ({
      id: item.id,
      label: removeLensLabel(item),
      search: removeLensLabel(item).toLowerCase(),
    }))
    .filter((item) => !filterValue || item.search.includes(filterValue))
    .sort((a, b) => a.label.localeCompare(b.label));

  el.removeItemSelect.innerHTML = options
    .map((option) => `<option value="${esc(option.id)}">${esc(option.label)}</option>`)
    .join("");

  return options;
}

function openRemoveLensDialog() {
  el.adminMenu.open = false;
  el.removeItemFilter.value = "";
  const options = renderRemoveLensOptions();

  if (!options.length) {
    window.alert("There are no lens products to remove.");
    return;
  }

  el.removeItemDialog.showModal();
}

function closeRemoveLensDialog() {
  if (el.removeItemDialog.open) el.removeItemDialog.close();
}

function removeSelectedLens(event) {
  event.preventDefault();
  const id = el.removeItemSelect.value;
  const item = byId(id);
  if (!item) {
    closeRemoveLensDialog();
    return;
  }

  const confirmed = window.confirm(
    `Remove ${displayFamilyName(item)} ${[displayMaterialName(item.material), item.design].filter(Boolean).join(" ")} from the catalog?`
  );
  if (!confirmed) return;

  state.catalog.products = state.catalog.products.filter((product) => product.id !== id);
  saveLocalCatalog();
  render();
  closeRemoveLensDialog();
}

function saveNewItem(event) {
  event.preventDefault();
  const id = `custom-${Date.now()}`;
  const proposedPrice = parseFormNumber(el.addItemPrice.value);
  const mandalayWholesale = parseFormNumber(el.addItemWholesale.value);
  const togReference = parseFormNumber(el.addItemTog.value);

  if (state.addingItemType === "addon") {
    state.catalog.addons.unshift({
      id,
      section: el.addItemFamily.value.trim() || "Coatings",
      name: el.addItemMaterial.value.trim() || "New add-on",
      notes: el.addItemUsage.value.trim(),
      proposedPrice,
      mandalayWholesale,
      togReference,
    });
  } else {
    state.catalog.products.unshift({
      id,
      family: el.addItemFamily.value.trim() || "Custom",
      tier: el.addItemTier.value.trim() || "Draft",
      category: el.addItemCategory.value.trim() || "Single Vision",
      sourceSheet: "Manual entry",
      material: el.addItemMaterial.value.trim() || "CR-39",
      design: el.addItemDesign.value.trim() || "New product",
      usage: el.addItemUsage.value.trim() || "Clear",
      feature: el.addItemFeature.value.trim(),
      mandalayWholesale,
      togReference,
      mandalayRetail: null,
      proposedPrice,
      benchmarkRetail: null,
      pivotalRetail: null,
      targetSellingPrice: null,
      grossMarginPercent: marginFromPrice(proposedPrice, mandalayWholesale),
    });
  }

  saveLocalCatalog();
  render();
  closeAddItemDialog();
}

function handleImport(event) {
  const [file] = event.target.files || [];
  if (!file) return;
  const confirmed = window.confirm(
    "Importing JSON will replace the current portal data in this browser. Continue?"
  );
  if (!confirmed) {
    event.target.value = "";
    return;
  }
  file.text().then((text) => {
    state.catalog = JSON.parse(text);
    saveLocalCatalog();
    render();
    event.target.value = "";
  });
}

function render() {
  syncDynamicColumnLabels();
  ensureAvailableFilters();
  el.controlsPanel.hidden = false;
  el.contentGrid.hidden = state.filters.catalogSection === "coating";
  el.lockAdminButton.hidden = !state.adminUnlocked;
  el.changePasswordsButton.hidden = !state.ownerUnlocked;
  el.changePasswordsButton.textContent = hasMasterPassword() ? "Change passwords" : "Set master password";
  el.toggleSkuButton.textContent = state.skuVisible ? "Hide SKUs" : "Show SKUs";
  el.toggleConantButton.textContent = state.providerMode === "conant" ? "Viewing Conant" : "View Conant";
  el.toggleTogButton.textContent = state.providerMode === "tog" ? "Viewing TOG" : "View TOG";
  el.clientViewButton.textContent = state.clientView ? "Exit Client View" : "Client View";
  el.adminMenu.hidden = state.clientView;
  el.catalogListingPanel.hidden = false;
  el.singleVisionFiltersPanel.hidden = state.filters.catalogSection !== "single-vision";
  el.progressiveFiltersPanel.hidden = state.filters.catalogSection !== "progressive";
  el.lensFiltersPanel.hidden = !["single-vision", "progressive"].includes(state.filters.catalogSection);
  el.searchWrap.hidden = state.filters.catalogSection === "none";
  el.secondaryPanelControls.hidden = state.clientView;
  renderCatalogSwitcher();
  renderSingleVisionFilters();
  renderProgressiveFilters();
  renderLensFilters();
  const rows = state.filters.catalogSection === "coating" ? getVisibleCoatings() : getFilteredProducts();
  renderResults(rows);
  renderAddons();
  renderSecondaryPanels();
}

function openPriceEditor(productId) {
  const item = byId(productId);
  if (!item) return;
  state.editingProductId = productId;
  el.priceEditorTitle.textContent = `Edit pricing for ${displayFamilyName(item)} ${[displayMaterialName(item.material), item.design].filter(Boolean).join(" ")}`.trim();
  el.priceEditorMainPrice.value = mainPrice(item) ?? "";
  el.priceEditorWholesale.value = item.mandalayWholesale ?? "";
  el.priceEditorTog.value = item.togReference ?? "";
  el.priceEditorDialog.showModal();
}

function closePriceEditor() {
  state.editingProductId = null;
  if (el.priceEditorDialog.open) el.priceEditorDialog.close();
}

function lockAdmin() {
  state.adminUnlocked = false;
  state.ownerUnlocked = false;
  el.adminMenu.open = false;
  closePasswordSettingsDialog();
  closePriceEditor();
  render();
}

function requestPassword({ eyebrow = "Secure Access", title = "Enter password", message = "Enter your password to continue." }) {
  if (pendingPasswordResolver) {
    pendingPasswordResolver(null);
    pendingPasswordResolver = null;
  }
  el.passwordDialogEyebrow.textContent = eyebrow;
  el.passwordDialogTitle.textContent = title;
  el.passwordDialogMessage.textContent = message;
  el.passwordInput.value = "";
  el.passwordError.hidden = true;
  el.passwordDialog.showModal();
  window.setTimeout(() => el.passwordInput.focus(), 0);
  return new Promise((resolve) => {
    pendingPasswordResolver = resolve;
  });
}

async function confirmPassword(expectedValue, options) {
  const expectedValues = (Array.isArray(expectedValue) ? expectedValue : [expectedValue])
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  while (true) {
    const entry = await requestPassword(options);
    if (entry === null) return false;
    if (expectedValues.includes(String(entry).trim())) return true;
    el.passwordError.hidden = false;
    el.passwordInput.value = "";
    el.passwordInput.focus();
  }
}

async function confirmPasswordRole(matchers, options) {
  const normalizedMatchers = matchers
    .map((matcher) => ({
      role: matcher.role,
      values: (Array.isArray(matcher.value) ? matcher.value : [matcher.value])
        .map((value) => String(value ?? "").trim())
        .filter(Boolean),
    }))
    .filter((matcher) => matcher.values.length);

  while (true) {
    const entry = await requestPassword(options);
    if (entry === null) return null;
    const enteredPassword = String(entry).trim();
    const matched = normalizedMatchers.find((matcher) => matcher.values.includes(enteredPassword));
    if (matched) return matched.role;
    el.passwordError.hidden = false;
    el.passwordInput.value = "";
    el.passwordInput.focus();
  }
}

function adminAccessMatchers() {
  const master = masterPassword();
  const matchers = [];
  if (master) {
    matchers.push({ role: "owner", value: master });
    matchers.push({ role: "admin", value: state.passwords.admin });
  } else {
    matchers.push({ role: "owner", value: state.passwords.admin });
  }
  return matchers;
}

async function confirmOwnerAccess() {
  const role = await confirmPasswordRole(
    [{ role: "owner", value: hasMasterPassword() ? masterPassword() : state.passwords.admin }],
    {
      eyebrow: "Owner Access",
      title: hasMasterPassword() ? "Unlock password controls" : "Set master password",
      message: hasMasterPassword()
        ? "Enter the master password to change saved passwords."
        : "Enter the current admin password once, then set a master password for owner recovery.",
    }
  );
  if (role !== "owner") return false;
  state.adminUnlocked = true;
  state.ownerUnlocked = true;
  render();
  return true;
}

function closePasswordDialog(result = null) {
  if (pendingPasswordResolver) {
    pendingPasswordResolver(result);
    pendingPasswordResolver = null;
  }
  el.passwordInput.value = "";
  el.passwordError.hidden = true;
  el.passwordDialog.close();
}

function setPasswordSettingsError(message = "") {
  el.passwordSettingsError.textContent = message;
  el.passwordSettingsError.hidden = !message;
}

function resetPasswordSettingsFields() {
  el.passwordSettingsAdmin.value = "";
  el.passwordSettingsAdminConfirm.value = "";
  el.passwordSettingsClientExit.value = "";
  el.passwordSettingsClientExitConfirm.value = "";
  el.passwordSettingsMaster.value = "";
  el.passwordSettingsMasterConfirm.value = "";
  setPasswordSettingsError("");
}

async function openPasswordSettingsDialog() {
  if (!state.ownerUnlocked) {
    const allowed = await confirmOwnerAccess();
    if (!allowed) return;
  }
  resetPasswordSettingsFields();
  el.passwordSettingsDialog.showModal();
  window.setTimeout(() => (hasMasterPassword() ? el.passwordSettingsAdmin : el.passwordSettingsMaster).focus(), 0);
}

function closePasswordSettingsDialog() {
  resetPasswordSettingsFields();
  if (el.passwordSettingsDialog.open) el.passwordSettingsDialog.close();
}

function savePasswordSettings(event) {
  event.preventDefault();

  const adminPassword = String(el.passwordSettingsAdmin.value || "").trim();
  const adminPasswordConfirm = String(el.passwordSettingsAdminConfirm.value || "").trim();
  const clientExitPassword = String(el.passwordSettingsClientExit.value || "").trim();
  const clientExitPasswordConfirm = String(el.passwordSettingsClientExitConfirm.value || "").trim();
  const master = String(el.passwordSettingsMaster.value || "").trim();
  const masterConfirm = String(el.passwordSettingsMasterConfirm.value || "").trim();
  const isChangingAdmin = Boolean(adminPassword || adminPasswordConfirm);
  const isChangingClientExit = Boolean(clientExitPassword || clientExitPasswordConfirm);
  const isChangingMaster = Boolean(master || masterConfirm);

  if (!isChangingAdmin && !isChangingClientExit && !isChangingMaster) {
    setPasswordSettingsError("Enter a new password before saving.");
    return;
  }

  if (!hasMasterPassword() && !isChangingMaster) {
    setPasswordSettingsError("Set a master password so owner access stays separate from staff admin access.");
    el.passwordSettingsMaster.focus();
    return;
  }

  if (isChangingAdmin && (!adminPassword || !adminPasswordConfirm)) {
    setPasswordSettingsError("Enter the new admin password twice, or leave both admin fields blank.");
    (adminPassword ? el.passwordSettingsAdminConfirm : el.passwordSettingsAdmin).focus();
    return;
  }

  if (isChangingClientExit && (!clientExitPassword || !clientExitPasswordConfirm)) {
    setPasswordSettingsError("Enter the new client-view exit password twice, or leave both client-view fields blank.");
    (clientExitPassword ? el.passwordSettingsClientExitConfirm : el.passwordSettingsClientExit).focus();
    return;
  }

  if (isChangingAdmin && adminPassword !== adminPasswordConfirm) {
    setPasswordSettingsError("Admin password entries do not match.");
    el.passwordSettingsAdminConfirm.focus();
    return;
  }

  if (isChangingClientExit && clientExitPassword !== clientExitPasswordConfirm) {
    setPasswordSettingsError("Client-view exit password entries do not match.");
    el.passwordSettingsClientExitConfirm.focus();
    return;
  }

  if (isChangingMaster && (!master || !masterConfirm)) {
    setPasswordSettingsError("Enter the new master password twice, or leave both master fields blank.");
    (master ? el.passwordSettingsMasterConfirm : el.passwordSettingsMaster).focus();
    return;
  }

  if (isChangingMaster && master !== masterConfirm) {
    setPasswordSettingsError("Master password entries do not match.");
    el.passwordSettingsMasterConfirm.focus();
    return;
  }

  state.passwords = {
    admin: isChangingAdmin ? adminPassword : state.passwords.admin,
    clientExit: isChangingClientExit ? clientExitPassword : state.passwords.clientExit,
    master: isChangingMaster ? master : masterPassword(),
  };
  saveLocalPasswordSettings();
  closePasswordSettingsDialog();
  el.adminMenu.open = false;
  window.alert("Local passwords updated on this computer. Master access remains owner-only.");
  render();
}

function resetPasswordSettingsToDefault() {
  const confirmed = window.confirm("Restore the staff admin and client-view exit passwords to the built-in defaults? The master password will stay in place.");
  if (!confirmed) return;

  state.passwords = {
    ...state.passwords,
    admin: DEFAULT_PASSWORDS.admin,
    clientExit: DEFAULT_PASSWORDS.clientExit,
  };
  saveLocalPasswordSettings();
  closePasswordSettingsDialog();
  el.adminMenu.open = false;
  window.alert("Staff passwords restored to the built-in defaults. Master access was not changed.");
  render();
}

function savePriceEditor(event) {
  event.preventDefault();
  const item = byId(state.editingProductId);
  if (!item) {
    closePriceEditor();
    return;
  }

  const updatedPrice = parseFormNumber(el.priceEditorMainPrice.value);
  const updatedWholesale = parseFormNumber(el.priceEditorWholesale.value);
  const updatedTog = parseFormNumber(el.priceEditorTog.value);

  item.proposedPrice = updatedPrice;
  item.mandalayWholesale = updatedWholesale;
  item.togReference = updatedTog;
  item.grossMarginPercent = marginFromPrice(updatedPrice, updatedWholesale);

  saveLocalCatalog();
  render();
  closePriceEditor();
}

function toggleColumnVisibility(key) {
  const isCoating = state.filters.catalogSection === "coating";
  const hiddenKeyList = isCoating ? state.hiddenCoatingColumns : state.hiddenProductColumns;
  const visibleColumns = isCoating ? visibleCoatingColumns() : visibleProductColumns();

  if (hiddenKeyList.includes(key)) {
    if (isCoating) {
      state.hiddenCoatingColumns = state.hiddenCoatingColumns.filter((columnKey) => columnKey !== key);
    } else {
      state.hiddenProductColumns = state.hiddenProductColumns.filter((columnKey) => columnKey !== key);
    }
  } else if (visibleColumns.length > 1) {
    hiddenKeyList.push(key);
  }

  render();
}

function attachEvents() {
  el.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim();
    render();
  });
  el.indexFilter.addEventListener("change", (event) => {
    state.filters.singleVisionIndex = event.target.value;
    render();
  });
  el.treatmentFilter.addEventListener("change", (event) => {
    state.filters.singleVisionTreatment = TREATMENT_OPTIONS.find((item) => item.label === event.target.value)?.value || "all";
    render();
  });
  document.addEventListener("click", (event) => {
    if (state.clientView) return;
    const editButton = event.target.closest("[data-edit-product]");
    if (editButton) {
      openPriceEditor(editButton.dataset.editProduct);
      return;
    }

    const profitToggle = event.target.closest("[data-profit-toggle]");
    if (profitToggle && (el.resultsHead.contains(profitToggle) || el.addonsList.contains(profitToggle))) {
      const provider = profitToggle.dataset.profitToggle;
      state.profitDisplayMode[provider] = state.profitDisplayMode[provider] === "dollars" ? "percent" : "dollars";
      render();
      return;
    }

    const headerToggle = event.target.closest("[data-column-toggle]");
    if (headerToggle && (el.resultsHead.contains(headerToggle) || el.addonsList.contains(headerToggle))) {
      const key = headerToggle.dataset.columnToggle;
      const hiddenKeyList = state.filters.catalogSection === "coating" ? state.hiddenCoatingColumns : state.hiddenProductColumns;
      const visibleColumns = state.filters.catalogSection === "coating" ? visibleCoatingColumns() : visibleProductColumns();
      if (!hiddenKeyList.includes(key) && visibleColumns.length > 1) {
        hiddenKeyList.push(key);
        render();
      }
      return;
    }

    const toggle = event.target.closest("[data-column-toggle]");
    if (toggle && (el.columnControls.contains(toggle) || el.addonsControls.contains(toggle))) {
      toggleColumnVisibility(toggle.dataset.columnToggle);
      return;
    }

    const restore = event.target.closest("[data-column-restore]");
    if (restore && (el.columnControls.contains(restore) || el.addonsControls.contains(restore))) {
      const key = restore.dataset.columnRestore;
      if (state.filters.catalogSection === "coating") {
        state.hiddenCoatingColumns = state.hiddenCoatingColumns.filter((columnKey) => columnKey !== key);
      } else {
        state.hiddenProductColumns = state.hiddenProductColumns.filter((columnKey) => columnKey !== key);
      }
      render();
      return;
    }

    const resetButton = event.target.closest("[data-reset-columns]");
    if (resetButton && (el.columnControls.contains(resetButton) || el.addonsControls.contains(resetButton))) {
      if (state.filters.catalogSection === "coating") {
        state.hiddenCoatingColumns = [];
      } else {
        state.hiddenProductColumns = [];
      }
      render();
    }
  });
  document.addEventListener("click", (event) => {
    const compactPanelToggle = event.target.closest("[data-compact-panel-toggle]");
    if (compactPanelToggle) {
      const key = compactPanelToggle.dataset.compactPanelToggle;
      state.compactPanels[key] = !state.compactPanels[key];
      render();
      return;
    }

    const hideButton = event.target.closest("[data-panel-hide]");
    if (hideButton) {
      const key = hideButton.dataset.panelHide;
      if (!state.hiddenPanels.includes(key)) {
        state.hiddenPanels.push(key);
        render();
      }
      return;
    }

    const restoreButton = event.target.closest("[data-panel-restore]");
    if (restoreButton) {
      const key = restoreButton.dataset.panelRestore;
      state.hiddenPanels = state.hiddenPanels.filter((panelKey) => panelKey !== key);
      render();
      return;
    }

    if (event.target.closest("[data-panels-reset]")) {
      state.hiddenPanels = [];
      render();
    }
  });
  el.familySwitcher.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-catalog-section]");
    if (!chip) return;
    state.filters.catalogSection = chip.dataset.catalogSection;
    state.filters.singleVisionType = "single-vision-core";
    state.filters.singleVisionIndex = "all";
    state.filters.singleVisionTreatment = "all";
    state.filters.progressiveProgram = "mandalay";
    state.filters.progressiveTier = "good";
    state.filters.progressiveDesign = "mandalay";
    state.compactPanels.singleVisionCategory = false;
    state.compactPanels.lensFilters = false;
    render();
  });
  el.singleVisionTypeSwitcher.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-single-vision-type]");
    if (!chip) return;
    state.filters.singleVisionType = chip.dataset.singleVisionType;
    state.filters.singleVisionIndex = "all";
    state.filters.singleVisionTreatment = "all";
    state.compactPanels.singleVisionCategory = false;
    render();
  });
  el.progressiveProgramSwitcher.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-progressive-design]");
    if (!chip) return;
    state.filters.progressiveDesign = chip.dataset.progressiveDesign;
    render();
  });
  el.progressiveTierSwitcher.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-progressive-design]");
    if (!chip) return;
    state.filters.progressiveDesign = chip.dataset.progressiveDesign;
    render();
  });
  el.clientViewButton.addEventListener("click", async () => {
    if (state.clientView) {
      const matches = await confirmPassword([masterPassword(), state.passwords.clientExit, DEFAULT_PASSWORDS.clientExit], {
        eyebrow: "Client View",
        title: "Exit client view",
        message: "Enter the client-view exit password or the master password to return to admin-facing mode.",
      });
      if (!matches) return;
      state.clientView = false;
    } else {
      state.clientView = true;
    }
    el.adminMenu.open = false;
    closePriceEditor();
    render();
  });
  el.adminMenuSummary.addEventListener("click", async (event) => {
    event.preventDefault();
    if (!state.adminUnlocked) {
      const role = await confirmPasswordRole(adminAccessMatchers(), {
        eyebrow: "Admin Access",
        title: "Unlock admin tools",
        message: hasMasterPassword()
          ? "Enter the admin password for staff tools, or the master password for owner controls."
          : "Enter the admin password. Then set a master password for owner recovery.",
      });
      if (!role) {
        el.adminMenu.open = false;
        return;
      }
      state.adminUnlocked = true;
      state.ownerUnlocked = role === "owner";
      render();
    }
    el.adminMenu.open = !el.adminMenu.open;
  });
  el.lockAdminButton.addEventListener("click", lockAdmin);
  el.changePasswordsButton.addEventListener("click", openPasswordSettingsDialog);
  el.toggleSkuButton.addEventListener("click", () => {
    state.skuVisible = !state.skuVisible;
    render();
  });
  el.toggleConantButton.addEventListener("click", () => {
    state.providerMode = state.providerMode === "conant" ? "default" : "conant";
    render();
  });
  el.toggleTogButton.addEventListener("click", () => {
    state.providerMode = state.providerMode === "tog" ? "default" : "tog";
    render();
  });
  el.addLensButton.addEventListener("click", () => openAddItemDialog("product"));
  el.removeLensButton.addEventListener("click", openRemoveLensDialog);
  el.addAddonButton.addEventListener("click", () => openAddItemDialog("addon"));
  el.addItemForm.addEventListener("submit", saveNewItem);
  el.addItemCancelButton.addEventListener("click", closeAddItemDialog);
  el.removeItemFilter.addEventListener("input", renderRemoveLensOptions);
  el.removeItemForm.addEventListener("submit", removeSelectedLens);
  el.removeItemCancelButton.addEventListener("click", closeRemoveLensDialog);
  el.passwordForm.addEventListener("submit", (event) => {
    event.preventDefault();
    closePasswordDialog(el.passwordInput.value);
  });
  el.passwordCancelButton.addEventListener("click", () => closePasswordDialog(null));
  el.passwordDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closePasswordDialog(null);
  });
  el.passwordSettingsForm.addEventListener("submit", savePasswordSettings);
  el.passwordSettingsCancelButton.addEventListener("click", closePasswordSettingsDialog);
  el.passwordSettingsResetButton.addEventListener("click", resetPasswordSettingsToDefault);
  el.passwordSettingsDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closePasswordSettingsDialog();
  });
  el.priceEditorForm.addEventListener("submit", savePriceEditor);
  el.priceEditorCancelButton.addEventListener("click", closePriceEditor);
  el.exportSkuButton.addEventListener("click", exportSkuWorkbook);
  el.exportDataButton.addEventListener("click", exportCatalog);
  el.printBookletButton.addEventListener("click", openPrintBooklet);
  el.resetDataButton.addEventListener("click", resetCatalog);
  el.importFileInput.addEventListener("change", handleImport);
}

loadLocalCatalog();
attachEvents();
render();
