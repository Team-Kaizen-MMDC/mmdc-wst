
/*
  Handles client-side validation and submission flows for the multi-step profile forms.
*/

import { setCookie } from './storage.js';

// ===================================================================
// VALIDATION FUNCTIONS (SHARED)
// ===================================================================


// Current Date Constants
const TODAY = new Date();
const CURRENT_YEAR = TODAY.getFullYear();
const CURRENT_MONTH = TODAY.getMonth() + 1; // Note: Month is 1-based (January=1, December=12)


// Applies Bootstrap classes and custom feedback messages to an element
// Apply is-valid/is-invalid classes to the input element itself
const setValidationState = (element, isValid, feedbackId = null, message = null) => {
    if (element) {
        element.classList.remove('is-valid', 'is-invalid');
        if (isValid) {
            element.classList.add('is-valid');
        } else {
            element.classList.add('is-invalid');
        }
    }

    // Helper function for dropdowns
const validateRequiredSelect = (elementId, feedbackId, message) => {
    const element = document.getElementById(elementId);
    if (element && element.value === '') {
        setValidationState(element, false, feedbackId, message);
        return false;
    }
    return true;
};

    // Handle custom feedback message
    if (feedbackId) {
        const feedbackElement = document.getElementById(feedbackId);
        if (feedbackElement) {
            feedbackElement.textContent = message || '';
            
            if (!isValid && message) {
                 feedbackElement.style.display = 'block';
            } else {
                 feedbackElement.style.display = 'none';
            }
        }
    }
};

// Helper function for day population (1 to 31)
const populateDaySelect = (elementId) => {
    const select = document.getElementById(elementId);
    if (!select) return;

    // Start from 1 up to 31
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        // Pad the day number with a leading zero (e.g., '01', '09')
        const displayValue = i.toString().padStart(2, '0'); 
        option.value = displayValue;
        option.textContent = displayValue;
        select.appendChild(option);
    }
};

// ===================================================================
// DEDICATED VALIDATION LOGIC (Returns true if VALID, false if INVALID)
// ===================================================================

const validateRequiredText = (elementId, message) => {
    const element = document.getElementById(elementId);
    let isValid = true;
    let msg = '';
    
    if (element.value.trim() === '') {
        msg = message;
        isValid = false;
    }
    
    setValidationState(element, isValid, `${elementId}Feedback`, msg);
    return isValid;
};

const validateEmailFormat = (elementId) => {
    const element = document.getElementById(elementId);
    let isValid = true;
    let msg = '';
    
    if (element.value.trim() === '') {
        msg = 'Email is required.';
        isValid = false;
    } else if (!element.checkValidity()) {
        msg = 'Please enter a valid email address.';
        isValid = false;
    }
    
    setValidationState(element, isValid, `${elementId}Feedback`, msg);
    return isValid;
}


// ===================================================================
// FORM INITIALIZATION FUNCTIONS (Profile, Contact, etc.)
// ===================================================================

/**
 * Master submission handler for all profile steps.
 * Performs validation, saves cookies, and redirects.
 * @param {HTMLFormElement} form - The form element to handle.
 * @param {function} validationFn - The function that runs page-specific validation.
 */
const initializeFormValidation = (formId, validationFn) => {
    const form = document.getElementById(formId);
    if (!form) {
        console.error(`Validation Module: Form with ID "${formId}" not found.`);
        return;
    }

    // 1. LOAD DATA LOGIC (Moved here for clean separation from HTML)
    const loadFormData = () => {
        const formControls = form.querySelectorAll('input, select, textarea');
        formControls.forEach(element => {
          if (element.id) {

          }
        });
    };

    // 2. SAVE & SUBMIT LOGIC
    const handleSubmit = (event) => {
        event.preventDefault(); 
        event.stopPropagation();
        
        console.log('Form submission detected. Running validation...');

        // Run page-specific validation function
        if (validationFn(form)) { 
            console.log('Validation successful. Saving cookies and redirecting...');
            
            // --- COOKIE SAVING ---
            const formControls = form.querySelectorAll('input, select, textarea');
            formControls.forEach(element => {
                if (element.id && element.value.trim() !== '') {
                    setCookie(element.id, element.value);
                }
            });
            console.log("Form data saved successfully.");
            
            // --- REDIRECT ---
            const formAction = form.getAttribute('action'); 
            window.location.href = formAction;

        } else {
            console.log('Validation failed. Errors displayed. Staying on page.');
        }
    };

    form.addEventListener('submit', handleSubmit, false);
    console.log(`Validation Module: Listeners attached to ${formId}.`);
};


// ===================================================================
// PAGE-SPECIFIC VALIDATION MASTER FUNCTIONS
// ===================================================================

