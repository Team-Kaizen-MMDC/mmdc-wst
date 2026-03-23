// assets/js/features/companyDetails.js

const API_BASE_URL = "http://localhost:3000/api/v1/companies";

document.addEventListener("DOMContentLoaded", initCompanyDetails);

async function initCompanyDetails() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    console.error("No slug or ID found in URL");
    return;
  }

  try {
    // 1. Fetch data
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(slug)}`);
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    // 2. Flexible Data Extraction
    // Handles result, result.data, or result.data.company based on your API setup
    const company = result?.data?.company || result?.data || result;

    if (!company || (!company._id && !company.name)) {
      throw new Error("Company data structure is invalid or empty");
    }

    // 3. Populate and Render
    populateCompanyDetails(company);
    
    // Ensure these functions are called!
    if (typeof renderCompanyJobs === "function") {
      renderCompanyJobs(company.jobs || []);
    }
    
    if (typeof buildCompanyTags === "function" && typeof renderCompanyTags === "function") {
      const tags = buildCompanyTags(company);
      renderCompanyTags(tags);
    }

  } catch (error) {
    console.error("Failed to load company details:", error);
    showErrorState();
  }
}

function populateCompanyDetails(company) {
  // Extracting data safely
  const companyName = company.name || "Company Name";
  const city = company.location?.city || "";
  const prefecture = company.location?.prefecture || "";
  const fullLocation = [city, prefecture].filter(Boolean).join(", ");
  const jobsCount = Array.isArray(company.jobs) ? company.jobs.length : 0;

  // Header Info
  setText("det-name", companyName);
  setText("det-meta", `${company.industry || "Industry"} • ${prefecture || "Japan"}`);
  setText("det-short-description", company.description || "No summary available.");
  
  // Use innerHTML for description in case there are line breaks
  const descEl = document.getElementById("det-description");
  if (descEl) descEl.innerHTML = `<p class="mb-0">${escapeHtml(company.description || "No description available.")}</p>`;

  // Stats & Sidebar
  setText("det-location", fullLocation || "Not specified");
  setText("det-location-stat", prefecture || "—");
  setText("det-industry", company.industry || "Not specified");
  setText("det-industry-stat", company.industry || "—");
  setText("det-founded", company.founded || "Not specified");
  setText("det-founded-stat", company.founded || "—");
  setText("det-size", company.size || "Not specified");
  setText("det-open-jobs", jobsCount);
  setText("det-job-count-text", jobsCount);

  // Logo & Website
  const logoEl = document.getElementById("det-logo");
  if (logoEl) {
    logoEl.src = company.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=f8f9fa&color=212529&size=128`;
  }

  const websiteEl = document.getElementById("det-website");
  if (websiteEl) {
    websiteEl.href = company.website || "#";
    if (!company.website) websiteEl.classList.add("disabled");
  }

  // Badges
  const verifiedBadge = document.getElementById("det-verified");
  if (verifiedBadge && company.isVerified) {
    verifiedBadge.classList.remove("d-none");
  }
}

// --- HELPER FUNCTIONS ---

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function showErrorState() {
  const container = document.getElementById("companyDetailContent");
  if (container) {
    container.innerHTML = `<div class="alert alert-danger rounded-4">Unable to load company details. Please try again later.</div>`;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function renderCompanyJobs(jobs = []) {
  const jobsContainer = document.getElementById("companyActiveJobs");
  if (!jobsContainer) return;

  if (!Array.isArray(jobs) || jobs.length === 0) {
    jobsContainer.innerHTML = `
      <div class="col-12">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4 text-center text-muted">No active openings.</div>
        </div>
      </div>`;
    return;
  }

  // Check if we have full job objects or just IDs
  const jobsAreOnlyIds = jobs.every(job => typeof job === "string" || (job && job.$oid && Object.keys(job).length === 1));

  if (jobsAreOnlyIds) {
    jobsContainer.innerHTML = `
      <div class="col-12">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4 text-center text-muted">
            Job records exist, but details are not populated from the server.
          </div>
        </div>
      </div>`;
    return;
  }

  jobsContainer.innerHTML = jobs.map(job => {
    // FIX: Safely extract ID string
    const jobId = job._id?.$oid || job._id || "";
    const title = escapeHtml(job.title || "Untitled Job");
    const status = escapeHtml(job.status || "Active");
    const location = escapeHtml(job.location?.prefecture || "Japan");
    const salary = escapeHtml(job.salary || "Negotiable");

    return `
      <div class="col-md-6">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-body p-4 d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h3 class="h6 fw-bold mb-0">${title}</h3>
              <span class="badge text-bg-light border">${status}</span>
            </div>
            <p class="text-muted small mb-3">${location}</p>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <span class="fw-semibold text-danger">${salary}</span>
              <a href="../jobs/jobDetail.html?id=${jobId}" class="btn btn-sm btn-outline-danger rounded-pill px-3">
                View Job
              </a>
            </div>
          </div>
        </div>
      </div>`;
  }).join("");
}