//companyList.js

const API_BASE_URL = (['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:3000/api/v1'
  : '/api/v1') + '/companies';

const state = {
  companies: [],
  filteredCompanies: [],
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
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindEvents();
  await loadCompanies();
}

function bindEvents() {
  elements.searchInput?.addEventListener("input", applyFilters);
  elements.industryFilter?.addEventListener("change", applyFilters);
  elements.prefectureFilter?.addEventListener("change", applyFilters);
  elements.sortSelect?.addEventListener("change", applyFilters);
  elements.clearFiltersBtn?.addEventListener("click", clearFilters);
  elements.emptyStateClearBtn?.addEventListener("click", clearFilters);
}

async function loadCompanies() {
  showLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}?limit=100`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch companies: ${response.status}`);
    }

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
    results = results.filter((company) => {
      const name = (company.name || "").toLowerCase();
      const description = (company.description || "").toLowerCase();
      const industry = (company.industry || "").toLowerCase();

      return (
        name.includes(searchValue) ||
        description.includes(searchValue) ||
        industry.includes(searchValue)
      );
    });
  }

  if (industryValue) {
    results = results.filter((company) => company.industry === industryValue);
  }

  if (prefectureValue) {
    results = results.filter(
      (company) => company.location?.prefecture === prefectureValue,
    );
  }

  results = sortCompanies(results, sortValue);

  state.filteredCompanies = results;
  renderCompanies(results);
  updateResultCount(results.length);
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
      break;
  }

  return sorted;
}
function renderCompanies(companies) {
  if (!elements.listings) return;

  // 1. Clear existing results
  elements.listings.innerHTML = "";

  // 2. Reference the template defined in your HTML
  const template = document.getElementById("companyCardTemplate");

  companies.forEach((company) => {
    // Clone the template content
    const clone = template.content.cloneNode(true);
    
    // 3. Select elements inside the clone to fill with data
    const card = clone.querySelector(".card");
    const nameEl = clone.querySelector(".company-card__name");
    const logoEl = clone.querySelector(".company-card__logo");
    const metaEl = clone.querySelector(".company-card__meta");
    const industryBadge = clone.querySelector(".company-card__industry");
    const locationBadge = clone.querySelector(".company-card__location");
    const jobsBadge = clone.querySelector(".company-card__jobs");
    const descriptionEl = clone.querySelector(".company-card__description");
    const linkEl = clone.querySelector(".company-card__link");
    const verifiedBadge = clone.querySelector(".company-card__verified");

    // 4. Set Data
    const companyName = company.name || "Unnamed Company";
    nameEl.textContent = companyName;
    
    logoEl.src = company.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=0D6EFD&color=fff&size=96`;
    logoEl.alt = `${companyName} logo`;

    metaEl.textContent = `${company.industry || "Industry"} • ${company.location?.prefecture || "Japan"}`;
    
    industryBadge.textContent = company.industry || "General";
    locationBadge.textContent = `${company.location?.city || ""}, ${company.location?.prefecture || ""}`;
    
    const count = getJobCount(company);
    jobsBadge.textContent = `${count} ${count === 1 ? "job" : "jobs"}`;
    
    descriptionEl.textContent = company.description || "No description available.";
    linkEl.href = `./company-details.html?slug=${encodeURIComponent(company.slug || company._id)}`;

    if (company.isVerified) {
      verifiedBadge.classList.remove("d-none");
    }

    // 5. Append the populated clone to the listings grid
    elements.listings.appendChild(clone);
  });
}

function populateIndustryOptions(companies) {
  if (!elements.industryFilter) return;

  const currentValue = elements.industryFilter.value;

  const industries = [
    ...new Set(companies.map((company) => company.industry).filter(Boolean)),
  ].sort();

  elements.industryFilter.innerHTML =
    '<option value="">All industries</option>';

  industries.forEach((industry) => {
    const option = document.createElement("option");
    option.value = industry;
    option.textContent = industry;
    elements.industryFilter.appendChild(option);
  });

  elements.industryFilter.value = currentValue;
}

function populatePrefectureOptions(companies) {
  if (!elements.prefectureFilter) return;

  const currentValue = elements.prefectureFilter.value;

  const prefectures = [
    ...new Set(
      companies.map((company) => company.location?.prefecture).filter(Boolean),
    ),
  ].sort();

  elements.prefectureFilter.innerHTML =
    '<option value="">All prefectures</option>';

  prefectures.forEach((prefecture) => {
    const option = document.createElement("option");
    option.value = prefecture;
    option.textContent = prefecture;
    elements.prefectureFilter.appendChild(option);
  });

  elements.prefectureFilter.value = currentValue;
}

function clearFilters() {
  if (elements.searchInput) elements.searchInput.value = "";
  if (elements.industryFilter) elements.industryFilter.value = "";
  if (elements.prefectureFilter) elements.prefectureFilter.value = "";
  if (elements.sortSelect) elements.sortSelect.value = "-createdAt";

  applyFilters();
}

function updateResultCount(count) {
  if (!elements.resultCount) return;

  elements.resultCount.textContent = `${count} ${
    count === 1 ? "company" : "companies"
  } found`;
}

function announceResults(count) {
  if (!elements.announcement) return;

  elements.announcement.textContent = `${count} ${
    count === 1 ? "company" : "companies"
  } found after filtering`;
}

function showLoading(isLoading) {
  if (!elements.loadingState) return;

  elements.loadingState.classList.toggle("d-none", !isLoading);
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