// Master function for profile.html
const validateProfileForm = (form) => {
    let formValid = true;
    
    if (!validateRequiredText('firstName', 'First Name is required.')) formValid = false;
    if (!validateRequiredText('lastName', 'Last Name is required.')) formValid = false;

    isValid = validateRequiredSelect('dobDay', 'dobFeedback', 'Date of Birth is required.') && isValid;
    isValid = validateRequiredSelect('dobMonth', 'dobFeedback', 'Date of Birth is required.') && isValid;
    isValid = validateRequiredSelect('dobYear', 'dobFeedback', 'Date of Birth is required.') && isValid;

    if (document.getElementById('dobDay').value && document.getElementById('dobMonth').value && document.getElementById('dobYear').value) {
        isValid = validateDOBFutureDate(
            'dobDay', 
            'dobMonth', 
            'dobYear', 
            'dobFeedback', 
            'Date of Birth cannot be in the future.'
        ) && isValid;
    }

    return formValid;
    return isValid;
};

// Master function for contact.html
const validateContactForm = (form) => {
    let formValid = true;
    
    if (!validateRequiredText('mobile1', 'Mobile Number 1 is required.')) formValid = false;
    if (!validateEmailFormat('email')) formValid = false;

    return formValid;
};

// Master function for education.html
const validateEducationForm = (form) => {
    let formValid = true;
    
    if (!validateRequiredText('school', 'School name is required.')) formValid = false;
    if (!validateRequiredText('degree', 'Degree/Course is required.')) formValid = false;

    isValid &= validateRequiredSelect('startMonth', 'startMonthFeedback', 'Start date is required.');
    isValid &= validateRequiredSelect('startYear', 'startMonthFeedback', 'Start date is required.');
    isValid &= validateFutureDate('startMonth', 'startYear', 'startMonthFeedback', 'Start date cannot be in the future.');

    return formValid;
    return isValid;
};

// Master function for experience.html
const validateExperienceForm = (form) => {
    let formValid = true;
    
    if (!validateRequiredText('title', 'Job Title is required.')) formValid = false;
    if (!validateRequiredText('company', 'Company name is required.')) formValid = false;

    return formValid;
};

// Master function for skill.html
const validateSkillForm = (form) => {
    let formValid = true;
    
    if (!validateRequiredText('skill', 'Skill is required.')) formValid = false;
    if (!validateRequiredText('certification', 'Certification is required.')) formValid = false;

    return formValid;
};

// Master function for availability.html
const validateAvailabilityForm = (form) => {
    let formValid = true;
    
    if (!validateRequiredText('preferredLocation', 'Preferred Location is required.')) formValid = false;
    if (!validateRequiredText('workPreferences', 'Work Preferences are required.')) formValid = false;

    return formValid;
};

// ===================================================================
// DEDICATED VALIDATION LOGIC: Prevents selection of a future date
// ===================================================================
const validateFutureDate = (monthId, yearId, feedbackId, message) => {
    const monthElement = document.getElementById(monthId);
    const yearElement = document.getElementById(yearId);

    if (!monthElement || !yearElement || !monthElement.value || !yearElement.value) {
        // Skip if elements don't exist or are blank (let required check handle blanks)
        return true; 
    }

    const selectedMonth = parseInt(monthElement.value);
    const selectedYear = parseInt(yearElement.value);

    // Get current date from constants assumed to be in validation.js
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-based month

    let isValid = true;

    // Check if the selected year is in the future
    if (selectedYear > currentYear) {
        isValid = false;
    }

    // Check if the selected year is the current year AND the month is in the future
    if (selectedYear === currentYear && selectedMonth > currentMonth) {
        isValid = false;
    }

    // Apply validation state
    if (!isValid) {
        setValidationState(monthElement, false, feedbackId, message);
        setValidationState(yearElement, false);
    } else {
        // Clear previous state for both fields
        setValidationState(monthElement, true, feedbackId, '');
        setValidationState(yearElement, true);
    }

    return isValid;
};

// Function to attach the future date check to the dropdown change events
// This will run the future date check with the error message
const setupStartDateFutureRestriction = () => {
    const startMonth = document.getElementById('startMonth');
    const startYear = document.getElementById('startYear');
    
    if (!startMonth || !startYear) return;

    const validateStart = () => {
        validateFutureDate(
            'startMonth', 
            'startYear', 
            'startMonthFeedback', 
            'Start date cannot be in the future.'
        );
    };

    startMonth.addEventListener('change', validateStart);
    startYear.addEventListener('change', validateStart);
};

