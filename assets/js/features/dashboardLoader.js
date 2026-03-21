/**
 * dashboardLoader.js
 */
let isEditMode = false;

async function loadJobDetails(jobId) {

    const titleH1 = document.getElementById('job-title-h1');
    const companyDisplay = document.getElementById('modal-company-name-text');
    const overview = document.getElementById('modal-department-overview');
    const metaInfo = document.getElementById('modal-job-meta');
    const condList = document.getElementById('modal-conditions-list');
    const reqList = document.getElementById('modal-requirements-list');
    const editBtn = document.getElementById('modal-edit-toggle-btn');
    const removeBtn = document.getElementById('modal-remove-button');

    if (editBtn) {
        editBtn.onclick = null;
        editBtn.onclick = () => handleEditToggle(jobId);
    }

    if (removeBtn) {
        removeBtn.onclick = null;
        removeBtn.onclick = () => removeJob(jobId);
    }

    try {
        const response = await fetch(`http://localhost:3000/api/v1/admin-jobs/${jobId}`, {
            credentials: 'include',
            cache: 'no-store'
        });

        console.log("DETAIL RESPONSE STATUS:", response.status);

        const result = await response.json();
        console.log("DETAIL RESULT:", result);

        if (!result.success || !result.data?.job) {
            console.error("Job detail fetch failed or missing job data.");
            return;
        }

        const job = result.data.job;
        console.log("FULL JOB:", JSON.stringify(job, null, 2));

        const requirementsText = job.requirements || "";

        const type =
            requirementsText.match(/Employment type: ([^;]+)/i)?.[1]?.trim() ||
            job.employmentType ||
            "N/A";

        const prefer =
            requirementsText.match(/Preferred work location: ([^;]+)/i)?.[1]?.trim() ||
            job.preferWorkLocation ||
            "N/A";

        const support =
            requirementsText.match(/Support\/Sponsorship: ([^;]+)/i)?.[1]?.trim() ||
            job.supportSponsorship ||
            "N/A";

        const native =
            requirementsText.match(/Native language: ([^;]+)/i)?.[1]?.trim() ||
            job.nativeLanguage ||
            "N/A";

        const japanese =
            job.japaneseLevel ||
            job.japaneseLanguage ||
            "N/A";

        console.log("JOB ID:", job._id);
        console.log("REQ TEXT:", requirementsText);
        console.log("PARSED TYPE:", type);
        console.log("PARSED PREFER:", prefer);
        console.log("PARSED SUPPORT:", support);
        console.log("PARSED NATIVE:", native);

        if (companyDisplay) companyDisplay.textContent = job.company?.name || "Unknown";
        if (titleH1) titleH1.textContent = job.title || "Untitled Job";
        if (overview) overview.textContent = job.summary || "No overview provided.";

        if (metaInfo) {
            const pref = job.location?.prefecture || "N/A";
            const ind = job.industry || "N/A";
            metaInfo.textContent = `${pref} • ${ind} • ${type}`;
        }

        if (condList) {
            condList.innerHTML = `
                <li class="job-pill">
                    <strong>Salary:</strong> ¥<span id="val-salary">${job.compensation?.salaryMin || "0"}</span>
                </li>
                <li class="job-pill">
                    <strong>Prefer Location:</strong>
                    <span id="val-prefer-loc">${prefer}</span>
                </li>
                <li class="job-pill">
                    <strong>Support:</strong>
                    <span id="val-support">${support}</span>
                </li>
            `;
        }

        if (reqList) {
            reqList.innerHTML = `
                <li class="job-pill">
                    <strong>Japanese:</strong>
                    <span id="val-japanese">${japanese}</span>
                </li>
                <li class="job-pill">
                    <strong>Native:</strong>
                    <span id="val-native">${native}</span>
                </li>
            `;
        }

        const modalEl = document.getElementById('jobDetailModal');
        if (modalEl) modalEl.dataset.editingId = jobId;

    } catch (err) {
        console.error("Fetch Error:", err);
    }
}


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
                <small class="text-muted d-block">${job.industry || "N/A"}</small>
            </td>
            <td>${job.location?.prefecture || "N/A"}</td>
            <td class="text-center">0</td>
            <td class="text-center">
                <span class="badge bg-success">${job.status || "N/A"}</span>
            </td>
            <td class="text-center">
                <button
                    class="btn btn-sm btn-outline-danger remove-job-btn"
                    data-id="${job._id}"
                    data-title="${job.title}">
                    Remove
                </button>
            </td>
        </tr>
    `).join('');
}

export async function initDashboard() {
    const tableBody = document.getElementById('job-list-body');
    if (!tableBody) return;

    if (!tableBody.dataset.bound) {
        tableBody.addEventListener('click', (e) => {
            const link = e.target.closest('.job-detail-link');
            if (link) {
                loadJobDetails(link.getAttribute('data-id'));
            }

            const removeBtn = e.target.closest('.remove-job-btn');
            if (removeBtn) {
                removeJob(removeBtn.getAttribute('data-id'));
            }
        });
        tableBody.dataset.bound = 'true';
    }

    try {
        const response = await fetch('http://localhost:3000/api/v1/admin-jobs', {
            credentials: 'include',
            cache: 'no-store'
        });

        const result = await response.json();

        if (result.success) {
            renderManagementTable(result.data.jobs, tableBody);
        } else {
            console.error("Failed to load dashboard jobs:", result);
        }
    } catch (err) {
        console.error("Dashboard Load Error:", err);
    }
}

function handleEditToggle(jobId) {
    const editBtn = document.getElementById('modal-edit-toggle-btn');

    if (!isEditMode) {
        isEditMode = true;

        if (editBtn) {
            editBtn.innerHTML = `<i class="fas fa-save me-2"></i> Save Changes`;
            editBtn.classList.replace('btn-primary', 'btn-success');
        }

        const curTitle = document.getElementById('job-title-h1')?.innerText || "";
        const curOverview = document.getElementById('modal-department-overview')?.innerText || "";
        const curCompany = document.getElementById('modal-company-name-text')?.innerText || "";

        const salary = document.getElementById('val-salary')?.innerText || "0";
        const loc = document.getElementById('val-prefer-loc')?.innerText || "N/A";
        const supp = document.getElementById('val-support')?.innerText || "N/A";
        const jap = document.getElementById('val-japanese')?.innerText || "N/A";
        const nat = document.getElementById('val-native')?.innerText || "N/A";

        document.getElementById('modal-title-container').innerHTML =
            `<input type="text" id="edit-title" class="form-control mb-2" value="${escapeHtml(curTitle)}">`;

        document.getElementById('modal-overview-container').innerHTML =
            `<textarea id="edit-overview" class="form-control mb-2" rows="4">${escapeHtml(curOverview)}</textarea>`;

        document.getElementById('modal-company-name-container').innerHTML =
            `<span id="modal-company-name-text">${escapeHtml(curCompany)}</span>`;


        document.getElementById('modal-conditions-list').innerHTML = `
            <li><strong>Salary:</strong> <input type="number" id="input-salary" class="form-control mb-1" value="${escapeHtml(salary)}"></li>
            <li><strong>Location:</strong> <input type="text" id="input-prefer-loc" class="form-control mb-1" value="${escapeHtml(loc)}"></li>
            <li><strong>Support:</strong> <input type="text" id="input-support" class="form-control mb-1" value="${escapeHtml(supp)}"></li>
        `;


        document.getElementById('modal-requirements-list').innerHTML = `
            <li><strong>Japanese:</strong> <input type="text" id="input-japanese" class="form-control mb-1" value="${escapeHtml(jap)}"></li>
            <li><strong>Native:</strong> <input type="text" id="input-native" class="form-control mb-1" value="${escapeHtml(nat)}"></li>
        `;
    } else {
        saveJobChanges(jobId);
    }
}


async function saveJobChanges(jobId) {
    const title = document.getElementById('edit-title')?.value.trim() || "";
    const summary = document.getElementById('edit-overview')?.value.trim() || "";
    const salary = Number(document.getElementById('input-salary')?.value || 0);
    const preferLoc = document.getElementById('input-prefer-loc')?.value.trim() || "N/A";
    const support = document.getElementById('input-support')?.value.trim() || "N/A";
    const japanese = document.getElementById('input-japanese')?.value.trim() || "N/A";
    const native = document.getElementById('input-native')?.value.trim() || "N/A";

    const updatedData = {
        title,
        summary,
        responsibilities: summary,
        compensation: {
            salaryMin: salary,
            salaryMax: salary
        },
        japaneseLevel: japanese,
        requirements: `Preferred work location: ${preferLoc}; Support/Sponsorship: ${support}; Native language: ${native}; Employment type: Full-time`
    };

    try {

        const response = await fetch(`http://localhost:3000/api/v1/admin-jobs/${jobId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updatedData)
        });

        const result = await response.json();

        if (response.ok) {
            wwwwwwweewwwewwww
            isEditMode = false;

            restoreModalView();
            await loadJobDetails(jobId);

            const editBtn = document.getElementById('modal-edit-toggle-btn');
            if (editBtn) {
                editBtn.innerHTML = `<i class="fas fa-edit me-2"></i> Edit`;
                editBtn.classList.remove('btn-success');
                editBtn.classList.add('btn-primary');
            }

            initDashboard();
        } else {
            console.error("PATCH FAILED:", result);
            alert(result.message || "Failed to save changes.");
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

async function removeJob(jobId) {

    const confirmDelete = confirm("Are you sure you want to delete this job?");

    if (!confirmDelete) return;

    try {

        const response = await fetch(`http://localhost:3000/api/v1/admin-jobs/${jobId}`, {
            method: "DELETE",
            credentials: 'include'
        });

        if (response.ok) {

            alert("Job removed successfully");
            
            initDashboard();


            const modal = bootstrap.Modal.getInstance(document.getElementById('jobDetailModal'));
            if (modal) modal.hide();

        }
        
    } catch (err) {
        console.error("Delete Error:", err);
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}