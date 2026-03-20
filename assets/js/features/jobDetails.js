//jobDetails.js

const API_BASE_URL = "http://localhost:3000/api/v1";
const jobDetail = document.getElementById("jobDetail");

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function escapeHTML(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatSalary(job) {
  const min = job.compensation?.salaryMin;
  const max = job.compensation?.salaryMax;
  const currency = job.compensation?.currency || "JPY";
  const period = job.compensation?.period || "monthly";

  if (min && max) {
    return `${currency} ${Number(min).toLocaleString()} - ${Number(max).toLocaleString()} / ${period}`;
  }

  if (min) {
    return `${currency} ${Number(min).toLocaleString()} / ${period}`;
  }

  return "Not specified";
}

function formatLocation(job) {
  const city = job.location?.city || "";
  const prefecture = job.location?.prefecture || "";
  return [city, prefecture].filter(Boolean).join(", ") || "Not specified";
}

function renderError(message) {
  jobDetail.innerHTML = `
    <div class="card shadow-sm rounded-4">
      <div class="card-body p-4 p-lg-5 text-center text-danger">
        ${escapeHTML(message)}
      </div>
    </div>
  `;
}

function renderJob(job) {
  const title = escapeHTML(job.title || "Untitled Job");
  const companyName = escapeHTML(job.company?.name || "Company not specified");
  const location = escapeHTML(formatLocation(job));
  const salary = escapeHTML(formatSalary(job));
  const japaneseLevel = escapeHTML(job.japaneseLevel || "Not specified");
  const summary = escapeHTML(job.summary || "No summary available.");
  const industry = escapeHTML(job.industry || "Not specified");
  const category = escapeHTML(job.category || "Not specified");
  const requirements = escapeHTML(job.requirements || "Not specified");
  const responsibilities = escapeHTML(job.responsibilities || "Not specified");

  jobDetail.innerHTML = `
    <div class="card shadow-sm rounded-4">
      <div class="card-body p-4 p-lg-5">
        <div class="mb-4">
          <p class="text-muted mb-2">${companyName}</p>
          <h1 class="fw-bold mb-2">${title}</h1>
          <p class="text-secondary mb-0">${category} • ${location}</p>
        </div>

        <div class="row g-4 mb-4">
          <div class="col-md-6">
            <div class="border rounded-4 p-3 h-100">
              <h2 class="h5 fw-bold mb-3">Job Overview</h2>
              <p><strong>Company:</strong> ${companyName}</p>
              <p><strong>Industry:</strong> ${industry}</p>
              <p><strong>Location:</strong> ${location}</p>
              <p><strong>Salary:</strong> ${salary}</p>
              <p><strong>Japanese Level:</strong> ${japaneseLevel}</p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="border rounded-4 p-3 h-100">
              <h2 class="h5 fw-bold mb-3">Summary</h2>
              <p class="mb-0">${summary}</p>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <h2 class="h5 fw-bold mb-3">Responsibilities</h2>
          <p>${responsibilities}</p>
        </div>

        <div class="mb-4">
          <h2 class="h5 fw-bold mb-3">Requirements</h2>
          <p>${requirements}</p>
        </div>

        <a href="../signin.html" class="btn btn-primary rounded-pill px-4">
          Apply Now
        </a>
      </div>
    </div>
  `;
}

async function loadJobDetails() {
  const jobId = getQueryParam("id");

  if (!jobId) {
    renderError("No job ID found in URL.");
    return;
  }

  try {
    console.log("Fetching job:", `${API_BASE_URL}/jobs/${jobId}`);

    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
    const result = await response.json();

    console.log("API response:", result);

    if (!response.ok) {
      throw new Error(result.message || "Failed to load job details.");
    }

    const job = result.data?.job;

    if (!job) {
      throw new Error("Job data is missing from API response.");
    }

    renderJob(job);
  } catch (error) {
    console.error("Error loading job details:", error);
    renderError(error.message || "Something went wrong while loading this job.");
  }
}

document.addEventListener("DOMContentLoaded", loadJobDetails);