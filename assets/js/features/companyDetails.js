// assets/js/features/companyDetails.js

const API_BASE_URL = (
  ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:3000/api/v1'
    : '/api/v1'
) + '/companies';

let companyModal;
let currentCompanyData = null;

document.addEventListener("DOMContentLoaded", () => {
  // Initialize modal after Bootstrap has loaded
  const modalEl = document.getElementById('editCompanyModal');
  if (modalEl && typeof bootstrap !== 'undefined') {
    companyModal = new bootstrap.Modal(modalEl);
  }
  
  localStorage.setItem("userRole", "admin");
  initCompanyDetails();

  const editForm = document.getElementById('editCompanyForm');
  if (editForm) {
    editForm.addEventListener('submit', handleUpdateCompany);
  }
});

// Helper for Token
function getToken() {
  const match = document.cookie.split("; ").find((r) => r.startsWith("token="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

// Check Role
function getIsAdmin() {
  const role = localStorage.getItem("userRole");
  return role === "admin";
}

async function initCompanyDetails() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug") || params.get("id");

  if (!slug) {
    showErrorState("No company identifier provided.");
    return;
  }

  try {

    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(slug)}`);
    if (!response.ok) throw new Error("Server error");

    const result = await response.json();
    currentCompanyData = result?.data?.company || result?.data || result;

    if (!currentCompanyData) throw new Error("No company data");

    populateCompanyDetails(currentCompanyData);
    renderCompanyJobs(currentCompanyData.jobs || []);
    
  } catch (error) {
    console.error("Load failed:", error);
    showErrorState();
  }
}

function populateCompanyDetails(company) {
  // --- Admin Section Logic ---
  const adminSection = document.getElementById("admin-edit-section");
  if (adminSection && getIsAdmin()) {
    adminSection.classList.remove("d-none");
    const editBtn = document.getElementById("btn-edit-profile");
    if (editBtn) {
      editBtn.onclick = () => openEditModal(company);
    }
  }

  // --- Render Profile ---
  const name = company.name || "N/A";
  setText("det-name", name);
  setText("det-meta", `${company.industry || "General"} • ${company.location?.prefecture || "Japan"}`);
  setText("det-short-description", company.description ? company.description.substring(0, 160) + "..." : "");
  
  const descEl = document.getElementById("det-description");
  if (descEl) descEl.innerHTML = `<p>${escapeHtml(company.description || "No description.")}</p>`;

  // Stats
  setText("det-location", company.location?.city + ", " + company.location?.prefecture);
  setText("det-location-stat", company.location?.prefecture || "—");
  setText("det-industry", company.industry || "—");
  setText("det-industry-stat", company.industry || "—");

  setText("det-founded-stat", company.founded || "—");
  setText("det-open-jobs", company.jobs?.length || 0);
  setText("det-job-count-text", company.jobs?.length || 0);
''
  const logoEl = document.getElementById("det-logo");
  if (logoEl) logoEl.src = company.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
}

function openEditModal(company) {
  if (!companyModal) return;

  //  Extract the string ID specifically
  const cleanId = company._id?.$oid || company._id;
    const dbId = company._id;
  document.getElementById('edit-company-id').value = cleanId;
  document.getElementById('edit-company-name').value = company.name || "";
  document.getElementById('edit-company-industry').value = company.industry || "";
  document.getElementById('edit-company-prefecture').value = company.location?.prefecture || "";
  document.getElementById('edit-company-city').value = company.location?.city || "";
  document.getElementById('edit-company-description').value = company.description || "";
  companyModal.show();
}

async function handleUpdateCompany(e) {
  e.preventDefault();
  const id = document.getElementById('edit-company-id').value;
  const token = getToken();

  if (!id || id === "undefined" || id === "[object Object]") {
    alert("Error: Invalid Company ID. Please refresh and try again.");
    return;
  }

  const updatedData = {
    name: document.getElementById('edit-company-name').value,
    industry: document.getElementById('edit-company-industry').value,
    location: {
      prefecture: document.getElementById('edit-company-prefecture').value,
      city: document.getElementById('edit-company-city').value
    },
    description: document.getElementById('edit-company-description').value
  };

  try {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(updatedData)
    });

    if (res.ok) {
      alert("Changes saved successfully!");
      companyModal.hide();
      window.location.reload(); 
    } else {
      const errorData = await res.json();
      alert(`Update failed: ${errorData.message || 'Check permissions'}`);
    }
  } catch (err) {
    console.error("Save Error:", err);
    alert("Error saving changes. Check console.");
  }
}

// --- Helpers ---
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showErrorState(msg = "Failed to load company.") {
  const container = document.getElementById("companyDetailContent");
  if (container) container.innerHTML = `<div class="alert alert-danger">${msg}</div>`;
}


function renderCompanyJobs(jobs = []) {
  const container = document.getElementById("companyActiveJobs");
  if (!container) return;
  if (jobs.length === 0) {
    container.innerHTML = `<p class="text-muted ps-3">No active openings.</p>`;
    return;
  }
  container.innerHTML = jobs.map(job => `
    <div class="col-md-6 mb-3">
      <div class="card h-100 border-0 shadow-sm rounded-4">
        <div class="card-body">
          <h6 class="fw-bold">${job.title}</h6>
          <p class="small text-muted mb-2">${job.location?.prefecture || "Japan"}</p>
          <a href="../../pages/jobs/jobDetails.html?id=${job._id}" class="btn btn-sm btn-outline-danger rounded-pill">View Job</a>
        </div>
      </div>
    </div>
  `).join(''); 
}