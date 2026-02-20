# Frontend Integration Guide — Japan SSW Platform

**Version:** 1.0  
**Last Updated:** January 29, 2026  
**Target:** Frontend developers integrating with REST API backend

---

## 📚 Table of Contents

1. [Configuration](#configuration)
2. [Authentication Setup](#authentication-setup)
3. [API Client Setup](#api-client-setup)
4. [Page-by-Page Integration](#page-by-page-integration)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)

---

## Configuration

### API Base URL

Add to your frontend configuration (e.g., `assets/js/config.js`):

```javascript
// config.js
const API_CONFIG = {
  // Local development
  BASE_URL: "http://localhost:5000/api/v1",

  // Production (update after deployment)
  // BASE_URL: 'https://your-api-domain.com/api/v1',

  TIMEOUT: 10000, // 10 seconds
};

export default API_CONFIG;
```

### Environment Detection

```javascript
// Automatically detect environment
const API_CONFIG = {
  BASE_URL:
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api/v1"
      : "https://your-api-domain.com/api/v1",
  TIMEOUT: 10000,
};
```

---

## Authentication Setup

### JWT Token Storage Options

**Option 1: localStorage (Simple, Less Secure)**

```javascript
// auth.js
class AuthService {
  // Save token after login/register
  saveToken(token) {
    localStorage.setItem("jwt_token", token);
  }

  // Get token for API requests
  getToken() {
    return localStorage.getItem("jwt_token");
  }

  // Remove token on logout
  removeToken() {
    localStorage.removeItem("jwt_token");
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }
}

const authService = new AuthService();
export default authService;
```

**Option 2: sessionStorage (More Secure, Session-Only)**

```javascript
// Replace localStorage with sessionStorage
saveToken(token) {
  sessionStorage.setItem('jwt_token', token);
}

getToken() {
  return sessionStorage.getItem('jwt_token');
}

removeToken() {
  sessionStorage.removeItem('jwt_token');
}
```

**Option 3: HttpOnly Cookies (Most Secure - Requires Backend Change)**

_Note: Would require backend to send JWT in httpOnly cookie instead of response body_

### User Data Storage

```javascript
class AuthService {
  // Save user info after login
  saveUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  // Get current user
  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  // Get user role
  getUserRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }

  // Check if user is jobseeker
  isJobseeker() {
    return this.getUserRole() === "jobseeker";
  }

  // Check if user is employer
  isEmployer() {
    return this.getUserRole() === "employer";
  }

  // Clear all auth data
  logout() {
    this.removeToken();
    localStorage.removeItem("user");
  }
}

### Sign in with Google (Frontend)

Add a "Sign in with Google" button that navigates the user to the backend OAuth start endpoint (for example: `/api/v1/auth/google`). The backend should redirect to Google's consent page and ultimately back to your configured callback which issues the application JWT.

Frontend notes:

- Button action: `window.location = '/api/v1/auth/google'` (or open in a popup if you prefer a popup flow).
- After successful OAuth, the backend can either redirect to the frontend with a temporary token in the query string or set an HttpOnly cookie with the JWT — coordinate with backend implementation.
- Example: if backend redirects to `/pages/signin.html?token=<jwt>`, the frontend should read `token` from `location.search`, store it (e.g., `localStorage`), and then call `GET /api/v1/auth/me` to fetch user info.

Testing & redirect URIs:

- Ensure the Google OAuth redirect URI used by the backend is registered in Google Cloud Console. For local development use `http://localhost:3000/api/v1/auth/google/callback` or an agreed frontend landing page that receives the token.
- If using a popup, implement postMessage communication to send the JWT back to the opener window securely.
```

---

## API Client Setup

### Base API Client

Create `assets/js/apiClient.js`:

```javascript
import API_CONFIG from "./config.js";
import authService from "./auth.js";

class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Build headers with JWT token
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    const token = authService.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic request handler
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse JSON response
      const data = await response.json();

      // Handle error responses
      if (!response.ok) {
        throw new ApiError(
          data.error || "Request failed",
          response.status,
          data,
        );
      }

      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new ApiError("Request timeout", 408);
      }
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: "GET" });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

// Custom API Error class
class ApiError extends Error {
  constructor(message, statusCode, data = {}) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

const apiClient = new ApiClient();
export default apiClient;
export { ApiError };
```

---

## Page-by-Page Integration

### 1. Authentication Pages

#### **createAccount.html** — User Registration (Jobseeker)

**API Endpoint:** `POST /auth/register`

```javascript
// In createAccount.html or assets/js/register.js
import apiClient from "./apiClient.js";
import authService from "./auth.js";

async function handleRegister(event) {
  event.preventDefault();

  const formData = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    role: "jobseeker", // Fixed for jobseeker registration
  };

  try {
    // Show loading state
    showLoading();

    const response = await apiClient.post("/auth/register", formData);

    // Save token and user data
    authService.saveToken(response.data.token);
    authService.saveUser(response.data.user);

    // Redirect to profile setup
    window.location.href = "/pages/addEdit/contact.html";
  } catch (error) {
    hideLoading();

    if (error.statusCode === 400) {
      showError("Email already exists or invalid data");
    } else if (error.statusCode === 422) {
      showError(
        "Password must be 8+ characters with uppercase, lowercase, number, and special character",
      );
    } else {
      showError("Registration failed. Please try again.");
    }
  }
}

// Attach to form
document
  .getElementById("registerForm")
  .addEventListener("submit", handleRegister);
```

#### **signin.html** — User Login (Jobseeker)

**API Endpoint:** `POST /auth/login`

```javascript
// In signin.html or assets/js/login.js
import apiClient from "./apiClient.js";
import authService from "./auth.js";

async function handleLogin(event) {
  event.preventDefault();

  const credentials = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };

  try {
    showLoading();

    const response = await apiClient.post("/auth/login", credentials);

    // Save authentication data
    authService.saveToken(response.data.token);
    authService.saveUser(response.data.user);

    // Redirect based on role
    if (response.data.user.role === "jobseeker") {
      window.location.href = "/pages/profileDashboard.html";
    } else if (response.data.user.role === "employer") {
      window.location.href = "/pages/companyDashboard.html";
    }
  } catch (error) {
    hideLoading();

    if (error.statusCode === 401) {
      showError("Invalid email or password");
    } else if (error.statusCode === 403) {
      showError("Account is inactive. Please contact support.");
    } else {
      showError("Login failed. Please try again.");
    }
  }
}

