//companyList.js

const API_BASE_URL = (['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:3000/api/v1'
  : '/api/v1') + '/companies';

const PAGE_SIZE = 9; // companies per page

const state = {
  companies: [],
  filteredCompanies: [],
  currentPage: 1,
};

const elements = {
  searchInput: document.getElementById("companySearchInput"),
  industryFilter: document.getElementById("industryFilter"),
  prefectureFilter: document.getElementById("prefectureFilter"),
  sortSelect: document.getElementById("companySort"),
  clearFiltersBtn: document.getElementById("clearCompanyFilters"),
  emptyStateClearBtn: document.getElementById("emptyStateClearFilters"),
  resultCount: document.getElementById("companyResultCount"),
  listings: document.getElementById("companyListings"),
  noResults: document.getElementById("noCompanyResults"),
  loadingState: document.getElementById("companyLoadingState"),
  announcement: document.getElementById("companyFilterAnnouncement"),
  paginationContainer: document.getElementById("companyPagination"),
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindEvents();
  await loadCompanies();
}

function bindEvents() {
  elements.searchInput?.addEventListener("input", () => { state.currentPage = 1; applyFilters(); });
  elements.industryFilter?.addEventListener("change", () => { state.currentPage = 1; applyFilters(); });
  elements.prefectureFilter?.addEventListener("change", () => { state.currentPage = 1; applyFilters(); });
  elements.sortSelect?.addEventListener("change", () => { state.currentPage = 1; applyFilters(); });
  elements.clearFiltersBtn?.addEventListener("click", clearFilters);
  elements.emptyStateClearBtn?.addEventListener("click", clearFilters);
}

async function loadCompanies() {
  showLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}?limit=200`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`Failed to fetch companies: ${response.status}`);
    const result = await response.json();
    const companies = result?.data?.companies ?? [];
    state.companies = Array.isArray(companies) ? companies : [];
    populateIndustryOptions(state.companies);
    populatePrefectureOptions(state.companies);
    applyFilters();
  } catch (error) {
    console.error("Error loading companies:", error);
    state.companies = [];
    state.filteredCompanies = [];
    renderCompanies([]);
    updateResultCount(0);
    showEmptyState(true, "Unable to load companies right now.");
  } finally {
    showLoading(false);
  }
}

function applyFilters() {
  const searchValue = elements.searchInput?.value.trim().toLowerCase() || "";
  const industryValue = elements.industryFilter?.value || "";
  const prefectureValue = elements.prefectureFilter?.value || "";
  const sortValue = elements.sortSelect?.value || "-createdAt";

  let results = [...state.companies];

  if (searchValue) {
    results = results.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const desc = (c.description || "").toLowerCase();
      const ind  = (c.industry || "").toLowerCase();
      return name.includes(searchValue) || desc.includes(searchValue) || ind.includes(searchValue);
    });
  }
  if (industryValue)   results = results.filter((c) => c.industry === industryValue);
  if (prefectureValue) results = results.filter((c) => c.location?.prefecture === prefectureValue);

  results = sortCompanies(results, sortValue);
  state.filteredCompanies = results;

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  if (state.currentPage > totalPages) state.currentPage = totalPages;

  const start = (state.currentPage - 1) * PAGE_SIZE;
  const pageSlice = results.slice(start, start + PAGE_SIZE);

  renderCompanies(pageSlice);
  updateResultCount(results.length);
  renderPagination(results.length);
  announceResults(results.length);
  showEmptyState(results.length === 0);
}

function sortCompanies(companies, sortValue) {
  const sorted = [...companies];
  switch (sortValue) {
    case "name":
      sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      break;
    case "-jobCount":
      sorted.sort((a, b) => getJobCount(b) - getJobCount(a));
      break;
    case "-createdAt":
    default:
      sorted.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      });
  }
  return sorted;
}

function renderCompanies(companies) {
  if (!elements.listings) return;
  elements.listings.innerHTML = "";
  const template = document.getElementById("companyCardTemplate");

  companies.forEach((company) => {
    const clone = template.content.cloneNode(true);
    const nameEl        = clone.querySelector(".company-card__name");
    const logoEl        = clone.querySelector(".company-card__logo");
    const metaEl        = clone.querySelector(".company-card__meta");
    const industryBadge = clone.querySelector(".company-card__industry");
    const locationBadge = clone.querySelector(".company-card__location");
    const jobsBadge     = clone.querySelector(".company-card__jobs");
    const descriptionEl = clone.querySelector(".company-card__description");
    const linkEl        = clone.querySelector(".company-card__link");
    const verifiedBadge = clone.querySelector(".company-card__verified");

    const companyName = company.name || "Unnamed Company";
    nameEl.textContent = companyName;

    // Support relative paths (/assets/...), absolute URLs, and logo/logoUrl fields
    const rawLogo = company.logo || company.logoUrl || "";
    logoEl.src = rawLogo
      ? rawLogo
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=0D6EFD&color=fff&size=96`;
    logoEl.alt = `${companyName} logo`;
    logoEl.onerror = function () {
      this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=0D6EFD&color=fff&size=96`;
      this.onerror = null;
    };

    metaEl.textContent  = `${company.industry || "Industry"} • ${company.location?.prefecture || "Japan"}`;
    industryBadge.textContent = company.industry || "General";
    locationBadge.textContent = [company.location?.city, company.location?.prefecture].filter(Boolean).join(", ");

    const count  = getJobCount(company);
    jobsBadge.textContent = `${count} ${count === 1 ? "job" : "jobs"}`;
    descriptionEl.textContent = company.description || "No description available.";
    linkEl.href = `./company-details.html?slug=${encodeURIComponent(company.slug || company._id)}`;

    if (company.isVerified) verifiedBadge.classList.remove("d-none");

    elements.listings.appendChild(clone);
  });
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function renderPagination(totalItems) {
  const container = elements.paginationContainer;
  if (!container) return;

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  container.innerHTML = "";

  if (totalPages <= 1) return;

  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", "Company results pagination");

  const ul = document.createElement("ul");
  ul.className = "pagination pagination-sm justify-content-center flex-wrap gap-1 mb-0";

  // Previous
  ul.appendChild(makePaginationItem("«", state.currentPage - 1, state.currentPage === 1, false, "Previous page"));

  // Page numbers with ellipsis
  const pages = buildPageRange(state.currentPage, totalPages);
  for (const p of pages) {
    if (p === "…") {
      const li = document.createElement("li");
      li.className = "page-item disabled";
      li.innerHTML = `<span class="page-link">…</span>`;
      ul.appendChild(li);
    } else {
      ul.appendChild(makePaginationItem(p, p, false, p === state.currentPage, `Page ${p}`));
    }
  }

  // Next
  ul.appendChild(makePaginationItem("»", state.currentPage + 1, state.currentPage === totalPages, false, "Next page"));

  // Info text
  const info = document.createElement("p");
  const start = (state.currentPage - 1) * PAGE_SIZE + 1;
  const end   = Math.min(state.currentPage * PAGE_SIZE, totalItems);
  info.className = "text-muted small text-center mt-2 mb-0";
  info.textContent = `Showing ${start}–${end} of ${totalItems} companies`;

  nav.appendChild(ul);
  container.appendChild(nav);
  container.appendChild(info);
}

function makePaginationItem(label, page, disabled, active, ariaLabel) {
  const li = document.createElement("li");
  li.className = `page-item${disabled ? " disabled" : ""}${active ? " active" : ""}`;
  if (active) li.setAttribute("aria-current", "page");

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "page-link";
  btn.textContent = label;
  btn.setAttribute("aria-label", ariaLabel);

  if (!disabled && !active) {
    btn.addEventListener("click", () => {
      state.currentPage = page;
      applyFilters();
      // Smooth scroll to results heading
      document.getElementById("company-results-heading")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  li.appendChild(btn);
  return li;
}

function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("…");
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    pages.push("…");
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push("…");
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push("…");
    pages.push(total);
  }
  return pages;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function populateIndustryOptions(companies) {
  if (!elements.industryFilter) return;
  const currentValue = elements.industryFilter.value;
  const industries = [...new Set(companies.map((c) => c.industry).filter(Boolean))].sort();
  elements.industryFilter.innerHTML = '<option value="">All industries</option>';
  industries.forEach((ind) => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = ind;
    elements.industryFilter.appendChild(opt);
  });
  elements.industryFilter.value = currentValue;
}

function populatePrefectureOptions(companies) {
  if (!elements.prefectureFilter) return;
  const currentValue = elements.prefectureFilter.value;
  const prefectures = [...new Set(companies.map((c) => c.location?.prefecture).filter(Boolean))].sort();
  elements.prefectureFilter.innerHTML = '<option value="">All prefectures</option>';
  prefectures.forEach((pref) => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = pref;
    elements.prefectureFilter.appendChild(opt);
  });
  elements.prefectureFilter.value = currentValue;
}

function clearFilters() {
  if (elements.searchInput)    elements.searchInput.value = "";
  if (elements.industryFilter)  elements.industryFilter.value = "";
  if (elements.prefectureFilter) elements.prefectureFilter.value = "";
  if (elements.sortSelect)      elements.sortSelect.value = "-createdAt";
  state.currentPage = 1;
  applyFilters();
}

function updateResultCount(count) {
  if (!elements.resultCount) return;
  elements.resultCount.textContent = `${count} ${count === 1 ? "company" : "companies"} found`;
}

function announceResults(count) {
  if (!elements.announcement) return;
  elements.announcement.textContent = `${count} ${count === 1 ? "company" : "companies"} found after filtering`;
}

function showLoading(isLoading) {
  elements.loadingState?.classList.toggle("d-none", !isLoading);
}

function showEmptyState(show, message = "No companies found.") {
  if (!elements.noResults) return;
  const heading = elements.noResults.querySelector("h3");
  const paragraph = elements.noResults.querySelector("p");
  if (heading) heading.textContent = "No companies found";
  if (paragraph) paragraph.textContent = message;
  elements.noResults.classList.toggle("d-none", !show);
}

function getJobCount(company) {
  if (typeof company.jobCount === "number") return company.jobCount;
  if (Array.isArray(company.jobs)) return company.jobs.length;
  return 0;
}
