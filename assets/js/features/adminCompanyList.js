// assets/js/features/adminCompanyList.js

const API_BASE_URL = "/api/v1/companies";

let allCompanies = [];
let currentPage = 1;
const pageSize = 10;
let searchTerm = "";

document.addEventListener("DOMContentLoaded", () => {


  fetchAdminCompanies();

  const searchInput = document.getElementById("companySearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      currentPage = 1;
      renderCompanyPage(1);
    });
  }
});

window.fetchAdminCompanies = async function () {
  console.log("fetchAdminCompanies started");

  const tableBody = document.getElementById("adminCompanyTableBody");
  const countEl = document.getElementById("adminCompanyCount");
  const paginationEl = document.getElementById("companyManagementPagination");

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

    if (paginationEl) {
      paginationEl.innerHTML = "";
    }

    const response = await fetch(`${API_BASE_URL}?limit=100`);
    const result = await response.json();

    allCompanies = result.data?.companies || [];
    const totalCompanies = result.data?.pagination?.total ?? allCompanies.length;

    if (countEl) {
      countEl.textContent = totalCompanies;
    }

    renderCompanyPage(1);
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

function renderCompanyPage(page) {
  const tableBody = document.getElementById("adminCompanyTableBody");
  const paginationEl = document.getElementById("companyManagementPagination");

  if (!tableBody) return;

  const filteredCompanies = allCompanies.filter((company) => {
    const name = (company.name || "").toLowerCase();
    const industry = (company.industry || "").toLowerCase();
    const location = [
      company.location?.prefecture,
      company.location?.city,
    ]
      .filter(Boolean)
      .join(", ")
      .toLowerCase();

    return (
      name.includes(searchTerm) ||
      industry.includes(searchTerm) ||
      location.includes(searchTerm)
    );
  });

  if (!filteredCompanies.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted py-4">
          No matching companies found.
        </td>
      </tr>
    `;
    if (paginationEl) {
      paginationEl.innerHTML = "";
    }
    return;
  }

  const totalItems = filteredCompanies.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  currentPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredCompanies.slice(startIndex, startIndex + pageSize);

  tableBody.innerHTML = pageItems
    .map((company) => {
      const slug = company.slug || company._id;
      const location = [company.location?.prefecture, company.location?.city]
        .filter(Boolean)
        .join(", ");

      return `
        <tr>
          <td class="ps-4 fw-semibold">${escapeHtml(company.name || "-")}</td>
          <td>${escapeHtml(location || "-")}</td>
          <td>${escapeHtml(company.industry || "-")}</td>
          <td>${escapeHtml(String(company.jobCount ?? 0))}</td>
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
    })
    .join("");

  renderCompanyPagination(paginationEl, totalItems, totalPages);
}

function renderCompanyPagination(container, totalItems, totalPages) {
  if (!container) return;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  let html = `
    <small class="text-muted">
      Showing ${start}–${end} of ${totalItems} companies
    </small>
    <nav aria-label="Company management pagination">
      <ul class="pagination pagination-sm mb-0">
  `;

  html += `
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <button class="page-link" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>
        ‹
      </button>
    </li>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <button class="page-link" data-page="${i}">${i}</button>
      </li>
    `;
  }

  html += `
    <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
      <button class="page-link" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>
        ›
      </button>
    </li>
  `;

  html += `
      </ul>
    </nav>
  `;

  container.innerHTML = html;

  container.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = Number(btn.dataset.page);
      if (page >= 1 && page <= totalPages) {
        renderCompanyPage(page);
      }
    });
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}