document.getElementById("loginForm").addEventListener("submit", handleLogin);
```

#### **employerCreateAccount.html** — Employer Registration

**API Endpoint:** `POST /auth/register`

```javascript
// Similar to jobseeker registration, but with role: 'employer'
const formData = {
  email: document.getElementById("email").value,
  password: document.getElementById("password").value,
  role: "employer", // Employer role
};

// After successful registration, redirect to company creation
const response = await apiClient.post("/auth/register", formData);
authService.saveToken(response.data.token);
authService.saveUser(response.data.user);
window.location.href = "/pages/companyDashboard.html"; // Or company creation page
```

#### **employerSignin.html** — Employer Login

**API Endpoint:** `POST /auth/login`

```javascript
// Same as jobseeker login, but redirect to company dashboard
const response = await apiClient.post("/auth/login", credentials);
authService.saveToken(response.data.token);
authService.saveUser(response.data.user);
window.location.href = "/pages/companyDashboard.html";
```

### Logout Functionality

Add to all authenticated pages:

```javascript
// assets/js/logout.js
import apiClient from "./apiClient.js";
import authService from "./auth.js";

async function handleLogout() {
  try {
    // Call logout endpoint (optional, clears server-side session if implemented)
    await apiClient.post("/auth/logout");
  } catch (error) {
    // Continue with client-side logout even if API fails
    console.error("Logout API call failed:", error);
  } finally {
    // Clear client-side authentication
    authService.logout();
    window.location.href = "/pages/signin.html";
  }
}

// Attach to logout button
document.getElementById("logoutBtn")?.addEventListener("click", handleLogout);
```

---

### 2. Profile Dashboard

#### **profileDashboard.html** — Jobseeker Dashboard

**API Endpoints:**

- `GET /auth/me` - Get current user
- `GET /profile` - Get user profile
- `GET /applications/my-applications` - Get user's applications

```javascript
// In profileDashboard.html or assets/js/profileDashboard.js
import apiClient from "./apiClient.js";
import authService from "./auth.js";

