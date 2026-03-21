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
    if (!payload.company) {
      alert('Company ID missing. Set the hidden company-id field to your Company ObjectId.');
      return;
    }
    if (!token && !document.cookie.includes('token=')) {
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