const setupExperienceStartDateRestriction = () => {
    const startMonth = document.getElementById('startMonth');
    const startYear = document.getElementById('startYear');
    
    if (!startMonth || !startYear) return;

    const validateStart = () => {
        validateFutureDate(
            'startMonth', 
            'startYear', 
            'startMonthFeedback',
            'Start date cannot be in the future.'
        );
    };

    startMonth.addEventListener('change', validateStart);
    startYear.addEventListener('change', validateStart);
};

// ===================================================================
// DEDICATED VALIDATION LOGIC: Prevents selection of a future DOB
// ===================================================================
const validateDOBFutureDate = (dayId, monthId, yearId, feedbackId, message) => {
    const dayElement = document.getElementById(dayId);
    const monthElement = document.getElementById(monthId);
    const yearElement = document.getElementById(yearId);
    const feedbackElement = document.getElementById(feedbackId);

    if (dayElement) dayElement.classList.remove('is-valid', 'is-invalid');
    if (monthElement) monthElement.classList.remove('is-valid', 'is-invalid');
    if (yearElement) yearElement.classList.remove('is-valid', 'is-invalid');
    
    if (feedbackElement) {
        if (feedbackElement.textContent === message) {
             feedbackElement.textContent = '';
             feedbackElement.style.display = 'none';
        }
    }

    if (!dayElement.value || !monthElement.value || !yearElement.value) {
        return true; 
    }

    // --- Date Comparison  ---
    const selectedDay = parseInt(dayElement.value);
    const selectedMonth = parseInt(monthElement.value) - 1; 
    const selectedYear = parseInt(yearElement.value);
    
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    const today = new Date();
    
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    let isValid = selectedDate <= today;

    // --- Handle Invalid State (Future Date) ---
    if (!isValid) {
        if (feedbackElement) {
            feedbackElement.textContent = message;
            feedbackElement.style.display = 'block';
        }
        return false;
    }

    return true;
};

// Function to attach the DOB future date check to the dropdown change events
const setupDOBFutureRestriction = () => {
    const dobDay = document.getElementById('dobDay');
    const dobMonth = document.getElementById('dobMonth');
    const dobYear = document.getElementById('dobYear');

    if (!dobDay || !dobMonth || !dobYear) return;

    const validateDOB = () => {
        validateDOBFutureDate(
            'dobDay', 
            'dobMonth', 
            'dobYear', 
            'dobFeedback', 
            'Date of Birth cannot be in the future.'
        );
    };

    dobDay.addEventListener('change', validateDOB);
    dobMonth.addEventListener('change', validateDOB);
    dobYear.addEventListener('change', validateDOB);
};

// ===================================================================
// Education Form Logic: Toggle 'End Date' visibility
// ===================================================================
const setupCurrentlyStudyingToggle = () => {
    const checkbox = document.getElementById('CurrentlyStudying');
    const endDateSelects = document.getElementById('endDateSelects');
    const currentDateField = document.getElementById('currentDateField');

    // Select the actual month/year dropdowns to disable them
    const endMonthSelect = document.getElementById('endMonth');
    const endYearSelect = document.getElementById('endYear');

    if (!checkbox || !endDateSelects || !currentDateField || !endMonthSelect || !endYearSelect) return;

    const toggleEndDateState = () => {
        if (checkbox.checked) {
            
            endDateSelects.style.display = 'none'; 
            currentDateField.style.display = 'block'; 
            endMonthSelect.disabled = true;
            endYearSelect.disabled = true;
            endMonthSelect.removeAttribute('required');
            endYearSelect.removeAttribute('required');
            
        } else {
            // WHEN UNCHECKED: Enable dropdowns, show them, hide 'Current' field 
            endDateSelects.style.display = 'flex'; 
            currentDateField.style.display = 'none'; 
            endMonthSelect.disabled = false;
            endYearSelect.disabled = false;
        }
    };
    checkbox.addEventListener('change', toggleEndDateState);
    toggleEndDateState(); 
};


// ===================================================================
// EXPERIENCE FORM TOGGLE LOGIC
// ===================================================================
const setupCurrentlyWorkingToggle = () => {
    const checkbox = document.getElementById('currentlyWorking');
    const endDateSelects = document.getElementById('endDateSelects'); 
    const currentDateField = document.getElementById('currentDateField'); 
    const endMonthSelect = document.getElementById('endMonth');
    const endYearSelect = document.getElementById('endYear');

    if (!checkbox || !endDateSelects || !currentDateField || !endMonthSelect || !endYearSelect) {
        console.error('Currently Working Toggle: One or more required date elements not found. Check HTML IDs.');
        return;
    }

    const toggleEndDateState = () => {
        if (checkbox.checked) {
            // --- CHECKED: Disable selects and show "Current" field ---
            endDateSelects.style.display = 'none';
            currentDateField.style.display = 'block'; 
            endMonthSelect.disabled = true;
            endYearSelect.disabled = true;

        } else {
            endDateSelects.style.display = 'flex'; 
            currentDateField.style.display = 'none';
            endMonthSelect.disabled = false;
            endYearSelect.disabled = false;
            endMonthSelect.value = '';
            endYearSelect.value = '';
        }
    };

    checkbox.addEventListener('change', toggleEndDateState);
    toggleEndDateState(); 
};

