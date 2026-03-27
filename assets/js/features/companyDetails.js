// assets/js/features/companyDetails.js

let currentCompany = null;
let isEditMode = false;

const API_BASE_URL = (['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:3000/api/v1'
  : '/api/v1') + '/companies';

document.addEventListener("DOMContentLoaded", async () => {
  await initCompanyDetails();
  await showAdminEditButtonIfAllowed();

  document.getElementById("adminEditBtn")?.addEventListener("click", enableEditMode);
  document.getElementById("cancelEditBtn")?.addEventListener("click", cancelEditMode);
  document.getElementById("saveCompanyBtn")?.addEventListener("click", saveCompanyChanges);
});

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
    console.log("company details response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
     console.log("company details API result:", result);
    
    // 2. Flexible Data Extraction
    // Handles result, result.data, or result.data.company based on your API setup
    const company = result?.data?.company || result?.data || result;
    currentCompany = company;
    console.log("parsed company object:", company);


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
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=f8f9fa&color=212529&size=128`;
    logoEl.src = company.logo || company.logoUrl || fallback;
    logoEl.alt = `${companyName} logo`;
    logoEl.onerror = function () { this.src = fallback; this.onerror = null; };
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
  const jobsSection = document.getElementById("companyActiveJobsSection");
  if (!jobsContainer) return;

  if (!Array.isArray(jobs) || jobs.length === 0) {
    jobsContainer.innerHTML = `
      <div class="col-12">
        <div class="border rounded-4 bg-light-subtle p-4 text-center text-muted">
          No active openings at the moment.
        </div>
      </div>
    `;
    return;
  }

  const jobsAreOnlyIds = jobs.every(
    (job) => typeof job === "string" || (job && job.$oid && Object.keys(job).length === 1)
  );

  if (jobsAreOnlyIds) {
    jobsContainer.innerHTML = `
      <div class="col-12">
        <div class="border rounded-4 bg-light-subtle p-4 text-center text-muted">
          Job records exist, but job details are not populated from the server yet.
        </div>
      </div>
    `;
    return;
  }

  jobsContainer.innerHTML = jobs
    .map((job) => {
      const jobId = job._id?.$oid || job._id || "";
      const title = escapeHtml(job.title || "Untitled Job");
      const status = escapeHtml(job.status || "Active");
      const location = escapeHtml(job.location?.prefecture || "Japan");
      const salary =
        escapeHtml(
          job.salary ||
          (job.compensation?.salaryMin && job.compensation?.salaryMax
            ? `¥${job.compensation.salaryMin} - ¥${job.compensation.salaryMax}`
            : "Negotiable")
        );

      return `
        <div class="col-12 col-md-6">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                <h3 class="h6 fw-bold mb-0">${title}</h3>
                <span class="badge text-bg-light border">${status}</span>
              </div>

              <p class="text-muted small mb-3">${location}</p>

              <div class="mt-auto d-flex justify-content-between align-items-center gap-2 flex-wrap">
                <span class="fw-semibold text-danger">${salary}</span>
                <a href="../jobs/jobDetail.html?id=${jobId}" class="btn btn-sm btn-outline-danger rounded-pill px-3">
                  View Job
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

async function showAdminEditButtonIfAllowed() {
  try {
    const token = localStorage.getItem("token") || getCookie("token");

    if (!token) {
      console.log("No token found in localStorage or cookie.");
      return;
    }

    const response = await fetch("http://localhost:3000/api/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("auth/me status:", response.status);

    if (!response.ok) {
      console.warn("Could not verify current user.");
      return;
    }

    const result = await response.json();
    console.log("auth/me result:", result);

    const user = result?.data?.user || result?.data || result?.user || null;
    console.log("current user:", user);

    if (user?.role === "admin") {
      document.getElementById("adminEditActions")?.classList.remove("d-none");
    }
  } catch (error) {
    console.error("Failed to check user role:", error);
  }
}

function getCookie(name) {
  const match = document.cookie.match(
    new RegExp("(^|;\\s*)" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : null;
}


function enableEditMode() {
  if (!currentCompany || isEditMode) return;

  isEditMode = true;

  const nameEl = document.getElementById("det-name");
  const metaEl = document.getElementById("det-meta");
  const shortDescEl = document.getElementById("det-short-description");
  const descEl = document.getElementById("det-description");
  const industryEl = document.getElementById("det-industry");
  const locationEl = document.getElementById("det-location");

  const prefecture = currentCompany.location?.prefecture || "";
  const city = currentCompany.location?.city || "";

  const industryOptions = [
    "Manufacturing",
    "Nursing Care",
    "Construction",
    "Agriculture",
    "Food Service",
    "Hospitality",
    "Food Processing",
    "Industrial Machinery",
    "Electric & Electronics",
    "Building Cleaning",
    "Shipbuilding",
    "Auto Repair",
    "Aviation",
    "Accommodation",
    "Logistics",
  ];

  if (nameEl) {
    nameEl.innerHTML = `
      <input
        id="edit-name"
        type="text"
        class="form-control form-control-lg"
        value="${escapeHtml(currentCompany.name || "")}"
      >
    `;
  }

  if (metaEl) {
    metaEl.innerHTML = `
      <div class="row g-2">
        <div class="col-md-6">
          <select id="edit-industry" class="form-select">
            ${industryOptions
              .map(
                (option) => `
                  <option value="${escapeHtml(option)}" ${
                    currentCompany.industry === option ? "selected" : ""
                  }>
                    ${escapeHtml(option)}
                  </option>
                `
              )
              .join("")}
          </select>
        </div>

        <div class="col-md-3">
          <input
            id="edit-prefecture"
            type="text"
            class="form-control"
            value="${escapeHtml(prefecture)}"
            placeholder="Prefecture"
          >
        </div>

        <div class="col-md-3">
          <input
            id="edit-city"
            type="text"
            class="form-control"
            value="${escapeHtml(city)}"
            placeholder="City"
          >
        </div>
      </div>
    `;
  }

  if (shortDescEl) {
    shortDescEl.innerHTML = `
      <textarea
        id="edit-short-description"
        class="form-control"
        rows="4"
        placeholder="Short description"
      >${escapeHtml(currentCompany.description || "")}</textarea>
    `;
  }

  if (descEl) {
    descEl.innerHTML = `
      <textarea
        id="edit-description"
        class="form-control"
        rows="8"
        placeholder="Company description"
      >${escapeHtml(currentCompany.description || "")}</textarea>
    `;
  }

  if (industryEl) {
    industryEl.innerHTML = `
      <span class="text-muted">${escapeHtml(currentCompany.industry || "Not specified")}</span>
    `;
  }

  if (locationEl) {
    locationEl.innerHTML = `
      <span class="text-muted">${escapeHtml([prefecture, city].filter(Boolean).join(", ") || "Not specified")}</span>
    `;
  }

  toggleEditButtons(true);
}

function cancelEditMode() {
  if (!currentCompany) return;

  isEditMode = false;
  populateCompanyDetails(currentCompany);
  toggleEditButtons(false);
}

function toggleEditButtons(editing) {
  document.getElementById("adminEditBtn")?.classList.toggle("d-none", editing);
  document.getElementById("saveCompanyBtn")?.classList.toggle("d-none", !editing);
  document.getElementById("cancelEditBtn")?.classList.toggle("d-none", !editing);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function saveCompanyChanges() {
  if (!currentCompany?._id) {
    alert("Company ID not found.");
    return;
  }

  const token = localStorage.getItem("token") || getCookie("token");
  if (!token) {
    alert("You are not authenticated.");
    return;
  }

  const name = document.getElementById("edit-name")?.value.trim() || "";
  const industry = document.getElementById("edit-industry")?.value || "";
    "";
  const prefecture = document.getElementById("edit-prefecture")?.value.trim() || "";
  const city = document.getElementById("edit-city")?.value.trim() || "";
  const shortDescription =
    document.getElementById("edit-short-description")?.value.trim() || "";
  const description =
    document.getElementById("edit-description")?.value.trim() || shortDescription;

  const payload = {
    name,
    industry,
    description,
    location: {
      prefecture,
      city,
    },
  };

  console.log("update payload:", payload);

  try {
    const response = await fetch(
      `http://localhost:3000/api/v1/companies/${currentCompany._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    console.log("update response status:", response.status);
    console.log("update response result:", result);

    if (!response.ok) {
      throw new Error(result.message || "Failed to update company.");
    }

    const updatedCompany = result?.data?.company || result?.data || null;

    if (!updatedCompany) {
      throw new Error("Updated company data was not returned.");
    }

    currentCompany = updatedCompany;
    isEditMode = false;

    populateCompanyDetails(currentCompany);
    toggleEditButtons(false);

    alert("Company updated successfully.");
  } catch (error) {
    console.error("Save failed:", error);
    alert(error.message || "Failed to save company changes.");
  }
}

function getCookie(name) {
  const match = document.cookie.match(
    new RegExp("(^|;\\s*)" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : null;
}


function getActiveJobs(jobs = []) {
  if (!Array.isArray(jobs)) return [];

  return jobs.filter((job) => {
    if (!job || typeof job !== "object") return false;
    const status = String(job.status || "").toLowerCase();
    return status === "active" || status === "open";
  });
}

function populateCompanyDetails(company) {
  const companyName = company.name || "Company Name";
  const city = company.location?.city || "";
  const prefecture = company.location?.prefecture || "";
  const fullLocation = [city, prefecture].filter(Boolean).join(", ");
  const activeJobs = getActiveJobs(company.jobs || []);
  const jobsCount = activeJobs.length;

  setText("det-name", companyName);
  setText("det-meta", `${company.industry || "Industry"} • ${prefecture || "Japan"}`);
  setText("det-short-description", company.description || "No summary available.");

  const descEl = document.getElementById("det-description");
  if (descEl) {
    descEl.innerHTML = `<p class="mb-0">${escapeHtml(company.description || "No description available.")}</p>`;
  }

  setText("det-location", fullLocation || "Not specified");
  setText("det-location-stat", prefecture || "—");
  setText("det-industry", company.industry || "Not specified");
  setText("det-industry-stat", company.industry || "—");
  setText("det-founded", company.founded || "Not specified");
  setText("det-founded-stat", company.founded || "—");
  setText("det-size", company.size || "Not specified");
  setText("det-open-jobs", jobsCount);
  setText("det-job-count-text", jobsCount);

  const logoEl = document.getElementById("det-logo");
  if (logoEl) {
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=f8f9fa&color=212529&size=128`;
    logoEl.src = company.logo || company.logoUrl || fallback;
    logoEl.alt = `${companyName} logo`;
    logoEl.onerror = function () {
      this.src = fallback;
      this.onerror = null;
    };
  }

  const websiteEl = document.getElementById("det-website");
  if (websiteEl) {
    websiteEl.href = company.website || "#";
    websiteEl.classList.toggle("disabled", !company.website);
  }

  const verifiedBadge = document.getElementById("det-verified");
  if (verifiedBadge) {
    verifiedBadge.classList.toggle("d-none", !company.isVerified);
  }

  renderCompanyJobs(activeJobs);
}