async function loadDashboard() {
  try {
    // Check authentication
    if (!authService.isAuthenticated()) {
      window.location.href = "/pages/signin.html";
      return;
    }

    showLoading();

    // Load user data
    const userResponse = await apiClient.get("/auth/me");
    const user = userResponse.data;

    // Load profile
    const profileResponse = await apiClient.get("/profile");
    const profile = profileResponse.data;

    // Load applications
    const applicationsResponse = await apiClient.get(
      "/applications/my-applications",
    );
    const applications = applicationsResponse.data;

    // Render dashboard
    renderUserInfo(user);
    renderProfile(profile);
    renderApplications(applications);

    hideLoading();
  } catch (error) {
    hideLoading();

    if (error.statusCode === 401) {
      // Token expired, redirect to login
      authService.logout();
      window.location.href = "/pages/signin.html";
    } else if (error.statusCode === 404) {
      // No profile yet, prompt to create
      showMessage("Please complete your profile to start applying for jobs");
      window.location.href = "/pages/addEdit/contact.html";
    } else {
      showError("Failed to load dashboard. Please refresh.");
    }
  }
}

function renderProfile(profile) {
  // Display profile information
  document.getElementById("userName").textContent =
    `${profile.firstName} ${profile.lastName}`;
  document.getElementById("userEmail").textContent = profile.user?.email;
  document.getElementById("userPhone").textContent = profile.phone;
  document.getElementById("userLocation").textContent =
    `${profile.city}, ${profile.prefecture}`;
  document.getElementById("japaneseLevel").textContent = profile.japaneseLevel;

  // Render education
  renderEducationList(profile.education);

  // Render experience
  renderExperienceList(profile.experience);

  // Render skills
  renderSkillsList(profile.skills);
}

function renderApplications(applications) {
  const container = document.getElementById("applicationsContainer");

  if (applications.length === 0) {
    container.innerHTML =
      '<p>No applications yet. <a href="/pages/jobs/">Browse Jobs</a></p>';
    return;
  }

  container.innerHTML = applications
    .map(
      (app) => `
    <div class="application-card" data-status="${app.status}">
      <h3>${app.job.title}</h3>
      <p class="company">${app.job.company.name}</p>
      <p class="location">${app.job.location.prefecture}, ${app.job.location.city}</p>
      <p class="applied-date">Applied: ${formatDate(app.appliedAt)}</p>
      <span class="status-badge ${app.status}">${formatStatus(app.status)}</span>
      <a href="/pages/jobs/jobDetails.html?id=${app.job._id}" class="view-job-btn">View Job</a>
    </div>
  `,
    )
    .join("");
}

// Load dashboard on page load
document.addEventListener("DOMContentLoaded", loadDashboard);

### Profile Resume (upload / view / delete)

- Endpoints:
  - `POST /api/v1/profile/resume` — multipart form upload; field name: `resume`. Protected endpoint, requires auth token.
  - `GET /api/v1/profile/resume` — returns JSON with a presigned GET URL when a resume exists for the profile.
  - `DELETE /api/v1/profile/resume` — deletes the stored resume from S3 and clears the profile field.

- Frontend behavior and notes:
  - After uploading, the backend saves the S3 object key in `profile.resumePath`. The dashboard requests the presigned URL on page load when `profile.resumePath` exists and shows a `View Resume` link.
  - Use the auth helper `getAuthToken()` (preferred) and fall back to `getCookie('token')` only if necessary — some pages were updated to prefer `getAuthToken()` to avoid ReferenceErrors in modular contexts.
  - See [backend/S3_RESUME_UPLOAD_GUIDE.md](backend/S3_RESUME_UPLOAD_GUIDE.md) for example upload flow and sample client code.
```

---

### 3. Profile Edit Pages (7 pages)

#### **pages/addEdit/contact.html** — Basic Profile Info

**API Endpoints:**

- `POST /profile` - Create profile (if doesn't exist)
- `PUT /profile` - Update profile

```javascript
// In contact.html or assets/js/editContact.js
import apiClient from "./apiClient.js";

