/*
  assets/js/modules/forms.js

  FormHandler module (Phase 2):
    - Handles client-side validation and submission flows.
    - Present as a Phase 2 placeholder. JS is disabled in Phase 1; enable
      with the commented script tags in HTML during Phase 2.
*/

// ===================================================================
// Form Handler Module
// ===================================================================

/* Moved to archive/assets-js/modules/forms.js on 2025-09-17 */

import { setCookie } from "./storage.js";
import {
  saveUserProfile,
  setNewUserFlag,
  hasCompletedProfile,
} from "./userProfile.js";

const setValidationState = (
  element,
  isValid,
  feedbackId = null,
  message = null
) => {
  // Apply is-valid/is-invalid classes to the input element itself
  if (element) {
    element.classList.remove("is-valid", "is-invalid");
    if (isValid) {
      element.classList.add("is-valid");
    } else {
      element.classList.add("is-invalid");
    }
  }

  // Handle custom feedback message (for password fields, etc.)
  if (feedbackId) {
    const feedbackElement = document.getElementById(feedbackId);
    if (feedbackElement) {
      feedbackElement.textContent = message || "";

      if (!isValid && message) {
        feedbackElement.style.display = "block";
      } else {
        feedbackElement.style.display = "none";
      }
    }
  }
};

// Validates password strength: Minimum 8 characters
// Requires at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol.
const validatePasswordStrength = (password) => {
  if (password.length < 8) return false;
  const strengthRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strengthRegex.test(password);
};

// ===================================================================
// Dedicated Validation Logic (Returns true if VALID, false if INVALID)
// ===================================================================

const validateEmail = (inputElements) => {
  let emailMsg = "";
  let isEmailValid = true;

  // Check for empty field
  if (inputElements.email.value.trim() === "") {
    emailMsg = "Email is required.";
    isEmailValid = false;
    // Check for valid format
  } else if (!inputElements.email.checkValidity()) {
    emailMsg = "Please enter a valid email address.";
    isEmailValid = false;
  }

  setValidationState(
    inputElements.email,
    isEmailValid,
    "emailFeedback",
    emailMsg
  );
  return isEmailValid;
};

const validatePassword = (inputElements) => {
  let passwordMsg = "";
  let isPasswordStrong = true;

  if (inputElements.password.value.length === 0) {
    passwordMsg = "Password is required.";
    isPasswordStrong = false;
  } else if (inputElements.password.value.length < 8) {
    passwordMsg = "Password must be at least 8 characters.";
    isPasswordStrong = false;
  } else if (!validatePasswordStrength(inputElements.password.value)) {
    passwordMsg = "Must include uppercase, lowercase, number, and symbol.";
    isPasswordStrong = false;
  }

  setValidationState(
    inputElements.password,
    isPasswordStrong,
    "passwordFeedback",
    passwordMsg
  );
  return isPasswordStrong;
};

const validatePasswordConfirm = (inputElements) => {
  let isPasswordMatch = true;
  let passwordConfirmMsg = "";

  if (inputElements.passwordConfirm.value.length === 0) {
    passwordConfirmMsg = "Confirmation password is required.";
    isPasswordMatch = false;
  } else if (
    inputElements.password.value !== inputElements.passwordConfirm.value
  ) {
    passwordConfirmMsg = "Passwords do not match.";
    isPasswordMatch = false;
  }

  setValidationState(
    inputElements.passwordConfirm,
    isPasswordMatch,
    "passwordConfirmFeedback",
    passwordConfirmMsg
  );
  return isPasswordMatch;
};

const validatePrivacyPolicy = (inputElements) => {
  let isPolicyChecked = false;
  if (inputElements.privacyPolicy) {
    isPolicyChecked = inputElements.privacyPolicy.checked;
  }

  if (inputElements.privacyLabelWrapper) {
    const feedbackEl = document.getElementById("privacyPolicyFeedback");

    if (isPolicyChecked) {
      // Policy is checked (Valid)
      inputElements.privacyLabelWrapper.classList.remove(
        "privacy-error-highlight"
      );
      setValidationState(inputElements.privacyPolicy, true);

      if (feedbackEl) {
        feedbackEl.style.display = "none";
        feedbackEl.textContent = "";
      }
    } else {
      // Policy is NOT checked (Invalid)
      inputElements.privacyLabelWrapper.classList.add(
        "privacy-error-highlight"
      );
      setValidationState(inputElements.privacyPolicy, false);

      if (feedbackEl) {
        feedbackEl.textContent = "You must agree to the Privacy Policy.";
        feedbackEl.style.display = "block";
      }
    }
  }

  return isPolicyChecked;
};

// Master function to check ALL fields (used on submit)
const checkFormValidity = (inputElements) => {
  let formValid = true;

  if (!validateEmail(inputElements)) formValid = false;
  if (!validatePassword(inputElements)) formValid = false;
  if (!validatePasswordConfirm(inputElements)) formValid = false;
  if (!validatePrivacyPolicy(inputElements)) formValid = false;

  return formValid;
};

// ===================================================================
// Sign Up Validation (Create Account) Initialization
// ===================================================================

