export function initJobPost() {
  const jobForm = document.getElementById('jobPostForm');
  if (!jobForm) return;

  const API_BASE = window.location.port === '8000' ? 'http://localhost:3000/api/v1' : '/api/v1';

  function getToken() {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) return urlToken;
    const match = document.cookie.split('; ').find(r => r.startsWith('token='));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
  }

  jobForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(jobForm);
    const data = Object.fromEntries(formData.entries());

    // Build payload aligned with backend Job model
    const salary = Number(data['salary']) || 0;
    const deadline = data['deadline'] || null;
    let startDate = null;
    if (deadline) {
      const d = new Date(deadline);
      d.setDate(d.getDate() + 7);
      startDate = d.toISOString();
    }

    const description = data['job-description'] || '';
    const summary = description ? description.slice(0, 200) : (data['job-title'] || '');

    const payload = {
      company: data['company-id'] || null,
      title: data['job-title'] || '',
      industry: data['job-category'] || 'Other',
      category: data['job-category'] || '',
      summary: summary,
      responsibilities: description,
      japaneseLevel: data['japanese-language'] || 'None',
      compensation: {
        salaryMin: salary,
        salaryMax: salary,
        currency: 'JPY',
        period: 'monthly'
      },
      location: {
        prefecture: data['prefecture'] || '',
        city: data['location-detail'] || ''
      },
      applicationInfo: {
        deadline: deadline ? new Date(deadline).toISOString() : null,
        startDate: startDate,
        applicationMethod: 'Platform'
      },
      status: 'active',
      visibility: 'public'
    };

    // Basic preflight checks
    const token = getToken();
    // allow session cookie auth (Passport) or JWT token
    const hasSession = document.cookie.includes('sessionid') || document.cookie.includes('demo.sid') || document.cookie.includes('isLoggedIn=') || document.cookie.includes('jssw.sid');

    // If company id missing, attempt to create company (admins) using company name from form
    if (!payload.company) {
      const companyName = data['company-name'] || data['company'] || '';
      if (!companyName) {
        alert('Company ID and company name missing. Please provide a company name or set the hidden company-id.');
        return;
      }

      try {
        const createHeaders = { 'Content-Type': 'application/json' };
        if (token) createHeaders.Authorization = `Bearer ${token}`;

        const createResp = await fetch(`${API_BASE}/companies`, {
          method: 'POST',
          headers: createHeaders,
          credentials: 'include',
          body: JSON.stringify({ name: companyName, industry: payload.industry })
        });
        const createResult = await createResp.json().catch(() => null);
        if (createResp.ok && (createResult?.data?.company || createResult?.data)) {
          const companyObj = createResult.data.company || createResult.data;
          payload.company = companyObj._id || companyObj.id || companyObj;
        } else {
          alert(createResult?.message || 'Failed to create company for job.');
          return;
        }
      } catch (err) {
        console.error('Error creating company:', err);
        alert('Network error while creating company.');
        return;
      }
    }

    if (!token && !hasSession) {
      alert('Authentication required. Please sign in.');
      return;
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (response.ok) {
        alert('Job posted successfully!');
        window.location.href = '/pages/companyDashboard.html#job-pane';
      } else {
        alert(result?.message || 'Failed to post job');
      }
    } catch (err) {
      console.error('Error posting job:', err);
      alert('Network error while posting the job.');
    }
  });
}