async function loadContactInfo() {
  try {
    const response = await apiClient.get("/profile");
    const profile = response.data;

    // Populate form fields
    document.getElementById("firstName").value = profile.firstName || "";
    document.getElementById("lastName").value = profile.lastName || "";
    document.getElementById("dateOfBirth").value =
      profile.dateOfBirth?.split("T")[0] || "";
    document.getElementById("gender").value = profile.gender || "";
    document.getElementById("nationality").value = profile.nationality || "";
    document.getElementById("phone").value = profile.phone || "";
    document.getElementById("address").value = profile.address || "";
    document.getElementById("prefecture").value = profile.prefecture || "";
    document.getElementById("city").value = profile.city || "";
    document.getElementById("postalCode").value = profile.postalCode || "";
    document.getElementById("japaneseLevel").value =
      profile.japaneseLevel || "";
  } catch (error) {
    if (error.statusCode === 404) {
      // Profile doesn't exist yet, keep form empty for creation
      console.log("No profile found, ready to create new profile");
    } else {
      showError("Failed to load profile data");
    }
  }
}

async function handleContactSubmit(event) {
  event.preventDefault();

  const formData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    dateOfBirth: document.getElementById("dateOfBirth").value,
    gender: document.getElementById("gender").value,
    nationality: document.getElementById("nationality").value,
    phone: document.getElementById("phone").value,
    address: document.getElementById("address").value,
    prefecture: document.getElementById("prefecture").value,
    city: document.getElementById("city").value,
    postalCode: document.getElementById("postalCode").value,
    japaneseLevel: document.getElementById("japaneseLevel").value,
  };

  try {
    showLoading();

    // Try to update first
    let response;
    try {
      response = await apiClient.put("/profile", formData);
    } catch (error) {
      if (error.statusCode === 404) {
        // Profile doesn't exist, create new
        response = await apiClient.post("/profile", formData);
      } else {
        throw error;
      }
    }

    hideLoading();
    showSuccess("Profile updated successfully!");

    // Redirect to next step or dashboard
    setTimeout(() => {
      window.location.href = "/pages/addEdit/education.html";
    }, 1500);
  } catch (error) {
    hideLoading();
    showError("Failed to save profile. Please check your inputs.");
  }
}

document.addEventListener("DOMContentLoaded", loadContactInfo);
document
  .getElementById("contactForm")
  .addEventListener("submit", handleContactSubmit);
```

#### **pages/addEdit/education.html** — Education Management

**API Endpoints:**

- `GET /profile` - Get profile with education
- `POST /profile/education` - Add education
- `PUT /profile/education/:id` - Update education
- `DELETE /profile/education/:id` - Delete education

```javascript
// In education.html or assets/js/editEducation.js
import apiClient from "./apiClient.js";

let currentEducationId = null; // For edit mode

async function loadEducation() {
  try {
    const response = await apiClient.get("/profile");
    const profile = response.data;

    renderEducationList(profile.education || []);
  } catch (error) {
    showError("Failed to load education data");
  }
}

function renderEducationList(educationArray) {
  const container = document.getElementById("educationList");

  if (educationArray.length === 0) {
    container.innerHTML = "<p>No education entries yet. Add one below.</p>";
    return;
  }

  container.innerHTML = educationArray
    .map(
      (edu) => `
    <div class="education-item" data-id="${edu._id}">
      <h3>${edu.school}</h3>
      <p>${edu.degree} in ${edu.field}</p>
      <p>${formatDate(edu.startDate)} - ${edu.current ? "Present" : formatDate(edu.endDate)}</p>
      <button onclick="editEducation('${edu._id}')" class="btn-edit">Edit</button>
      <button onclick="deleteEducation('${edu._id}')" class="btn-delete">Delete</button>
    </div>
  `,
    )
    .join("");
}

async function handleEducationSubmit(event) {
  event.preventDefault();

  const formData = {
    school: document.getElementById("school").value,
    degree: document.getElementById("degree").value,
    field: document.getElementById("field").value,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    current: document.getElementById("current").checked,
  };

  try {
    showLoading();

    if (currentEducationId) {
      // Update existing education
      await apiClient.put(`/profile/education/${currentEducationId}`, formData);
      showSuccess("Education updated successfully!");
    } else {
      // Add new education
      await apiClient.post("/profile/education", formData);
      showSuccess("Education added successfully!");
    }

    // Reload education list
    await loadEducation();

    // Reset form
    document.getElementById("educationForm").reset();
    currentEducationId = null;

    hideLoading();
  } catch (error) {
    hideLoading();
    showError("Failed to save education entry");
  }
}

async function deleteEducation(educationId) {
  if (!confirm("Are you sure you want to delete this education entry?")) {
    return;
  }

  try {
    showLoading();
    await apiClient.delete(`/profile/education/${educationId}`);
    showSuccess("Education deleted successfully!");
    await loadEducation();
    hideLoading();
  } catch (error) {
    hideLoading();
    showError("Failed to delete education entry");
  }
}

