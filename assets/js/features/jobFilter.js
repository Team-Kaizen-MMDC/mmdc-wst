//jobFilter.js

const API_BASE_URL = "http://localhost:3000/api/v1";

const jobListings = document.getElementById("jobListings");
const noResults = document.getElementById("noResults");
const resultCount = document.getElementById("resultCount");
const resultCount2 = document.getElementById("resultCount-2");
const searchInput = document.getElementById("searchInput");
const clearFiltersBtn = document.getElementById("clearFilters");
const filterAnnouncement = document.getElementById("filterAnnouncement");

let allJobs = [];

let filters = {
  search: "",
  support: "all",
  japaneseLevel: "any",
  location: "all",
  industry: "all",
  minSalary: 0,
};

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

  if (min && max) {
    return `${currency} ${Number(min).toLocaleString()} - ${Number(max).toLocaleString()}`;
  }

  if (min) {
    return `${currency} ${Number(min).toLocaleString()}`;
  }

  return "Not specified";
}

function getSupportValue(job) {
  if (job.support === true) return "yes";
  if (job.support === false) return "no";
  if (job.visaSupport === true) return "yes";
  if (job.visaSupport === false) return "no";
  return "all";
}

function renderNoResults(show) {
  if (!noResults) return;
  noResults.classList.toggle("d-none", !show);
}

function updateCounts(count) {
  if (resultCount) resultCount.textContent = String(count);
  if (resultCount2) resultCount2.textContent = String(count);
  if (filterAnnouncement) {
    filterAnnouncement.textContent =
      count === 0 ? "No jobs found." : `${count} jobs found.`;
  }
}

function renderJobs(jobs) {
  if (!jobListings) return;

  if (!jobs.length) {
    jobListings.innerHTML = "";
    renderNoResults(true);
    updateCounts(0);
    return;
  }

  renderNoResults(false);
  updateCounts(jobs.length);

  jobListings.innerHTML = jobs
    .map((job) => {
      const title = escapeHTML(job.title || "Untitled Job");
      const company = escapeHTML(job.company?.name || "Unknown Company");
      const location = escapeHTML(formatLocation(job));
      const salary = escapeHTML(formatSalary(job));
      const japaneseLevel = escapeHTML(job.japaneseLevel || "Not specified");
      const industry = escapeHTML(job.industry || job.category || "General");
      const summary = escapeHTML(job.summary || "No summary available.");
      const jobId = encodeURIComponent(job._id);

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
              <a href="jobDetails.html?id=${jobId}" class="btn btn-primary w-100">
                View Details
              </a>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function applyFilters() {
  const filtered = allJobs.filter((job) => {
    const searchBlob = [
      job.title,
      job.company?.name,
      job.location?.city,
      job.location?.prefecture,
      job.japaneseLevel,
      job.industry,
      job.category,
      job.summary,
    ]
      .join(" ")
      .toLowerCase();

    if (filters.search && !searchBlob.includes(filters.search)) {
      return false;
    }

    if (
      filters.japaneseLevel !== "any" &&
      normalize(job.japaneseLevel) !== normalize(filters.japaneseLevel)
    ) {
      return false;
    }

    if (filters.location !== "all") {
      const city = normalize(job.location?.city);
      const prefecture = normalize(job.location?.prefecture);
      const target = normalize(filters.location);

      if (!city.includes(target) && !prefecture.includes(target)) {
        return false;
      }
    }

    if (filters.industry !== "all") {
      const industry = normalize(job.industry);
      const category = normalize(job.category);
      const target = normalize(filters.industry);

      if (!industry.includes(target) && !category.includes(target)) {
        return false;
      }
    }

    if (filters.minSalary > 0) {
      const min = Number(job.compensation?.salaryMin || 0);
      if (min < filters.minSalary) {
        return false;
      }
    }

    if (filters.support !== "all") {
      const supportValue = getSupportValue(job);
      if (supportValue !== filters.support) {
        return false;
      }
    }

    return true;
  });

  renderJobs(filtered);
}

function setupSearch() {
  if (!searchInput) return;

  searchInput.addEventListener("input", (event) => {
    filters.search = event.target.value.trim().toLowerCase();
    applyFilters();
  });
}

function setupFilterButtons() {
  document.querySelectorAll("[data-filter-group]").forEach((group) => {
    group.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-value]");
      if (!button) return;

      const groupName = group.dataset.filterGroup;
      const value = button.dataset.value;

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

      applyFilters();
    });
  });
}

function setupClearFilters() {
  if (!clearFiltersBtn) return;

  clearFiltersBtn.addEventListener("click", () => {
    filters = {
      search: "",
      support: "all",
      japaneseLevel: "any",
      location: "all",
      industry: "all",
      minSalary: 0,
    };

    if (searchInput) searchInput.value = "";

    document.querySelectorAll("[data-filter-group]").forEach((group) => {
      const buttons = group.querySelectorAll("button");

      buttons.forEach((btn, index) => {
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

    applyFilters();
  });
}

async function loadJobs() {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs?limit=100`);
    const result = await response.json();

    console.log("Job filter API response:", result);

    if (!response.ok) {
      throw new Error(result.message || "Failed to load jobs.");
    }

    allJobs = result.data?.jobs || [];
    applyFilters();
  } catch (error) {
    console.error("Error loading job filter jobs:", error);
    if (jobListings) {
      jobListings.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">
            ${escapeHTML(error.message || "Something went wrong while loading jobs.")}
          </div>
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