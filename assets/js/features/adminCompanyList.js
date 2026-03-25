// assets/js/features/adminCompanyList.js

const API_BASE_URL = "http://localhost:3000/api/v1/companies";

let companyModal = null;

document.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("editCompanyModal");
  const formEl = document.getElementById("editCompanyForm");
 const tableBody = document.getElementById("adminCompanyTableBody");
  if (modalEl) {
    companyModal = new bootstrap.Modal(modalEl);
  }

  if (formEl) {
    formEl.addEventListener("submit", handleUpdateCompany);
  }


  if (tableBody) {
    tableBody.addEventListener("click", (e) => {
      const editBtn = e.target.closest(".edit-company-btn");
      if (!editBtn) return;

      const companyId = editBtn.dataset.companyId;
      if (companyId) {
        openEditModal(companyId);
      }
    });
  }

  fetchAdminCompanies();
});

window.fetchAdminCompanies = async function () {
  console.log("fetchAdminCompanies started");

  const tableBody = document.getElementById("adminCompanyTableBody");
  const countEl = document.getElementById("adminCompanyCount");

  if (!tableBody) {
    console.warn("adminCompanyTableBody not found");
    return;
  }

  try {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
        </td>
      </tr>
    `;

    const response = await fetch(API_BASE_URL);
    const result = await response.json();

    const companies = result.data?.companies || [];

    if (countEl) {
      countEl.textContent = companies.length;
    }

    if (!companies.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-4">
            No companies found.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = companies.map(company => {
      const slugOrId = company.slug || company._id;
      const location = [
        company.location?.prefecture,
        company.location?.city
      ].filter(Boolean).join(", ");

      return `
        <tr>
          <td class="ps-4 fw-semibold">${company.name || "-"}</td>
          <td>${location || "-"}</td>
          <td>${company.industry || "-"}</td>
          <td>${company.jobsCount ?? 0}</td>
          <td class="text-end pe-4">
            <button
                class="btn btn-sm btn-outline-primary edit-company-btn"
                data-company-id="${slugOrId}"
                type="button"
            >
                Edit
            </button>
            </td>
        </tr>
      `;
    }).join("");
  } catch (error) {
    console.error("Failed to fetch companies:", error);

    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-danger py-4">
          Failed to load companies.
        </td>
      </tr>
    `;
  }
};

window.openEditModal = async function (slug) {
  try {
    const response = await fetch(`${API_BASE_URL}/${slug}`);
    const result = await response.json();
    const company = result.data?.company || result.data;

    if (!company) {
      alert("Company data not found");
      return;
    }

    document.getElementById("edit-company-id").value = company._id || "";
    document.getElementById("edit-company-name").value = company.name || "";
    document.getElementById("edit-company-industry").value = company.industry || "";
    document.getElementById("edit-company-prefecture").value = company.location?.prefecture || "";
    document.getElementById("edit-company-city").value = company.location?.city || "";
    document.getElementById("edit-company-description").value = company.description || "";

    if (companyModal) {
      companyModal.show();
    }
  } catch (error) {
    console.error("Could not fetch company details:", error);
    alert("Could not fetch company details");
  }
};

async function handleUpdateCompany(e) {
  e.preventDefault();

  const id = document.getElementById("edit-company-id").value;
  const token = localStorage.getItem("token") || getCookie("token");

  const updatedData = {
    name: document.getElementById("edit-company-name").value.trim(),
    industry: document.getElementById("edit-company-industry").value.trim(),
    location: {
      prefecture: document.getElementById("edit-company-prefecture").value.trim(),
      city: document.getElementById("edit-company-city").value.trim(),
    },
    description: document.getElementById("edit-company-description").value.trim(),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(updatedData),
    });

    const result = await response.json();
    console.log("update result:", result);

    if (!response.ok) {
      throw new Error(result.message || "Failed to update company");
    }

    alert("Company updated successfully!");
    if (companyModal) companyModal.hide();
    fetchAdminCompanies();
  } catch (error) {
    console.error("Update failed:", error);
    alert(error.message || "Failed to update company");
  }
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}