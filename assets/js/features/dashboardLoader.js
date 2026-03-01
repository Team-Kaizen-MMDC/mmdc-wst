/**
 * dashboardLoader.js
 */

async function loadJobDetails(jobId) {
    console.log("Fetching job details for ID:", jobId);

    const titleH1 = document.getElementById('job-title-h1');
    const modalTitle = document.getElementById('modal-job-title');
    const companyDisplay = document.getElementById('modal-company-name');
    const overview = document.getElementById('modal-department-overview');
    const metaInfo = document.getElementById('modal-job-meta');
    const condList = document.getElementById('modal-conditions-list');
    const reqList = document.getElementById('modal-requirements-list');

    try {
        const response = await fetch(`http://localhost:3000/api/v1/admin-jobs/${jobId}`);
        const result = await response.json();

        if (result.success) {
            const job = result.data.job;

            // 1. Company Name to the top breadcrumb
            if (companyDisplay) {
                companyDisplay.textContent = job.companyName || "Unknown Company";
            }
            
            // Map Basic Titles
            if (modalTitle) modalTitle.textContent = job.title;
            if (titleH1) titleH1.textContent = job.title;

            // 2. Overview uses 'summary' (from Section 4 of your form)
            if (overview) overview.textContent = job.summary || "No overview provided.";
            
            // 3. Meta Info (Prefecture • Industry • Employment Type)
            if (metaInfo) {
                const pref = job.location?.prefecture || "N/A";
                const ind = job.industry || "N/A";
                const type = job.employmentType || "Full-time";
                metaInfo.textContent = `${pref} • ${ind} • ${type}`;
            }
            
            // 4. Conditions (Salary, Prefer Location, Support Visa)
           // dashboardLoader.js inside loadJobDetails
            if (condList) {
                let condHtml = "";
                if (job.compensation?.salaryMin) {
                    condHtml += `<li class="job-pill"><strong>Salary:</strong> ¥${job.compensation.salaryMin.toLocaleString()}</li>`;
                }
                // DIRECT ACCESS
                if (job.preferWorkLocation) {
                    condHtml += `<li class="job-pill"><strong>Prefer Location:</strong> ${job.preferWorkLocation}</li>`;
                }
                if (job.supportSponsorship) {
                    condHtml += `<li class="job-pill"><strong>Support:</strong> ${job.supportSponsorship}</li>`;
                }
                condList.innerHTML = condHtml;
            }

            if (reqList) {
                // DIRECT ACCESS
                reqList.innerHTML = `
                    <li class="job-pill"><strong>Japanese:</strong> ${job.japaneseLanguage || 'N/A'}</li>
                    <li class="job-pill"><strong>Native:</strong> ${job.nativeLanguage || 'N/A'}</li>
                `;
            }
            
            // 5. Position Details uses 'responsibilities'
            if (posDetails) {
                posDetails.textContent = job.responsibilities || "No specific details provided.";
            }

            // Store ID for later use (Save/Remove)
            const modalEl = document.getElementById('jobDetailModal');
            if (modalEl) modalEl.dataset.editingId = jobId;
            
        }
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

/**
 * Main initializer exported to main.js
 */
export async function initDashboard() {
    const tableBody = document.getElementById('job-list-body');
    if (!tableBody) return;

    try {
        const response = await fetch('http://localhost:3000/api/v1/admin-jobs');
        const result = await response.json();

        if (result.success) {
            renderManagementTable(result.data.jobs, tableBody);
        }
    } catch (err) {
        console.error("Dashboard Load Error:", err);
    }
}

/**
 * Renders table and attaches SECURE event listeners
 */
function renderManagementTable(jobs, container) {
    if (!container) return;
    
    container.innerHTML = jobs.map(job => `
        <tr>
            <td>
                <a href="javascript:void(0)" 
                   class="job-detail-link fw-bold text-decoration-none" 
                   data-bs-toggle="modal" 
                   data-bs-target="#jobDetailModal"
                   data-id="${job._id}">
                   ${job.title}
                </a>
                <small class="text-muted d-block">${job.industry}</small>
            </td>
            <td>${job.location.prefecture}</td>
            <td class="text-center">0</td>
            <td class="text-center"><span class="badge bg-success">${job.status}</span></td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-danger remove-job-btn" data-id="${job._id}" data-title="${job.title}">
                    Remove
                </button>
            </td>
        </tr>
    `).join('');

    // Event Delegation
    container.addEventListener('click', (e) => {
        const link = e.target.closest('.job-detail-link');
        if (link) {
            const jobId = link.getAttribute('data-id');
            loadJobDetails(jobId);
        }
    });
}