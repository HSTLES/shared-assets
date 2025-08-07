/**
 * HSTLES HTMX Loading State Manager
 * Handles loading states, form disabling, and spinner activation for HTMX requests
 */
document.addEventListener('DOMContentLoaded', function() {
  
  // Add loading state management for HTMX requests
  document.body.addEventListener('htmx:beforeRequest', function(evt) {
    const target = evt.detail.elt;
    
    // Add loading class to the element
    target.classList.add('htmx-request');
    
    // Disable form elements if it's a form
    if (target.tagName === 'FORM') {
      const inputs = target.querySelectorAll('input, button, select, textarea');
      inputs.forEach(input => {
        input.disabled = true;
      });
    }
    
    // If it's a button, disable it
    if (target.tagName === 'BUTTON') {
      target.disabled = true;
    }
    
    // If it's an element with a form parent, disable the parent form
    const parentForm = target.closest('form');
    if (parentForm) {
      const inputs = parentForm.querySelectorAll('input, button, select, textarea');
      inputs.forEach(input => {
        input.disabled = true;
      });
    }
  });
  
  document.body.addEventListener('htmx:afterRequest', function(evt) {
    const target = evt.detail.elt;
    
    // Remove loading class
    target.classList.remove('htmx-request');
    
    // Re-enable form elements
    if (target.tagName === 'FORM') {
      const inputs = target.querySelectorAll('input, button, select, textarea');
      inputs.forEach(input => {
        input.disabled = false;
      });
    }
    
    // If it's a button, re-enable it
    if (target.tagName === 'BUTTON') {
      target.disabled = false;
    }
    
    // If it's an element with a form parent, re-enable the parent form
    const parentForm = target.closest('form');
    if (parentForm) {
      const inputs = parentForm.querySelectorAll('input, button, select, textarea');
      inputs.forEach(input => {
        input.disabled = false;
      });
    }
  });
  
  // Handle network errors
  document.body.addEventListener('htmx:responseError', function(evt) {
    const target = evt.detail.elt;
    target.classList.remove('htmx-request');
    
    // Re-enable form elements on error
    if (target.tagName === 'FORM') {
      const inputs = target.querySelectorAll('input, button, select, textarea');
      inputs.forEach(input => {
        input.disabled = false;
      });
    }
    
    if (target.tagName === 'BUTTON') {
      target.disabled = false;
    }
    
    // If it's an element with a form parent, re-enable the parent form
    const parentForm = target.closest('form');
    if (parentForm) {
      const inputs = parentForm.querySelectorAll('input, button, select, textarea');
      inputs.forEach(input => {
        input.disabled = false;
      });
    }
  });
  
  // Handle timeout errors
  document.body.addEventListener('htmx:timeout', function(evt) {
    const target = evt.detail.elt;
    target.classList.remove('htmx-request');
    
    // Re-enable form elements on timeout
    if (target.tagName === 'FORM') {
      const inputs = target.querySelectorAll('input, button, select, textarea');
      inputs.forEach(input => {
        input.disabled = false;
      });
    }
    
    if (target.tagName === 'BUTTON') {
      target.disabled = false;
    }
    
    const parentForm = target.closest('form');
    if (parentForm) {
      const inputs = parentForm.querySelectorAll('input, button, select, textarea');
      inputs.forEach(input => {
        input.disabled = false;
      });
    }
  });
});