// ===================================================================
// DATE POPULATION FUNCTIONS
// ===================================================================
const populateMonthSelect = (selectId, maxMonth = 12) => {
    const select = document.getElementById(selectId);
    if (!select) return;

    const months = [
        { value: '01', text: 'January' },
        { value: '02', text: 'February' },
        { value: '03', text: 'March' },
        { value: '04', text: 'April' },
        { value: '05', text: 'May' },
        { value: '06', text: 'June' },
        { value: '07', text: 'July' },
        { value: '08', text: 'August' },
        { value: '09', text: 'September' },
        { value: '10', text: 'October' },
        { value: '11', text: 'November' },
        { value: '12', text: 'December' },
    ];
    
    select.innerHTML = '<option value="">Month</option>';
    // Populate months, stopping at maxMonth
    months.forEach((month, index) => {
        // index + 1 converts the 0-based index to a 1-based month number
        if (index + 1 <= maxMonth) { 
            const option = document.createElement('option');
            option.value = month.value;
            option.textContent = month.text;
            select.appendChild(option);
        }
    });
};

const populateYearSelect = (selectId) => {
    const select = document.getElementById(selectId);
    if (!select) return;

    const currentYear = new Date().getFullYear();
    const earliestYear = 1975;
    
    select.innerHTML = '<option value="">Year</option>';

    for (let year = currentYear; year >= earliestYear; year--) {
        const option = document.createElement('option');
        option.value = year.toString();
        option.textContent = year.toString();
        select.appendChild(option);
    }
};


// ===================================================================
// END YEAR & END MONTH CHANGE LISTENER
// ===================================================================
const setupEndDateRestriction = () => {
    const endYearSelect = document.getElementById('endYear');
    const endMonthSelect = document.getElementById('endMonth');

    if (!endYearSelect || !endMonthSelect) return;

    const applyMonthRestriction = () => {
        const previouslySelectedMonth = endMonthSelect.value; 
        const selectedYear = parseInt(endYearSelect.value);

        if (selectedYear === CURRENT_YEAR) {
            
            populateMonthSelect('endMonth', CURRENT_MONTH);
            const monthValue = parseInt(previouslySelectedMonth);
            
            if (monthValue && monthValue <= CURRENT_MONTH) {
                // Restore the valid month
                endMonthSelect.value = previouslySelectedMonth; 
            } else {
                // Reset to "Month" if the old selection was a future month (e.g., Dec) or blank
                endMonthSelect.value = ''; 
            }

        } else {
            populateMonthSelect('endMonth', 12);
            endMonthSelect.value = previouslySelectedMonth;
        }
    };

    endYearSelect.addEventListener('change', applyMonthRestriction);
        applyMonthRestriction();
};


// ===================================================================
// EXPORTED INITIALIZATION FUNCTIONS
// ===================================================================

export const initializeProfileValidation = () => {
    initializeFormValidation('profileForm', validateProfileForm);

    populateMonthSelect('dobMonth', 12); 
    populateDaySelect('dobDay');
    populateYearSelect('dobYear');

    setupDOBFutureRestriction();
};

export const initializeContactValidation = () => {
    initializeFormValidation('contactForm', validateContactForm);
};

export const initializeEducationValidation = () => {
    initializeFormValidation('educationForm', validateEducationForm);
    
    populateMonthSelect('startMonth', 12); 
    populateYearSelect('startYear');
    populateMonthSelect('endMonth', 12); 
    populateYearSelect('endYear');
    
    setupStartDateFutureRestriction();
    setupEndDateRestriction(); 
    setupCurrentlyStudyingToggle(); 
};

export const initializeExperienceValidation = () => {
    initializeFormValidation('experienceForm', validateExperienceForm);

    populateMonthSelect('startMonth', 12); 
    populateYearSelect('startYear');
    populateMonthSelect('endMonth', 12); 
    populateYearSelect('endYear');
    
    setupExperienceStartDateRestriction();
    setupEndDateRestriction(); 
    setupCurrentlyWorkingToggle(); 
};
export const initializeSkillValidation = () => {
    initializeFormValidation('skillForm', validateSkillForm);
};

export const initializeAvailabilityValidation = () => {
    initializeFormValidation('availabilityForm', validateAvailabilityForm);
};