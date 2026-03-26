// assets/js/features/jobDetails.js
// Job details page: loads job data and handles authenticated apply flow for jobseekers.

import { getCookie, getRoleFromToken } from "../modules/storage.js";

const API_BASE = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:3000/api/v1'
  : '/api/v1';

const jobDetail = document.getElementById("jobDetail");

// ─── Helpers ────────────────────────────────────────────────────────────────

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
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
  if (min && max)
    return `${currency} ${Number(min).toLocaleString()} – ${Number(max).toLocaleString()} / ${period}`;
  if (min) return `${currency} ${Number(min).toLocaleString()} / ${period}`;
  return "Not specified";
}

function formatLocation(job) {
  const city = job.location?.city || "";
  const prefecture = job.location?.prefecture || "";
  return [city, prefecture].filter(Boolean).join(", ") || "Not specified";
}

function getAuthToken() {
  // Prefer localStorage (set by signin.html and googleAuth.js)
  const ls = localStorage.getItem("token");
  if (ls) return ls;
  // Fall back to cookie (set by OAuth session)
  const cookie = getCookie("token");
  return cookie ? decodeURIComponent(cookie) : null;
}

function getAuthHeaders() {
  const token = getAuthToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// ─── Auth state ─────────────────────────────────────────────────────────────

function getAuthState() {
  const token = getAuthToken();
  const cookieLoggedIn = getCookie("isLoggedIn") === "true";
  const role = token ? getRoleFromToken() : null;
  return { isLoggedIn: cookieLoggedIn || !!token, role };
}

// ─── Already-applied check ───────────────────────────────────────────────────

async function checkAlreadyApplied(jobId) {
  try {
    const res = await fetch(`${API_BASE}/applications/me?limit=100`, {
      headers: getAuthHeaders(),
    });
    if (res.status === 401) {
      // Account locked or session expired — show a warning banner
      const warning = document.getElementById("applySection");
      if (warning) {
        warning.innerHTML = `<div class="alert alert-warning mb-0">⚠️ Your account is locked or session expired. <a href="../signin.html">Log in again</a> to apply.</div>`;
      }
      return true; // treat as applied so the normal apply button is suppressed
    }
    if (!res.ok) return false;
    const data = await res.json();
    const apps = data.data?.applications || [];
    return apps.some((a) => (a.job?._id || a.job) === jobId);
  } catch {
    return false;
  }
}

// ─── Apply CTA html ──────────────────────────────────────────────────────────

function applyButtonHtml(isLoggedIn, role, alreadyApplied) {
  if (!isLoggedIn) {
    return `<a href="../signin.html" class="btn btn-primary rounded-pill px-4">Login to Apply</a>`;
  }
  if (role === "jobseeker") {
    if (alreadyApplied) {
      return `<button class="btn btn-success rounded-pill px-4" disabled aria-disabled="true">✓ Already Applied</button>`;
    }
    return `<button
        id="applyBtn"
        class="btn btn-primary rounded-pill px-4"
        data-bs-toggle="modal"
        data-bs-target="#applyModal"
        aria-label="Open application form"
      >Apply Now</button>`;
  }
  // employer / admin — no apply button shown
  return "";
}

// ─── Render ──────────────────────────────────────────────────────────────────

function renderError(message) {
  jobDetail.innerHTML = `
    <div class="card shadow-sm rounded-4">
      <div class="card-body p-4 p-lg-5 text-center text-danger">
        ${escapeHTML(message)}
      </div>
    </div>`;
}

function renderJob(job, applyHtml) {
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
  const deadline = job.applicationDeadline
    ? escapeHTML(new Date(job.applicationDeadline).toLocaleDateString())
    : "Not specified";

  jobDetail.innerHTML = `
    <div class="card shadow-sm rounded-4">
      <div class="card-body p-4 p-lg-5">
        <div class="mb-4">
          <p class="text-muted mb-1">${companyName}</p>
          <h1 class="fw-bold mb-2">${title}</h1>
          <p class="text-secondary mb-0">${category} • ${location}</p>
        </div>

        <div class="row g-4 mb-4">
          <div class="col-md-6">
            <div class="border rounded-4 p-3 h-100">
              <h2 class="h5 fw-bold mb-3">Job Overview</h2>
              <p class="mb-2"><strong>Company:</strong> ${companyName}</p>
              <p class="mb-2"><strong>Industry:</strong> ${industry}</p>
              <p class="mb-2"><strong>Location:</strong> ${location}</p>
              <p class="mb-2"><strong>Salary:</strong> ${salary}</p>
              <p class="mb-2"><strong>Japanese Level:</strong> ${japaneseLevel}</p>
              <p class="mb-0"><strong>Deadline:</strong> ${deadline}</p>
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

        <div class="d-flex align-items-center gap-3 flex-wrap" id="applySection">
          ${applyHtml}
        </div>
      </div>
    </div>`;
}

// ─── Modal: submit application ───────────────────────────────────────────────

function setupApplyModal(jobId) {
  const submitBtn = document.getElementById("submitApplyBtn");
  const spinner = document.getElementById("submitApplySpinner");
  const btnText = document.getElementById("submitApplyBtnText");
  const statusEl = document.getElementById("applyStatus");
  const coverLetterEl = document.getElementById("coverLetterInput");
  const charCount = document.getElementById("charCount");

  if (!submitBtn) return;

  // Character counter
  if (coverLetterEl && charCount) {
    coverLetterEl.addEventListener("input", () => {
      charCount.textContent = `${coverLetterEl.value.length} / 2000`;
    });
  }

  function showStatus(message, isSuccess) {
    statusEl.textContent = message;
    statusEl.className = `alert ${isSuccess ? "alert-success" : "alert-danger"} mb-3`;
    statusEl.classList.remove("d-none");
  }

  submitBtn.addEventListener("click", async () => {
    const coverLetter = coverLetterEl?.value.trim() || "";

    submitBtn.disabled = true;
    spinner.classList.remove("d-none");
    btnText.textContent = "Submitting…";
    statusEl.classList.add("d-none");

    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}/apply`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ coverLetter }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Your session has expired or your account is locked. Please log out and log back in, then try again.");
        }
        throw new Error(data.message || "Failed to submit application.");
      }

      showStatus("🎉 Application submitted successfully!", true);
      btnText.textContent = "Submitted!";

      // Update the apply section on the page to "Already Applied"
      const applySection = document.getElementById("applySection");
      if (applySection) {
        applySection.innerHTML = `<button class="btn btn-success rounded-pill px-4" disabled aria-disabled="true">✓ Already Applied</button>`;
      }

      // Close modal after 1.5 s
      setTimeout(() => {
        const modalEl = document.getElementById("applyModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }, 1500);
    } catch (err) {
      showStatus(err.message || "Something went wrong. Please try again.", false);
      submitBtn.disabled = false;
      spinner.classList.add("d-none");
      btnText.textContent = "Submit Application";
    }
  });

  // Reset form state on modal close
  document.getElementById("applyModal")?.addEventListener("hidden.bs.modal", () => {
    statusEl.classList.add("d-none");
    if (coverLetterEl) coverLetterEl.value = "";
    if (charCount) charCount.textContent = "0 / 2000";
    submitBtn.disabled = false;
    spinner.classList.add("d-none");
    btnText.textContent = "Submit Application";
  });
}

// ─── Init ────────────────────────────────────────────────────────────────────

async function init() {
  const jobId = getQueryParam("id");

  if (!jobId) {
    renderError("No job ID found in URL.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/jobs/${jobId}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to load job details.");
    }

    const job = result.data?.job;
    if (!job) throw new Error("Job data is missing from API response.");

    const { isLoggedIn, role } = getAuthState();
    let alreadyApplied = false;
    if (isLoggedIn && role === "jobseeker") {
      alreadyApplied = await checkAlreadyApplied(jobId);
    }

    const applyHtml = applyButtonHtml(isLoggedIn, role, alreadyApplied);
    renderJob(job, applyHtml);

    if (isLoggedIn && role === "jobseeker" && !alreadyApplied) {
      setupApplyModal(jobId);
    }
  } catch (error) {
    console.error("Error loading job details:", error);
    renderError(error.message || "Something went wrong while loading this job.");
  }
}

document.addEventListener("DOMContentLoaded", init);
