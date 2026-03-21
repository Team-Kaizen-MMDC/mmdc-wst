// ===================================================================
// User Profile Management Module
// ===================================================================
// Centralized module for managing user profile data across the application
// Uses localStorage for persistent storage of user profile information
// Keys are namespaced per-user using the `email` cookie to avoid leaking
// profile data between different signed-in users on the same browser.

import { getCookie } from "./storage.js";

const GLOBAL_FALLBACK_KEY = "userProfile";
const GLOBAL_NEW_USER_KEY = "isNewUser";

function getUserStorageKey() {
  const email = getCookie("email") || "";
  return email ? `userProfile:${email}` : GLOBAL_FALLBACK_KEY;
}

function getNewUserKey() {
  const email = getCookie("email") || "";
  return email ? `isNewUser:${email}` : GLOBAL_NEW_USER_KEY;
}

/**
 * Get the default/empty user profile structure
 * Used for new users or when no profile exists
 * @returns {Object} Default profile object with all expected fields
 */
export function getDefaultProfile() {
  return {
    // From Registration
    email: "",

    // From Profile Step (profile.html)
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: {
      day: "",
      month: "",
      year: "",
    },
    gender: "",
    nationality: "",
    visaStatus: "",
    industry: "",
    japaneseLevel: "",
    address: "",
    city: "",
    prefecture: "",
    postalCode: "",

    // From Contact Step (contact.html)
    mobile1: "",
    mobile2: "",

    // From Education Step (education.html)
    education: [],

    // From Experience Step (experience.html)
    experience: [],

    // From Skill Step (skill.html)
    skills: [],
    certifications: [],

    // From Availability Step (availability.html)
    availability: {
      startDate: "",
      endDate: "",
    },

    // Profile Dashboard specific
    profileSummary:
      "This is the default profile description. Click 'Edit' to make changes.",
    location: "",
    visa: "",
    visaValidity: "",
    age: "",

    // Metadata
    profileComplete: false,
    lastUpdated: null,
  };
}

/**
 * Save user profile to localStorage
 * @param {Object} profileData - The profile data to save
 * @returns {boolean} True if save was successful
 */
export function saveUserProfile(profileData) {
  try {
    const currentProfile = getUserProfile();
    const updatedProfile = {
      ...currentProfile,
      ...profileData,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(getUserStorageKey(), JSON.stringify(updatedProfile));
    console.log("User profile saved successfully:", updatedProfile);
    return true;
  } catch (error) {
    console.error("Error saving user profile:", error);
    return false;
  }
}

/**
 * Replace the current user's cached profile with a fresh base profile.
 * Useful when a new login should not inherit stale identity fields.
 * @param {Object} profileData - The profile data to seed into the fresh profile
 * @returns {boolean} True if save was successful
 */
export function replaceUserProfile(profileData) {
  try {
    const updatedProfile = {
      ...getDefaultProfile(),
      ...profileData,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(getUserStorageKey(), JSON.stringify(updatedProfile));
    console.log("User profile replaced successfully:", updatedProfile);
    return true;
  } catch (error) {
    console.error("Error replacing user profile:", error);
    return false;
  }
}

/**
 * Get user profile from localStorage
 * @returns {Object} User profile object or default profile if none exists
 */
export function getUserProfile() {
  try {
    const profileJson = localStorage.getItem(getUserStorageKey());
    if (profileJson) {
      const profile = JSON.parse(profileJson);
      console.log("User profile retrieved:", profile);
      return profile;
    }
    console.log("No user profile found, returning default");
    return getDefaultProfile();
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    return getDefaultProfile();
  }
}

/**
 * Check if user has completed their profile setup
 * @returns {boolean} True if profile is complete
 */
export function hasCompletedProfile() {
  const profile = getUserProfile();

  // Check if essential fields are filled
  const hasBasicInfo = profile.firstName && profile.lastName && profile.email;
  const hasContact = profile.mobile1;

  // Profile is complete if it has basic info, contact, and is marked complete
  // OR has the profileComplete flag set to true
  return profile.profileComplete === true || (hasBasicInfo && hasContact);
}

/**
 * Clear user profile from localStorage
 * Used on logout or account deletion
 */
export function clearUserProfile() {
  try {
    // Remove the profile and new-user flag for the current user
    localStorage.removeItem(getUserStorageKey());
    localStorage.removeItem(getNewUserKey());
    // Clear additional cached per-user keys (shared/global fallback)
    [
      "userProfile",
      "currentUserId",
      "experienceData",
      "educationData",
      "skillsData",
      "applicationsData",
    ].forEach((k) => localStorage.removeItem(k));
    console.log("User profile cleared");
  } catch (error) {
    console.error("Error clearing user profile:", error);
  }
}

/**
 * Mark profile as complete
 * Call this when user finishes the profile setup flow
 */
export function markProfileComplete() {
  const profile = getUserProfile();
  profile.profileComplete = true;
  saveUserProfile(profile);
  console.log("Profile marked as complete");
}

/**
 * Check if current user is a new registration
 * @returns {boolean} True if user just registered
 */
export function isNewUser() {
  return localStorage.getItem(getNewUserKey()) === "true";
}

/**
 * Set new user flag
 * @param {boolean} value - True if new user, false otherwise
 */
export function setNewUserFlag(value) {
  localStorage.setItem(getNewUserKey(), value ? "true" : "false");
}

/**
 * Update a specific section of the profile
 * Useful for stepper forms that update incrementally
 * @param {string} section - The section name (e.g., 'education', 'experience')
 * @param {any} data - The data to save for that section
 */
export function updateProfileSection(section, data) {
  const profile = getUserProfile();
  profile[section] = data;
  return saveUserProfile(profile);
}

/**
 * Get display name from profile
 * @returns {string} User's full name or default
 */
export function getDisplayName() {
  const profile = getUserProfile();
  if (profile.firstName && profile.lastName) {
    const middle = profile.middleName ? ` ${profile.middleName}` : "";
    return `${profile.firstName}${middle} ${profile.lastName}`;
  }
  return "User";
}

/**
 * Get first name from profile
 * @returns {string} User's first name or default
 */
export function getFirstName() {
  const profile = getUserProfile();
  return profile.firstName || "User";
}
