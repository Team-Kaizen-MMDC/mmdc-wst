// ===================================================================
// User Profile Management Module
// ===================================================================
// Centralized module for managing user profile data across the application
// Uses localStorage for persistent storage of user profile information

const USER_PROFILE_KEY = "userProfile";
const IS_NEW_USER_KEY = "isNewUser";

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
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedProfile));
    console.log("User profile saved successfully:", updatedProfile);
    return true;
  } catch (error) {
    console.error("Error saving user profile:", error);
    return false;
  }
}

/**
 * Get user profile from localStorage
 * @returns {Object} User profile object or default profile if none exists
 */
export function getUserProfile() {
  try {
    const profileJson = localStorage.getItem(USER_PROFILE_KEY);
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
    localStorage.removeItem(USER_PROFILE_KEY);
    localStorage.removeItem(IS_NEW_USER_KEY);
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
  return localStorage.getItem(IS_NEW_USER_KEY) === "true";
}

/**
 * Set new user flag
 * @param {boolean} value - True if new user, false otherwise
 */
export function setNewUserFlag(value) {
  localStorage.setItem(IS_NEW_USER_KEY, value ? "true" : "false");
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
