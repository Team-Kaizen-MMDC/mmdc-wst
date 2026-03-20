//latestJob.js

const API_BASE_URL = "http://localhost:3000/api/v1";

const latestJobsList = document.getElementById("latest-jobs-list");

function createJobItem(job) {
  const title = job.title || "Untitled Job";
  const category = job.category || job.industry || "General";

  const location = `${job.location?.city || ""}, ${job.location?.prefecture || ""}`;

  const jobId = job._id;

  return `
    <li class="list-group-item d-flex justify-content-between align-items-center py-3 px-4">
      <div class="job-details me-auto">
        <h3 class="h5 mb-1 fw-bold text-primary-dark">${title}</h3>
        <p class="text-secondary small mb-0">${category} — ${location}</p>
      </div>
      <a class="btn btn-primary rounded-pill px-3" href="pages/jobs/jobDetails.html?id=${jobId}">
        Apply
      </a>
    </li>
  `;
}

async function loadLatestJobs() {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs?limit=5&sort=-createdAt`);
    const result = await response.json();

    // ✅ THIS IS THE FIX
    const jobs = result.data?.jobs || [];

    if (!jobs.length) {
      latestJobsList.innerHTML = `<li class="text-center py-4">No jobs found</li>`;
      return;
    }

    latestJobsList.innerHTML = jobs
      .slice(0, 5)
      .map(createJobItem)
      .join("");

  } catch (err) {
    console.error(err);
    latestJobsList.innerHTML = `<li class="text-danger text-center py-4">Failed to load jobs</li>`;
  }
}

document.addEventListener("DOMContentLoaded", loadLatestJobs);