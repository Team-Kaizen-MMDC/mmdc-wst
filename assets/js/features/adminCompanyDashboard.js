const API_BASE_URL = "http://localhost:3000/api/v1/companies";
const companyModal = new bootstrap.Modal(document.getElementById('editCompanyModal'));

document.addEventListener("DOMContentLoaded", () => {
  fetchAdminCompanies();
  
  // Handle Form Submit
  document.getElementById('editCompanyForm').addEventListener('submit', handleUpdateCompany);
});

async function fetchAdminCompanies() {
  const tableBody = document.getElementById("adminCompanyTableBody");
  try {
    const response = await fetch(API_BASE_URL);
    const result = await response.json();
    const companies = result.data?.companies || [];

    document.getElementById('adminCompanyCount').textContent = companies.length;
    
    // Inside fetchAdminCompanies() mapping
tableBody.innerHTML = companies.map(company => {
  // Use slug for cleaner URLs, fallback to _id
  const companyId = company.slug || company._id; 
  
  return `
    <tr>
      <td class="ps-4">
        <div class="d-flex align-items-center gap-3">
          <img src="${company.logoUrl || 'https://via.placeholder.com/40'}" width="40" height="40" class="rounded border">
          <span class="fw-bold">${company.name}</span>
        </div>
      </td>
      <td>${company.location?.prefecture || 'N/A'}</td>
      <td><span class="badge text-bg-light border">${company.industry || 'General'}</span></td>
      <td>${company.jobs?.length || 0} Jobs</td>
      <td class="text-end pe-4">
        <a href="../../pages/companies/company-details.html?slug=${companyId}" class="btn btn-sm btn-outline-primary rounded-pill px-3">
  Edit
</a>
      </td>
    </tr>
  `;
}).join("");
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error loading companies.</td></tr>`;
  }
}

async function openEditModal(slug) {
  try {
    const response = await fetch(`${API_BASE_URL}/${slug}`);
    const result = await response.json();
    const company = result.data?.company || result.data;

    // Fill form fields
    document.getElementById('edit-company-id').value = company._id;
    document.getElementById('edit-company-name').value = company.name || "";
    document.getElementById('edit-company-industry').value = company.industry || "";
    document.getElementById('edit-company-prefecture').value = company.location?.prefecture || "";
    document.getElementById('edit-company-city').value = company.location?.city || "";
    document.getElementById('edit-company-description').value = company.description || "";

    companyModal.show();
  } catch (error) {
    alert("Could not fetch company details");
  }
}

async function handleUpdateCompany(e) {
  e.preventDefault();
  const id = document.getElementById('edit-company-id').value;
  
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
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH', // or PUT depending on your API
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });

    if (response.ok) {
      alert("Company updated successfully!");
      companyModal.hide();
      fetchAdminCompanies(); // Refresh table
    }
  } catch (error) {
    alert("Failed to update company");
  }
}

// Attach to window immediately so other scripts can see it// assets/js/features/adminCompanyDashboard.js

window.fetchAdminCompanies = async function() {
  console.log("Global fetchAdminCompanies execution started.");
  
  const tableBody = document.getElementById("adminCompanyTableBody");
  const loader = document.getElementById("adminCompanyLoader");
  const countEl = document.getElementById('adminCompanyCount');

  // Hardcoded for local dev; adjust if needed
  const API_URL = "http://localhost:3000/api/v1/companies";

  try {
    const response = await fetch(API_URL);
    const result = await response.json();
    
    // Hide loader immediately after response
    if (loader) loader.classList.add('d-none');

    const companies = result.data?.companies || [];
    if (countEl) countEl.textContent = companies.length;

    if (!tableBody) return;

    if (companies.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No companies found.</td></tr>';
      return;
    }

    tableBody.innerHTML = companies.map(company => {
      // Fix for the placeholder/broken image issue
      const logo = (company.logoUrl && company.logoUrl.trim() !== "") 
                   ? company.logoUrl 
                   : 'https://via.placeholder.com/40';

      return `
        <tr>
          <td class="ps-4">
            <div class="d-flex align-items-center gap-3">
              <img src="${logo}" width="40" height="40" class="rounded border" onerror="this.src='https://via.placeholder.com/40'">
              <span class="fw-bold">${company.name || 'Unknown Company'}</span>
            </div>
          </td>
          <td>${company.location?.prefecture || 'N/A'}</td>
          <td><span class="badge text-bg-light border">${company.industry || 'General'}</span></td>
          <td>${company.jobs?.length || 0} Jobs</td>
          <td class="text-end pe-4">
            <a href="../../pages/companies/company-details.html?slug=${company.slug || company._id}" 
               class="btn btn-sm btn-outline-primary rounded-pill px-3">Edit</a>
          </td>
        </tr>
      `;
    }).join("");

  } catch (error) {
    console.error("Critical Dashboard Error:", error);
    if (loader) loader.classList.add('d-none');
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error: ${error.message}</td></tr>`;
  }
};