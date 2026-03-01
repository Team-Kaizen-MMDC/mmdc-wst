export function initJobPost() {
  const jobForm = document.getElementById('jobPostForm');
  if (!jobForm) return;

  jobForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(jobForm);
    const data = Object.fromEntries(formData.entries());

    // Mapping the HTML 'name' attributes to your Payload
    const payload = {
        title: data["job-title"],
        companyName: data["company-name"], 
        
        // --- QUICK TEST HACK START ---
        // Using valid 24-character hex IDs for testing
        company: "65db12345678901234567890", 
        postedBy: "65db12345678901234567890", 
        // --- QUICK TEST HACK END ---

        industry: data["job-category"], 
        summary: data["job-description"], //modal-department-overview -  name="job-description">
      

        // SENDS DIRECTLY (Matching flattened schema)
        preferWorkLocation: data["Prefer-location"],
        supportSponsorship: data["support-detail"],
        japaneseLanguage: data["japanese-language"],
        nativeLanguage: data["other-language"],

        location: {
            prefecture: data["prefecture"], 
            city: data["location-detail"] 
        },

        compensation: {
            // Note: Your HTML has one 'salary' input, not min/max.
            // Mapping 'salary' to both for now to avoid validation errors.
            salaryMin: Number(data["salary"]), 
            salaryMax: Number(data["salary"]), 
            currency: "JPY"
        },
        applicationInfo: {
            deadline: data["deadline"] ? new Date(data["deadline"]) : new Date(),
            startDate: new Date() // Defaulting to now for testing
        },
        status: "active"
    };

    try {
      const response = await fetch('http://localhost:3000/api/v1/admin-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Job posted successfully!");
        window.location.href = "/pages/companyDashboard.html";
      } else {
        alert(result.message || "Failed to post job");
      }

    } catch (err) {
      console.error("Error posting job:", err);
    }
  });
}