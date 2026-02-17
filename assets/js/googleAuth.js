/**
 * Google OAuth 2.0 Authentication Handler
 * Handles Google Sign-In responses and communicates with backend
 */

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api/v1"
    : "https://yourdomain.com/api/v1";

/**
 * Handle Google Sign-In response (for login pages)
 * @param {Object} response - Google Sign-In response object containing credential
 */
async function handleGoogleSignIn(response) {


  try {
    // The response.credential contains the JWT ID token
    const googleToken = response.credential;

    if (!googleToken) {
      showError("Failed to get Google authentication token");
      return;
    }

    // Show loading state
    showLoading("Signing in with Google...");

    // Send token to our backend
    const result = await fetch(`${API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        googleToken: googleToken,
        // role is optional for login, backend will use existing role
      }),
    });

    const data = await result.json();

    if (!result.ok) {
      throw new Error(data.message || "Google sign-in failed");
    }

    // Store JWT token in localStorage
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("user", JSON.stringify(data.data.user));



    // Redirect based on user role
    redirectToDashboard(data.data.user.role);
  } catch (error) {
    console.error("Google Sign-In error:", error);
    showError(error.message || "Failed to sign in with Google");
    hideLoading();
  }
}

/**
 * Handle Google Sign-Up response (for registration pages)
 * @param {Object} response - Google Sign-In response object containing credential
 */
async function handleGoogleSignUp(response) {


  try {
    const googleToken = response.credential;

    if (!googleToken) {
      showError("Failed to get Google authentication token");
      return;
    }

    // Determine role based on page URL
    const isEmployer = window.location.pathname.includes("employer");
    const role = isEmployer ? "employer" : "jobseeker";

    showLoading("Creating your account...");

    // Send token to backend
    const result = await fetch(`${API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        googleToken: googleToken,
        role: role,
      }),
    });

    const data = await result.json();

    if (!result.ok) {
      throw new Error(data.message || "Google sign-up failed");
    }

    // Store JWT token
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("user", JSON.stringify(data.data.user));



    // Redirect to dashboard
    redirectToDashboard(role);
  } catch (error) {
    console.error("Google Sign-Up error:", error);
    showError(error.message || "Failed to sign up with Google");
    hideLoading();
  }
}

/**
 * Redirect user to appropriate dashboard
 * @param {string} role - User role ('jobseeker' or 'employer')
 */
function redirectToDashboard(role) {
  if (role === "employer") {
    window.location.href = "/pages/companyDashboard.html";
  } else {
    window.location.href = "/pages/profileDashboard.html";
  }
}

/**
 * Show loading overlay
 * @param {string} message - Loading message to display
 */
function showLoading(message) {
  // Create or update loading overlay
  let overlay = document.getElementById("google-auth-loading");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "google-auth-loading";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(5px);
    `;

    overlay.innerHTML = `
      <div style="
        background: white;
        padding: 2rem 3rem;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      ">
        <div class="spinner" style="
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        "></div>
        <p id="loading-message" style="
          color: #333;
          font-size: 16px;
          font-weight: 500;
          margin: 0;
        ">${message}</p>
      </div>
    `;

    document.body.appendChild(overlay);

    // Add spinner animation if not already in document
    if (!document.getElementById("spinner-style")) {
      const style = document.createElement("style");
      style.id = "spinner-style";
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  } else {
    overlay.style.display = "flex";
    document.getElementById("loading-message").textContent = message;
  }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  const overlay = document.getElementById("google-auth-loading");
  if (overlay) {
    overlay.style.display = "none";
  }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  // Try to use existing error display mechanism
  const existingAlert = document.querySelector(".alert-danger");
  if (existingAlert) {
    existingAlert.textContent = message;
    existingAlert.style.display = "block";
    return;
  }

  // Create new error alert
  const errorDiv = document.createElement("div");
  errorDiv.className = "alert alert-danger google-auth-error";
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #f8d7da;
    color: #721c24;
    padding: 1rem 2rem;
    border: 1px solid #f5c6cb;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    max-width: 500px;
    animation: slideDown 0.3s ease-out;
  `;
  errorDiv.textContent = message;

  // Add slide down animation
  if (!document.getElementById("error-animation-style")) {
    const style = document.createElement("style");
    style.id = "error-animation-style";
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(errorDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    errorDiv.style.opacity = "0";
    setTimeout(() => errorDiv.remove(), 300);
  }, 5000);
}

/**
 * Initialize Google Sign-In
 * Call this on page load to set up the Google button
 */
function initializeGoogleSignIn() {
  // Wait for Google library to load
  const checkGoogleLoaded = setInterval(() => {
    if (window.google && window.google.accounts) {
      clearInterval(checkGoogleLoaded);

      // Manually render buttons if they haven't auto-rendered
      setTimeout(() => {
        const buttons = document.querySelectorAll(".g_id_signin");
        buttons.forEach((button, index) => {
          if (!button.children.length) {
            try {
              google.accounts.id.renderButton(button, {
                type: "standard",
                shape: "rectangular",
                theme: "outline",
                text: button.closest("form") ? "signin_with" : "signup_with",
                size: "large",
                logo_alignment: "left",
                width: button.offsetWidth || 384,
              });
            } catch (err) {
              console.error("Error rendering Google button:", err);
            }
          }
        });
      }, 100);
    }
  }, 100);

  // Timeout after 10 seconds
  setTimeout(() => {
    clearInterval(checkGoogleLoaded);
    if (!window.google || !window.google.accounts) {
      console.error("Google Sign-In library failed to load");
    }
  }, 10000);
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeGoogleSignIn);
} else {
  initializeGoogleSignIn();
}