// Make functions globally accessible for onclick handlers
window.editEducation = async function (educationId) {
  const response = await apiClient.get("/profile");
  const education = response.data.education.find((e) => e._id === educationId);

  if (education) {
    currentEducationId = educationId;
    document.getElementById("school").value = education.school;
    document.getElementById("degree").value = education.degree;
    document.getElementById("field").value = education.field;
    document.getElementById("startDate").value =
      education.startDate.split("T")[0];
    document.getElementById("endDate").value =
      education.endDate?.split("T")[0] || "";
    document.getElementById("current").checked = education.current;
  }
};

window.deleteEducation = deleteEducation;

document.addEventListener("DOMContentLoaded", loadEducation);
document
  .getElementById("educationForm")
  .addEventListener("submit", handleEducationSubmit);
```

#### **pages/addEdit/experience.html** — Work Experience

**API Endpoints:**

- `GET /profile` - Get profile with experience
- `POST /profile/experience` - Add experience
- `PUT /profile/experience/:id` - Update experience
- `DELETE /profile/experience/:id` - Delete experience

```javascript
// Similar to education.html, but with experience fields:
// company, title, description, startDate, endDate, current
const formData = {
  company: document.getElementById("company").value,
  title: document.getElementById("title").value,
  description: document.getElementById("description").value,
  startDate: document.getElementById("startDate").value,
  endDate: document.getElementById("endDate").value,
  current: document.getElementById("current").checked,
};

// POST /profile/experience or PUT /profile/experience/:id
```

#### **pages/addEdit/skill.html** — Skills Management

**API Endpoint:** `PUT /profile/skills` (replaces entire skills array)

```javascript
// In skill.html or assets/js/editSkills.js
import apiClient from "./apiClient.js";

let skillsArray = [];

async function loadSkills() {
  try {
    const response = await apiClient.get("/profile");
    skillsArray = response.data.skills || [];
    renderSkillsList();
  } catch (error) {
    showError("Failed to load skills");
  }
}

function renderSkillsList() {
  const container = document.getElementById("skillsList");

  container.innerHTML = skillsArray
    .map(
      (skill, index) => `
    <div class="skill-item">
      <span>${skill.name} - ${skill.level} (${skill.category})</span>
      <button onclick="removeSkill(${index})" class="btn-remove">Remove</button>
    </div>
  `,
    )
    .join("");
}

function addSkill() {
  const newSkill = {
    name: document.getElementById("skillName").value,
    level: document.getElementById("skillLevel").value,
    category: document.getElementById("skillCategory").value,
  };

  if (!newSkill.name || !newSkill.level || !newSkill.category) {
    showError("Please fill all skill fields");
    return;
  }

  skillsArray.push(newSkill);
  renderSkillsList();

  // Clear form
  document.getElementById("skillName").value = "";
  document.getElementById("skillLevel").value = "";
  document.getElementById("skillCategory").value = "";
}

function removeSkill(index) {
  skillsArray.splice(index, 1);
  renderSkillsList();
}

async function saveSkills() {
  try {
    showLoading();
    await apiClient.put("/profile/skills", { skills: skillsArray });
    showSuccess("Skills updated successfully!");
    hideLoading();
  } catch (error) {
    hideLoading();
    showError("Failed to save skills");
  }
}

window.removeSkill = removeSkill;

document.addEventListener("DOMContentLoaded", loadSkills);
document.getElementById("addSkillBtn").addEventListener("click", addSkill);
document.getElementById("saveSkillsBtn").addEventListener("click", saveSkills);
```

#### **pages/addEdit/availability.html** — Availability Info

**API Endpoint:** `PUT /profile/availability`

```javascript
// In availability.html
const formData = {
  availability: {
    startDate: document.getElementById("startDate").value,
    relocate: document.getElementById("relocate").checked,
    preferredLocations: getSelectedLocations(), // Array of selected prefectures
  },
};

await apiClient.put("/profile/availability", formData);
```

#### **pages/addEdit/profile.html** — Bio/Summary

**API Endpoint:** `PUT /profile`

```javascript
// Update profile bio
const formData = {
  bio: document.getElementById("bio").value,
};

