const API_BASE = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:3000/api/v1'
  : '/api/v1';
const API_URL = `${API_BASE}/companies?limit=6`;

async function fetchTopCompanies() {
  const grid = document.getElementById("companyGrid");
  if (!grid) return;

  // 1. SHOW SKELETONS IMMEDIATELY
  grid.innerHTML = Array(6).fill(0).map(() => `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="card h-100 border-0 shadow-sm rounded-4 p-4 text-center">
        <div class="placeholder-glow">
          <div class="placeholder rounded-3 mb-3" style="height: 80px; width: 80px; margin: 0 auto;"></div>
          <h3 class="placeholder col-6"></h3>
        </div>
      </div>
    </div>
  `).join("");

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    const companies = result.data?.companies || result.companies || [];

    if (companies.length === 0) {
      grid.innerHTML = '<div class="col-12 text-center text-muted py-5">No companies found.</div>';
      return;
    }

    // 2. RENDER REAL DATA
    // Note: I removed 'animate-fade-in-up' temporarily to ensure visibility. 
    // If you want animations, ensure your CSS handles the initial opacity.
    grid.innerHTML = companies.map(company => {
      const identifier = company.slug || (company._id?.$oid || company._id);
      const logo = company.logoUrl || company.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=f8f9fa&color=212529&size=128`;

      return `
        <div class="col-12 col-sm-6 col-lg-4">
          <a href="pages/companies/company-details.html?slug=${identifier}" class="text-decoration-none d-block">
            <div class="card h-100 shadow-sm rounded-4 p-4 text-center border-0 top-company-card bg-white shadow-hover">
              <div class="card-body d-flex flex-column align-items-center justify-content-center p-0">
                <img
                  src="${logo}"
                  class="img-fluid mb-3"
                  style="height: 80px; width: auto; object-fit: contain; opacity: 1 !important;" 
                  alt="${company.name} logo"
                  onerror="this.src='https://placehold.co/120x80/f8f9fa/333333?text=${encodeURIComponent(company.name)}'"
                />
                <h3 class="card-title fw-bold text-dark mt-2 mb-0 fs-6">
                  ${company.name}
                </h3>
              </div>
            </div>
          </a>
        </div>
      `;
    }).join("");

  } catch (error) {
    console.error("Home Companies Error:", error);
    grid.innerHTML = `<div class="col-12 text-center text-danger py-5">Unable to connect to the server.</div>`;
  }
}

fetchTopCompanies();