export const initializeSignupValidation = () => {
  const form = document.getElementById("createAccountForm");
  if (!form) {
    console.error(
      'Sign-up Module: Form with ID "createAccountForm" not found.'
    );
    return;
  }

  const inputElements = {
    email: document.getElementById("email"),
    password: document.getElementById("password"),
    passwordConfirm: document.getElementById("passwordConfirm"),
    privacyPolicy: document.getElementById("privacyPolicy"),
    privacyLabelWrapper: document.getElementById("privacyLabel"),
  };

  // Main event listener to the form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();

    console.log("Submission detected. Preventing default form action.");

    // Run FULL form validation on submit
    if (checkFormValidity(inputElements)) {
      console.log(
        "Sign-up validation successful. Saving cookies and redirecting..."
      );

      // --- COOKIE SAVING ---
      setCookie("email", inputElements.email.value);
      setCookie("password", inputElements.password.value);
      // --- LOGGED-IN COOKIE ---
      setCookie("isLoggedIn", "true", 1); // Sets the cookie for 1 day

      // --- INITIALIZE USER PROFILE ---
      // Save email to profile and mark as new user
      saveUserProfile({ email: inputElements.email.value });
      setNewUserFlag(true);

      console.log(
        "Cookies saved successfully. Logged-in status set. User profile initialized."
      );
      window.location.href = "addEdit/profile.html";
    } else {
      console.log(
        "Sign-up validation failed. Errors displayed. Staying on page."
      );
    }
  };

  // Form submission listener
  form.addEventListener("submit", handleSubmit, false);

  // --- Per-Field Real-Time Validation ---
  // Email: Check validity when user types
  inputElements.email.addEventListener("input", () =>
    validateEmail(inputElements)
  );

  // Password: Check validity when user types
  inputElements.password.addEventListener("input", () => {
    validatePassword(inputElements);
    validatePasswordConfirm(inputElements);
  });

  // Password Confirm: Check validity when user types
  inputElements.passwordConfirm.addEventListener("input", () =>
    validatePasswordConfirm(inputElements)
  );

  // Privacy Policy: Check validity on change (click)
  inputElements.privacyPolicy.addEventListener("change", () =>
    validatePrivacyPolicy(inputElements)
  );

  console.log(
    "Sign-up Module: Per-field validation listeners successfully attached."
  );

  // --- Password Visibility Toggle Setup ---
  setupPasswordToggle("password", "togglePassword", "eye-icon-password");
  setupPasswordToggle(
    "passwordConfirm",
    "togglePasswordConfirm",
    "eye-icon-passwordConfirm"
  );

  console.log(
    "Sign-up Module: Per-field validation listeners successfully attached."
  );
};

// ===================================================================
// Login Form Validation Function
// ===================================================================

export const initializeLoginValidation = () => {
  console.log("Login Module: initializeLoginValidation is running.");
  const form = document.getElementById("loginForm");

  if (!form) {
    console.error(
      'Login Module: Form with ID "loginForm" not found. Cannot attach validation.'
    );
    return;
  }

  const inputElements = {
    email: document.getElementById("email"),
    password: document.getElementById("password"),
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("Login Module: Handling submit event. Default prevented.");

    let formValid = true;

    // Email Check
    const isEmailValid =
      inputElements.email.value.trim() !== "" &&
      inputElements.email.checkValidity();
    setValidationState(inputElements.email, isEmailValid);
    if (!isEmailValid) formValid = false;

    // Password Check
    const isPasswordValid = inputElements.password.value.length >= 8;
    setValidationState(inputElements.password, isPasswordValid);
    if (!isPasswordValid) formValid = false;

    if (formValid) {
      console.log("Login validation successful. Initializing user profile...");

      // Mark user as logged in
      setCookie("isLoggedIn", "true", 1); // Sets the persistent cookie for 1 day
      sessionStorage.setItem("isLoggedIn", "true");

      // Save email to user profile for existing users logging in
      saveUserProfile({
        email: inputElements.email.value,
        // Set default name for display purposes
        firstName: "Juan",
        lastName: "Dela Cruz",
      });

      // Mark as existing user (not new registration)
      setNewUserFlag(false);

      // For login, prefer form-level redirect (data-redirect) or form action
      // so pages like employer sign-in can specify their own dashboard.
      // Fallback to profileDashboard.html for regular users.
      const formRedirect =
        (form.getAttribute && form.getAttribute("data-redirect")) ||
        (form.getAttribute && form.getAttribute("action"));
      const defaultRedirect = "profileDashboard.html";
      const redirectUrl =
        formRedirect && formRedirect.trim() !== ""
          ? formRedirect
          : defaultRedirect;

      console.log("Login successful. Redirecting to:", redirectUrl);
      try {
        // If redirectUrl is a relative path, navigating to it directly works.
        window.location.href = redirectUrl;
      } catch (err) {
        console.warn("Redirect failed, falling back to default:", err);
        window.location.href = defaultRedirect;
      }
    } else {
      console.log("Login validation failed. Errors displayed.");
    }
  };

  // Main event listener to the form submission
  form.addEventListener("submit", handleSubmit, false);
  console.log(
    "Login Module: Validation listener successfully attached to loginForm."
  );

  // PASSWORD TOGGLE FUNCTION
  setupPasswordToggle("password", "togglePassword", "eye-icon-password");

  console.log(
    "Login Module: Validation listener successfully attached to loginForm."
  );
};

// ===================================================================
// Show/Hide Password Toggle Logic
// ===================================================================

const setupPasswordToggle = (inputId, toggleButtonId, iconId) => {
  const passwordInput = document.getElementById(inputId);
  const toggleButton = document.getElementById(toggleButtonId);
  const icon = document.getElementById(iconId);

  if (passwordInput && toggleButton && icon) {
    toggleButton.addEventListener("click", function () {
      const isPassword = passwordInput.getAttribute("type") === "password";
      const newType = isPassword ? "text" : "password";
      passwordInput.setAttribute("type", newType);

      //Toggle the icon class for visual clarity (bi-eye <-> bi-eye-slash)
      if (isPassword) {
        icon.classList.remove("bi-eye-slash", "text-gray-500");
        icon.classList.add("bi-eye", "text-red-600");
      } else {
        icon.classList.remove("bi-eye", "text-red-600");
        icon.classList.add("bi-eye-slash", "text-gray-500");
      }
    });
  }
};