await apiClient.put("/profile", formData);
```

---

### 4. Job Pages

#### **pages/jobs/** (All Job Listing Pages) — Job Search & Filter

**API Endpoint:** `GET /jobs` (with query parameters)

```javascript
// In jobs/jobFilter.html or assets/js/jobSearch.js
import apiClient from "./apiClient.js";

async function searchJobs(filters = {}) {
  try {
    showLoading();

    // Build query parameters
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 10,
    };

    if (filters.industry) params.industry = filters.industry;
    if (filters.prefecture) params.prefecture = filters.prefecture;
    if (filters.japaneseLevel) params.japaneseLevel = filters.japaneseLevel;
    if (filters.minSalary) params.minSalary = filters.minSalary;
    if (filters.maxSalary) params.maxSalary = filters.maxSalary;
    if (filters.search) params.search = filters.search;

    const response = await apiClient.get("/jobs", params);

    renderJobList(response.data.jobs);
    renderPagination(response.data.pagination);

    hideLoading();
  } catch (error) {
    hideLoading();
    showError("Failed to load jobs");
  }
}

function renderJobList(jobs) {
  const container = document.getElementById("jobsContainer");

  if (jobs.length === 0) {
    container.innerHTML = "<p>No jobs found matching your criteria.</p>";
    return;
  }

  container.innerHTML = jobs
    .map(
      (job) => `
    <div class="job-card" data-id="${job._id}">
      <h3>${job.title}</h3>
      <p class="company">${job.company.name}</p>
      <p class="location">${job.location.prefecture}, ${job.location.city}</p>
      <p class="salary">¥${job.compensation.salaryMin.toLocaleString()} - ¥${job.compensation.salaryMax.toLocaleString()}/month</p>
      <p class="japanese-level">Japanese Level: ${job.japaneseLevel}</p>
      <a href="/pages/jobs/jobDetails.html?id=${job._id}" class="view-details-btn">View Details</a>
    </div>
  `,
    )
    .join("");
}

// Handle filter form submission
document.getElementById("filterForm")?.addEventListener("submit", (event) => {
  event.preventDefault();

  const filters = {
    industry: document.getElementById("industry").value,
    prefecture: document.getElementById("prefecture").value,
    japaneseLevel: document.getElementById("japaneseLevel").value,
    minSalary: document.getElementById("minSalary").value,
    search: document.getElementById("search").value,
  };

  searchJobs(filters);
});

// Load jobs on page load
document.addEventListener("DOMContentLoaded", () => searchJobs());
```

#### **pages/jobs/jobDetails.html** — Single Job View & Apply

**API Endpoints:**

- `GET /jobs/:id` - Get job details
- `POST /applications` - Apply to job

```javascript
// In jobDetails.html or assets/js/jobDetails.js
import apiClient from "./apiClient.js";
import authService from "./auth.js";

let currentJobId = null;

async function loadJobDetails() {
  // Get job ID from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  currentJobId = urlParams.get("id");

  if (!currentJobId) {
    showError("Job not found");
    return;
  }

  try {
    showLoading();

    const response = await apiClient.get(`/jobs/${currentJobId}`);
    const job = response.data;

    renderJobDetails(job);

    // Check if user can apply
    if (authService.isJobseeker()) {
      showApplyButton();
    }

    hideLoading();
  } catch (error) {
    hideLoading();

    if (error.statusCode === 404) {
      showError("Job not found");
    } else {
      showError("Failed to load job details");
    }
  }
}

function renderJobDetails(job) {
  document.getElementById("jobTitle").textContent = job.title;
  document.getElementById("companyName").textContent = job.company.name;
  document.getElementById("location").textContent =
    `${job.location.city}, ${job.location.prefecture}`;
  document.getElementById("salary").textContent =
    `¥${job.compensation.salaryMin.toLocaleString()} - ¥${job.compensation.salaryMax.toLocaleString()}/month`;
  document.getElementById("japaneseLevel").textContent = job.japaneseLevel;
  document.getElementById("industry").textContent = job.industry;

  document.getElementById("summary").textContent = job.summary;
  document.getElementById("responsibilities").textContent =
    job.responsibilities;
  document.getElementById("requirements").textContent = job.requirements;
  document.getElementById("benefits").textContent = job.benefits;

  document.getElementById("workHours").textContent =
    job.workConditions.workHours;
  document.getElementById("daysOff").textContent = job.workConditions.daysOff;
  document.getElementById("vacation").textContent = job.workConditions.vacation;

  document.getElementById("deadline").textContent = formatDate(
    job.applicationInfo.deadline,
  );
  document.getElementById("startDate").textContent = formatDate(
    job.applicationInfo.startDate,
  );
}

