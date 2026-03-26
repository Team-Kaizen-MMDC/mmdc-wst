// assets/js/features/adminCompanyList.js


const API_BASE_URL = "http://localhost:3000/api/v1/companies";

document.addEventListener("DOMContentLoaded", () => {


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

    const response = await fetch(`${API_BASE_URL}?limit=100`);
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
      const slug = company.slug || company._id;
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
            <a
              href="/pages/companies/company-details.html?slug=${encodeURIComponent(slug)}"
              class="btn btn-sm btn-outline-primary"
            >
              Edit
            </a>
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
