//jobFilter.js

const API_BASE_URL = (typeof _API !== 'undefined' && _API)
  ? _API
  : (['localhost','127.0.0.1'].includes(window.location.hostname) ? 'http://localhost:3000/api/v1' : '/api/v1');

const jobListings       = document.getElementById("jobListings");
const noResults         = document.getElementById("noResults");
const resultCount       = document.getElementById("resultCount");
const resultCount2      = document.getElementById("resultCount-2");
const searchInput       = document.getElementById("searchInput");
const clearFiltersBtn   = document.getElementById("clearFilters");
const filterAnnouncement = document.getElementById("filterAnnouncement");
const paginationContainer = document.getElementById("jobPagination");

const PAGE_SIZE = 10; // jobs per page

let allJobs = [];
let currentPage = 1;

let filters = {
  search: "",
  support: "all",
  japaneseLevel: "any",
  location: "all",
  industry: "all",
  minSalary: 0,
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function escapeHTML(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function formatLocation(job) {
  const city = job.location?.city || "";
  const prefecture = job.location?.prefecture || "";
  return [city, prefecture].filter(Boolean).join(", ") || "Not specified";
}

function formatSalary(job) {
  const min = job.compensation?.salaryMin || 0;
  const max = job.compensation?.salaryMax || 0;
  const currency = job.compensation?.currency || "JPY";
  if (min && max) return `${currency} ${Number(min).toLocaleString()} – ${Number(max).toLocaleString()}`;
  if (min)        return `${currency} ${Number(min).toLocaleString()}`;
  return "Not specified";
}

function getSupportValue(job) {
  if (job.support === true   || job.visaSupport === true)  return "yes";
  if (job.support === false  || job.visaSupport === false) return "no";
  return "all";
}

// ─── Render ───────────────────────────────────────────────────────────────────

function renderNoResults(show) {
  noResults?.classList.toggle("d-none", !show);
}

function updateCounts(count) {
  if (resultCount)  resultCount.textContent  = String(count);
  if (resultCount2) resultCount2.textContent = String(count);
  if (filterAnnouncement) {
    filterAnnouncement.textContent = count === 0 ? "No jobs found." : `${count} jobs found.`;
  }
}

function renderJobs(jobs) {
  if (!jobListings) return;

  if (!jobs.length) {
    jobListings.innerHTML = "";
    return;
  }

  jobListings.innerHTML = jobs
    .map((job) => {
      const title         = escapeHTML(job.title || "Untitled Job");
      const company       = escapeHTML(job.company?.name || "Unknown Company");
      const location      = escapeHTML(formatLocation(job));
      const salary        = escapeHTML(formatSalary(job));
      const japaneseLevel = escapeHTML(job.japaneseLevel || "Not specified");
      const industry      = escapeHTML(job.industry || job.category || "General");
      const summary       = escapeHTML(job.summary || "No summary available.");
      const jobId         = encodeURIComponent(job._id);

      return `
        <div class="col-md-6 col-lg-6" role="listitem">
          <div class="card h-100 shadow-sm border-0 job-card">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <h2 class="h5 fw-bold mb-1">${title}</h2>
              </div>
              <p class="text-muted mb-2">${company} · ${location}</p>
              <p class="small mb-1"><strong>Industry:</strong> ${industry}</p>
              <p class="small mb-1"><strong>Salary:</strong> ${salary}</p>
              <p class="small mb-1"><strong>Japanese Level:</strong> ${japaneseLevel}</p>
              <p class="text-muted small mt-2 mb-0">${summary}</p>
            </div>
            <div class="card-footer bg-transparent border-0">
              <a href="jobDetails.html?id=${jobId}" class="btn btn-primary w-100">View Details</a>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function renderPagination(totalItems) {
  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  if (totalPages <= 1) return;

  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", "Job results pagination");

  const ul = document.createElement("ul");
  ul.className = "pagination pagination-sm justify-content-center flex-wrap gap-1 mb-0";

  ul.appendChild(makePaginationItem("«", currentPage - 1, currentPage === 1, false, "Previous page"));

  for (const p of buildPageRange(currentPage, totalPages)) {
    if (p === "…") {
      const li = document.createElement("li");
      li.className = "page-item disabled";
      li.innerHTML = `<span class="page-link">…</span>`;
      ul.appendChild(li);
    } else {
      ul.appendChild(makePaginationItem(p, p, false, p === currentPage, `Page ${p}`));
    }
  }

  ul.appendChild(makePaginationItem("»", currentPage + 1, currentPage === totalPages, false, "Next page"));

  const info = document.createElement("p");
  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end   = Math.min(currentPage * PAGE_SIZE, totalItems);
  info.className = "text-muted small text-center mt-2 mb-0";
  info.textContent = `Showing ${start}–${end} of ${totalItems} jobs`;

  nav.appendChild(ul);
  paginationContainer.appendChild(nav);
  paginationContainer.appendChild(info);
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
      currentPage = page;
      applyFilters();
      document.getElementById("resultCount-2")
        ?.closest("section, div")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
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

// ─── Filter logic ─────────────────────────────────────────────────────────────

function applyFilters() {
  const filtered = allJobs.filter((job) => {
    const searchBlob = [
      job.title, job.company?.name, job.location?.city,
      job.location?.prefecture, job.japaneseLevel,
      job.industry, job.category, job.summary,
    ].join(" ").toLowerCase();

    if (filters.search && !searchBlob.includes(filters.search)) return false;

    if (filters.japaneseLevel !== "any" &&
        normalize(job.japaneseLevel) !== normalize(filters.japaneseLevel)) return false;

    if (filters.location !== "all") {
      const city       = normalize(job.location?.city);
      const prefecture = normalize(job.location?.prefecture);
      const target     = normalize(filters.location);
      if (!city.includes(target) && !prefecture.includes(target)) return false;
    }

    if (filters.industry !== "all") {
      const industry = normalize(job.industry);
      const category = normalize(job.category);
      const target   = normalize(filters.industry);
      if (!industry.includes(target) && !category.includes(target)) return false;
    }

    if (filters.minSalary > 0) {
      if (Number(job.compensation?.salaryMin || 0) < filters.minSalary) return false;
    }

    if (filters.support !== "all" && getSupportValue(job) !== filters.support) return false;

    return true;
  });

  // Reset to page 1 when filters produce fewer pages than current page
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = 1;

  const start    = (currentPage - 1) * PAGE_SIZE;
  const pageSlice = filtered.slice(start, start + PAGE_SIZE);

  const hasResults = filtered.length > 0;
  renderNoResults(!hasResults);
  updateCounts(filtered.length);
  renderJobs(pageSlice);
  renderPagination(filtered.length);
}

// ─── Event setup ─────────────────────────────────────────────────────────────

function setupSearch() {
  searchInput?.addEventListener("input", (event) => {
    filters.search = event.target.value.trim().toLowerCase();
    currentPage = 1;
    applyFilters();
  });
}

function setupFilterButtons() {
  document.querySelectorAll("[data-filter-group]").forEach((group) => {
    group.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-value]");
      if (!button) return;

      const groupName = group.dataset.filterGroup;
      const value     = button.dataset.value;

      group.querySelectorAll("button").forEach((btn) => {
        btn.classList.remove("active", "btn-outline-primary");
        btn.classList.add("btn-outline-secondary");
        btn.setAttribute("aria-pressed", "false");
      });

      button.classList.add("active", "btn-outline-primary");
      button.classList.remove("btn-outline-secondary");
      button.setAttribute("aria-pressed", "true");

      if (groupName === "minSalary") {
        filters.minSalary = Number(value);
      } else {
        filters[groupName] = value;
      }

      currentPage = 1;
      applyFilters();
    });
  });
}

function setupClearFilters() {
  clearFiltersBtn?.addEventListener("click", () => {
    filters = { search: "", support: "all", japaneseLevel: "any", location: "all", industry: "all", minSalary: 0 };
    if (searchInput) searchInput.value = "";

    document.querySelectorAll("[data-filter-group]").forEach((group) => {
      group.querySelectorAll("button").forEach((btn, index) => {
        btn.classList.remove("active", "btn-outline-primary");
        btn.classList.add("btn-outline-secondary");
        btn.setAttribute("aria-pressed", "false");
        if (index === 0) {
          btn.classList.add("active", "btn-outline-primary");
          btn.classList.remove("btn-outline-secondary");
          btn.setAttribute("aria-pressed", "true");
        }
      });
    });

    currentPage = 1;
    applyFilters();
  });
}

// ─── Load ─────────────────────────────────────────────────────────────────────

async function loadJobs() {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs?limit=500`);
    const result   = await response.json();

    if (!response.ok) throw new Error(result.message || "Failed to load jobs.");

    allJobs = result.data?.jobs || [];
    applyFilters();
  } catch (error) {
    console.error("Error loading job filter jobs:", error);
    if (jobListings) {
      jobListings.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">${escapeHTML(error.message || "Something went wrong while loading jobs.")}</div>
        </div>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupSearch();
  setupFilterButtons();
  setupClearFilters();
  loadJobs();
});