async function handleApply() {
  if (!authService.isAuthenticated()) {
    showError("Please login to apply");
    window.location.href = "/pages/signin.html";
    return;
  }

  if (!authService.isJobseeker()) {
    showError("Only jobseekers can apply to jobs");
    return;
  }

  const coverLetter = document.getElementById("coverLetter")?.value || "";

  try {
    showLoading();

    await apiClient.post("/applications", {
      job: currentJobId,
      coverLetter: coverLetter,
    });

    hideLoading();
    showSuccess("Application submitted successfully!");

    // Disable apply button
    document.getElementById("applyBtn").disabled = true;
    document.getElementById("applyBtn").textContent = "Applied";

    // Optionally redirect to dashboard
    setTimeout(() => {
      window.location.href = "/pages/profileDashboard.html";
    }, 2000);
  } catch (error) {
    hideLoading();

    if (error.statusCode === 400) {
      showError("You have already applied to this job");
    } else if (error.statusCode === 404) {
      showError("Please complete your profile before applying");
      window.location.href = "/pages/addEdit/contact.html";
    } else {
      showError("Failed to submit application");
    }
  }
}

document.addEventListener("DOMContentLoaded", loadJobDetails);
document.getElementById("applyBtn")?.addEventListener("click", handleApply);
```

---

### 5. Company Dashboard (Employer)

#### **pages/companyDashboard.html** — Employer Dashboard

**API Endpoints:**

- `GET /auth/me` - Get current employer
- `GET /companies` - Get employer's company (filter by owner)
- `GET /jobs/my-jobs` - Get employer's posted jobs
- `GET /applications/job/:jobId` - Get applications for each job

```javascript
// In companyDashboard.html or assets/js/companyDashboard.js
import apiClient from "./apiClient.js";
import authService from "./auth.js";

async function loadEmployerDashboard() {
  if (!authService.isEmployer()) {
    window.location.href = "/pages/employerSignin.html";
    return;
  }

  try {
    showLoading();

    // Load employer's jobs
    const jobsResponse = await apiClient.get("/jobs/my-jobs");
    const jobs = jobsResponse.data;

    renderJobsList(jobs);

    // Load applications for each job
    for (const job of jobs) {
      const appsResponse = await apiClient.get(`/applications/job/${job._id}`);
      renderJobApplications(job._id, appsResponse.data);
    }

    hideLoading();
  } catch (error) {
    hideLoading();
    showError("Failed to load dashboard");
  }
}

function renderJobsList(jobs) {
  const container = document.getElementById("myJobsContainer");

  container.innerHTML = jobs
    .map(
      (job) => `
    <div class="job-item" data-id="${job._id}">
      <h3>${job.title}</h3>
      <p>${job.location.prefecture}, ${job.location.city}</p>
      <p class="status">${job.status}</p>
      <button onclick="viewApplications('${job._id}')" class="btn-view">View Applications</button>
      <a href="/pages/jobPost/edit.html?id=${job._id}" class="btn-edit">Edit</a>
    </div>
  `,
    )
    .join("");
}

async function updateApplicationStatus(applicationId, newStatus) {
  try {
    showLoading();

    await apiClient.patch(`/applications/${applicationId}/status`, {
      status: newStatus,
      notes: document.getElementById(`notes_${applicationId}`)?.value || "",
    });

    showSuccess("Application status updated");

    // Reload dashboard
    await loadEmployerDashboard();

    hideLoading();
  } catch (error) {
    hideLoading();
    showError("Failed to update application status");
  }
}

window.updateApplicationStatus = updateApplicationStatus;

document.addEventListener("DOMContentLoaded", loadEmployerDashboard);
```

---

### 6. Company Pages

#### **pages/companies/** — Company Listings

**API Endpoint:** `GET /companies`

```javascript
// Similar to job search
const response = await apiClient.get("/companies", {
  page: 1,
  limit: 10,
  industry: "Manufacturing", // optional filter
});

