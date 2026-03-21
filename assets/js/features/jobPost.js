export function initJobPost() {
  const jobForm = document.getElementById("jobPostForm");
  if (!jobForm) return;

  loadCompaniesForAdmin();

  jobForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(jobForm);
    const data = Object.fromEntries(formData.entries());

    if (!data["company"]) {
      alert("Please select a company.");
      return;
    }

    const payload = {
      company: data["company"],

      title: data["job-title"],
      industry: normalizeIndustry(data["job-category"]),
      category: data["job-category"],

      summary: data["job-description"],
      responsibilities: data["job-description"],
      requirements: buildRequirementsText(data),
      benefits: "",

      requiredEducation: "None",
      japaneseLevel: normalizeJapaneseLevel(data["japanese-language"]),
      requiredExperience: {
        years: 0,
        description: "",
      },
      requiredSkills: [],
      requiredCertifications: [],

      compensation: {
        salaryMin: Number(data["salary"] || 0),
        salaryMax: Number(data["salary"] || 0),
        currency: "JPY",
        period: "monthly",
        overtimePay: true,
      },

      location: {
        prefecture: data["prefecture"],
        city: data["location-detail"],
        address: "",
        remote: false,
        remoteType: "None",
      },

      workConditions: {
        workHours: "",
        daysOff: "",
        vacation: "",
        insurance: "",
        probationPeriod: "",
      },

      applicationInfo: {
        deadline: data["deadline"],
        startDate: data["deadline"],
        contactEmail: "",
        contactPhone: "",
        applicationUrl: "",
        applicationMethod: "Platform",
      },

      status: "active",
      visibility: "public",
      featured: false,
      urgent: false,
    };

    console.log("FORM DATA:", data);
console.log("PAYLOAD:", payload);

    try {
      const response = await fetch("http://localhost:3000/api/v1/admin-jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Job posted successfully!");
        window.location.href = "/pages/companyDashboard.html#job-pane";
      } else {
        console.error("POST JOB FAILED:", result);
        alert(result.message || "Failed to post job");
      }
      
    } catch (err) {
      console.error("Error posting job:", err);
      alert("Something went wrong while posting the job.");
    }
  });
}

async function loadCompaniesForAdmin() {
  try {
    const response = await fetch("http://localhost:3000/api/v1/companies?limit=100", {
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to load companies.");
    }

    const companies = result.data?.companies || [];
    const companySelect = document.getElementById("company");

    if (!companySelect) return;

    companySelect.innerHTML = `
      <option selected disabled value="">Select Company...</option>
    `;

    companies.forEach((company) => {
      const option = document.createElement("option");
      option.value = company._id;
      option.textContent = company.name;
      companySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading companies:", error);
    alert(error.message || "Unable to load companies.");
  }
}

function normalizeJapaneseLevel(value) {
  const map = {
    "Beginner / N5": "N5",
    "Basic / N4": "N4",
    "Conversational / N3": "N3",
    "Business / N2": "N2",
    "Fluent / N1": "N1",
    N5: "N5",
    N4: "N4",
    N3: "N3",
    N2: "N2",
    N1: "N1",
    None: "None",
  };

  return map[value] || "N4";
}

function normalizeIndustry(value) {
  const map = {
    Manufacturing: "Manufacturing",
    "Food Service": "Food Service",
    Caregiver: "Nursing Care",
    Construction: "Construction",
    Aviation: "Aviation",
  };

  return map[value] || "Other";
}

function buildRequirementsText(data) {
  const parts = [];

  if (data["Prefer-location"]) {
    parts.push(`Preferred work location: ${data["Prefer-location"]}`);
  }

  if (data["support-detail"]) {
    parts.push(`Support/Sponsorship: ${data["support-detail"]}`);
  }

  if (data["other-language"]) {
    parts.push(`Native language: ${data["other-language"]}`);
  }

  if (data["job-type"]) {
    parts.push(`Employment type: ${data["job-type"]}`);
  }

  return parts.join("; ");
}