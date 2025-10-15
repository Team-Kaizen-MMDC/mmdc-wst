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


const setValidationState = (element, isValid, feedbackId = null, message = null) => {
    if (!element) return;
    element.classList.remove('is-valid', 'is-invalid');
    
    if (isValid) {
        element.classList.add('is-valid');
    } else {
        element.classList.add('is-invalid');
    }

    // Update custom feedback message (for fields like password/confirm password)
    if (feedbackId && message) {
        const feedbackElement = document.getElementById(feedbackId);
        if (feedbackElement) {
            feedbackElement.textContent = isValid ? '' : message;
        }
    }
};

// ===================================================================
// Login Form Validation Function
// ===================================================================

export const initializeLoginValidation = () => {
    console.log('Login Module: initializeLoginValidation is running.');
    const form = document.getElementById('loginForm'); 
    
    if (!form) {
        console.error('Login Module: Form with ID "loginForm" not found. Cannot attach validation.');
        return;
    }

    const inputElements = {
        email: document.getElementById('email'),
        password: document.getElementById('password'),
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log('Login Module: Handling submit event. Default prevented.');

        let formValid = true;

        // 1. Email Check: Must be present and valid format (checked via checkValidity)
        const isEmailValid = inputElements.email.value.trim() !== '' && inputElements.email.checkValidity();
        setValidationState(inputElements.email, isEmailValid);
        if (!isEmailValid) formValid = false;

        // 2. Password Check: Simple minimum length check for LOGIN
        const isPasswordValid = inputElements.password.value.length >= 8; 
        setValidationState(inputElements.password, isPasswordValid);
        if (!isPasswordValid) formValid = false;

        if (formValid) {
            console.log('Login validation successful. Proceeding to server/redirect.');
            form.submit();
        } else {
            console.log('Login validation failed. Errors displayed.');
        }
    };

    // Main event listener to the form submission
    form.addEventListener('submit', handleSubmit, false);
    console.log('Login Module: Validation listener successfully attached to loginForm.');
};
