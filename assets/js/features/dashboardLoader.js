/**
 * dashboardLoader.js
 */
let isEditMode = false;
async function loadJobDetails(jobId) {
    console.log("Fetching job details for ID:", jobId);     

    const titleH1 = document.getElementById('job-title-h1');
    const companyDisplay = document.getElementById('modal-company-name-text');
    const overview = document.getElementById('modal-department-overview');
    const metaInfo = document.getElementById('modal-job-meta');
    const condList = document.getElementById('modal-conditions-list');
    const reqList = document.getElementById('modal-requirements-list');
    const editBtn = document.getElementById('modal-edit-toggle-btn');
    editBtn.onclick = null;
    editBtn.onclick = () => handleEditToggle(jobId);

    try {
        const response = await fetch(`http://localhost:3000/api/v1/admin-jobs/${jobId}`);
        const result = await response.json();

        if (result.success) {
            const job = result.data.job;

            // 1. Company Name to the top breadcrumb
            if (companyDisplay) companyDisplay.textContent = job.companyName || "Unknown";
            if (titleH1) titleH1.textContent = job.title;

            // 2. Overview uses 'summary' (from Section 4 of your form)
            if (overview) overview.textContent = job.summary || "No overview provided.";
            
            // 3. Meta Info (Prefecture • Industry • Employment Type)
            if (metaInfo) {
                const pref = job.location?.prefecture || "N/A";
                const ind = job.industry || "N/A";
                const type = job.employmentType || "Full-time";
                const year = job.createdAt ? new Date(job.createdAt).getFullYear() : "";
                metaInfo.textContent = `${pref} • ${ind} • ${type}`;
            }
            
            // 4. Conditions (Salary, Prefer Location, Support Visa)
           // dashboardLoader.js inside loadJobDetails
                    if (condList) {
                condList.innerHTML = `
                    <li class="job-pill">
                        <strong>Salary:</strong> ¥<span id="val-salary">${job.compensation?.salaryMin || "0"}</span>
                    </li>
                    <li class="job-pill">
                        <strong>Prefer Location:</strong>
                        <span id="val-prefer-loc">${job.preferWorkLocation || "N/A"}</span>
                    </li>
                    <li class="job-pill">
                        <strong>Support:</strong>
                        <span id="val-support">${job.supportSponsorship || "N/A"}</span>
                    </li>
                `;
            }

            if (reqList) {
                reqList.innerHTML = `
                    <li class="job-pill">
                        <strong>Japanese:</strong>
                        <span id="val-japanese">${job.japaneseLanguage || "N/A"}</span>
                    </li>
                    <li class="job-pill">
                        <strong>Native:</strong>
                        <span id="val-native">${job.nativeLanguage || "N/A"}</span>
                    </li>
                `;
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
            <td>${job.location?.prefecture || "N/A"}</td>
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


    function handleEditToggle(jobId) {
    const editBtn = document.getElementById('modal-edit-toggle-btn');
    
    if (!isEditMode) {
        isEditMode = true;
        editBtn.innerHTML = `<i class="fas fa-save me-2"></i> Save Changes`;
        editBtn.classList.replace('btn-primary', 'btn-success');

        // Capture current values
        const curTitle = document.getElementById('job-title-h1').innerText;
        const curOverview = document.getElementById('modal-department-overview').innerText;
        const curCompany = document.getElementById('modal-company-name-text').innerText;
        const salary = document.getElementById('val-salary').innerText; 
        const loc = document.getElementById('val-prefer-loc').innerText;
         const supp = document.getElementById('val-support').innerText; 
         const jap = document.getElementById('val-japanese').innerText; 
         const nat = document.getElementById('val-native').innerText;

        // 1. Convert Basics to Inputs (Crucial for Save function!)
        document.getElementById('modal-title-container').innerHTML = `<input type="text" id="edit-title" class="form-control mb-2" value="${curTitle}">`;
        document.getElementById('modal-overview-container').innerHTML = `<textarea id="edit-overview" class="form-control mb-2" rows="4">${curOverview}</textarea>`;
        document.getElementById('modal-company-name-container').innerHTML = `<input type="text" id="edit-company" class="form-control form-control-sm" value="${curCompany}">`;

        // 2. Convert Conditions
        document.getElementById('modal-conditions-list').innerHTML = `
            <li><strong>Salary:</strong> <input type="number" id="input-salary" class="form-control mb-1" value="${salary}"></li>
            <li><strong>Location:</strong> <input type="text" id="input-prefer-loc" class="form-control mb-1" value="${loc}"></li>
            <li><strong>Support:</strong> <input type="text" id="input-support" class="form-control mb-1" value="${supp}"></li>
        `;

        // 3. Convert Requirements (Removed the duplicate code that was breaking this)
        document.getElementById('modal-requirements-list').innerHTML = `
            <li><strong>Japanese:</strong> <input type="text" id="input-japanese" class="form-control mb-1" value="${jap}"></li>
            <li><strong>Native:</strong> <input type="text" id="input-native" class="form-control mb-1" value="${nat}"></li>
        `;
    } else {
        saveJobChanges(jobId);
    }
}


async function saveJobChanges(jobId) {

    const updatedData = {
        title: document.getElementById('edit-title').value,
        summary: document.getElementById('edit-overview').value,
        companyName: document.getElementById('edit-company').value,
        compensation: {
            salaryMin: Number(document.getElementById('input-salary').value),
            salaryMax: Number(document.getElementById('input-salary').value)
        },
        preferWorkLocation: document.getElementById('input-prefer-loc').value,
        supportSponsorship: document.getElementById('input-support').value,
        japaneseLanguage: document.getElementById('input-japanese').value,
        nativeLanguage: document.getElementById('input-native').value    
    };

    try {

        const response = await fetch(`http://localhost:3000/api/v1/admin-jobs/${jobId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {

            isEditMode = false;

             restoreModalView();
             
            // restore view layout
            await loadJobDetails(jobId); // reload fresh data first

            // reset button
            const editBtn = document.getElementById('modal-edit-toggle-btn');
            editBtn.innerHTML = `<i class="fas fa-edit me-2"></i> Edit`;
            editBtn.classList.remove('btn-success');
            editBtn.classList.add('btn-primary');

            initDashboard();

        }

    } catch (err) {
        console.error("Save Error:", err);
    }
}

function restoreModalView() {

    document.getElementById('modal-title-container').innerHTML =
        `<h1 id="job-title-h1" class="job-card__title display-6 mb-3"></h1>`;

    document.getElementById('modal-overview-container').innerHTML =
        `<p id="modal-department-overview"></p>`;

    document.getElementById('modal-company-name-container').innerHTML =
        `<span id="modal-company-name-text"></span>`;
}