renderCompanyList(response.data.companies);
```

---

## Error Handling

### Global Error Handler

```javascript
// assets/js/errorHandler.js
export function handleApiError(error) {
  console.error("API Error:", error);

  switch (error.statusCode) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      authService.logout();
      window.location.href = "/pages/signin.html";
      return "Session expired. Please login again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "Resource not found.";
    case 409:
      return "This resource already exists.";
    case 422:
      return "Validation failed. Please check your input.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}
```

### Display Error Messages

```javascript
// assets/js/notifications.js
export function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "notification error";
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

export function showSuccess(message) {
  const successDiv = document.createElement("div");
  successDiv.className = "notification success";
  successDiv.textContent = message;
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}
```

---

## Best Practices

### 1. Always Check Authentication

```javascript
// At the top of every protected page
import authService from "./auth.js";

if (!authService.isAuthenticated()) {
  window.location.href = "/pages/signin.html";
}
```

### 2. Handle Token Expiration

```javascript
// In apiClient.js, add refresh logic
async request(endpoint, options) {
  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (response.status === 401) {
      // Token expired, logout and redirect
      authService.logout();
      window.location.href = '/pages/signin.html';
      throw new ApiError('Session expired', 401);
    }

    return data;
  } catch (error) {
    throw error;
  }
}
```

### 3. Loading States

```javascript
function showLoading() {
  document.getElementById("loadingSpinner")?.classList.remove("hidden");
  document.body.classList.add("loading");
}

function hideLoading() {
  document.getElementById("loadingSpinner")?.classList.add("hidden");
  document.body.classList.remove("loading");
}
```

### 4. Form Validation

```javascript
function validateForm(formData) {
  const errors = [];

  if (!formData.email || !formData.email.includes("@")) {
    errors.push("Valid email is required");
  }

  if (!formData.password || formData.password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  return errors;
}

// Use before API call
const errors = validateForm(formData);
if (errors.length > 0) {
  showError(errors.join(", "));
  return;
}
```

### 5. Debounce Search

```javascript
let searchTimeout;

function handleSearch(event) {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    searchJobs({ search: event.target.value });
  }, 500); // Wait 500ms after user stops typing
}

document.getElementById("searchInput").addEventListener("input", handleSearch);
```

### 6. Cache User Profile

```javascript
class ProfileCache {
  constructor() {
    this.profile = null;
    this.lastFetch = null;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  async getProfile(forceRefresh = false) {
    const now = Date.now();

    if (
      !forceRefresh &&
      this.profile &&
      now - this.lastFetch < this.cacheDuration
    ) {
      return this.profile;
    }

    const response = await apiClient.get("/profile");
    this.profile = response.data;
    this.lastFetch = now;

    return this.profile;
  }

  clearCache() {
    this.profile = null;
    this.lastFetch = null;
  }
}

const profileCache = new ProfileCache();
export default profileCache;
```

---

## Quick Integration Checklist

- [ ] Set up `assets/js/config.js` with API base URL
- [ ] Create `assets/js/auth.js` for token management
- [ ] Create `assets/js/apiClient.js` for API requests
- [ ] Update login/register pages to save JWT tokens
- [ ] Add logout functionality to all authenticated pages
- [ ] Protect all private pages with authentication check
- [ ] Integrate profile edit pages with PUT/POST endpoints
- [ ] Update job search pages to use GET /jobs with filters
- [ ] Add apply functionality to job detail pages
- [ ] Update employer dashboard to display applications
- [ ] Add application status update for employers
- [ ] Test entire user journey (register → profile → apply)
- [ ] Test employer journey (register → create job → review apps)
- [ ] Handle all error cases (401, 404, 500, etc.)
- [ ] Add loading states to all API calls
- [ ] Test with production API URL before deployment

---

## Testing Credentials

Use these accounts for testing:

**Jobseeker:**

- Email: `carlos.rivera@example.com`
- Password: `Test123!`

**Employer:**

- Email: `employer1@techinnov.com`
- Password: `Test123!`

**Admin:**

- Email: `admin@japanssw.com`
- Password: `Admin123!`

---

## Support

For questions or issues:

1. Check [API_REFERENCE.md](./API_REFERENCE.md) for endpoint details
2. View Swagger docs at `http://localhost:5000/api-docs`
3. Test endpoints with Postman collection
4. Review error messages in browser console

---

**Document Version:** 1.0  
**Last Updated:** January 29, 2026  
**Maintained By:** Backend Team
