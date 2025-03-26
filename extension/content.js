// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractFormData") {
    const formData = extractFormFields();
    sendResponse(formData);
  } else if (message.action === "extractCurrentField") {
    const currentFieldData = extractCurrentFocusedField();
    sendResponse(currentFieldData);
  } else if (message.action === "autofillForm") {
    autofillForm(message.data);
    sendResponse({ success: true });
  }
  return true; // Keep the message channel open for async response
});

// Extract just the currently focused input field
function extractCurrentFocusedField() {
  // Get the currently focused element
  const focusedElement = document.activeElement;
  
  // Check if it's a form input element
  if (!focusedElement || !['INPUT', 'SELECT', 'TEXTAREA'].includes(focusedElement.tagName)) {
    return null; // Not a form input element
  }
  
  // Find the form this input belongs to (if any)
  const parentForm = focusedElement.closest('form');
  let formIndex = -1;
  
  if (parentForm) {
    // Find the form index
    const forms = document.querySelectorAll('form');
    formIndex = Array.from(forms).indexOf(parentForm);
    
    // Find the field index within the form
    const formInputs = parentForm.querySelectorAll('input, select, textarea');
    const fieldIndex = Array.from(formInputs).indexOf(focusedElement);
  }
  
  // Try to find associated label
  let labelText = '';
  
  // Check for 'for' attribute matching input id
  if (focusedElement.id) {
    const label = document.querySelector(`label[for="${focusedElement.id}"]`);
    if (label) {
      labelText = label.textContent.trim();
    }
  }
  
  // If no label found, check for parent label
  if (!labelText && focusedElement.closest('label')) {
    labelText = focusedElement.closest('label').textContent.trim();
    // Remove the inner input value from the label text if present
    if (focusedElement.value) {
      labelText = labelText.replace(focusedElement.value, '').trim();
    }
  }
  
  // If still no label, check for any label-like text nearby
  if (!labelText) {
    // Check preceding element or parent's preceding element for text
    const prevSibling = focusedElement.previousElementSibling || 
                      (focusedElement.parentElement && focusedElement.parentElement.previousElementSibling);
    if (prevSibling && !prevSibling.querySelector('input, select, textarea')) {
      labelText = prevSibling.textContent.trim();
    }
  }
  
  // Try to find any heading elements above this input
  if (!labelText) {
    let currentEl = focusedElement;
    while (currentEl && currentEl.tagName !== 'BODY') {
      // Check for headings above this element
      currentEl = currentEl.previousElementSibling;
      if (currentEl && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LEGEND'].includes(currentEl.tagName)) {
        labelText = currentEl.textContent.trim();
        break;
      }
    }
  }
  
  // If no clear label found but has placeholder, use that
  if (!labelText && focusedElement.placeholder) {
    labelText = focusedElement.placeholder;
  }
  
  // If no label found but has aria-label, use that
  if (!labelText && focusedElement.getAttribute('aria-label')) {
    labelText = focusedElement.getAttribute('aria-label');
  }
  
  // Collect field information
  return {
    formIndex,
    type: focusedElement.type || focusedElement.tagName.toLowerCase(),
    name: focusedElement.name || '',
    id: focusedElement.id || '',
    labelText: labelText,
    value: focusedElement.value || '',
    placeholder: focusedElement.placeholder || ''
  };
}

// Extract all form fields and their details from the current page
function extractFormFields() {
  const formFields = [];
  const forms = document.querySelectorAll('form');
  
  forms.forEach((form, formIndex) => {
    const formInputs = form.querySelectorAll('input, select, textarea');
    
    formInputs.forEach((input, index) => {
      // Try to find associated label
      let labelText = '';
      
      // Check for 'for' attribute matching input id
      if (input.id) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) {
          labelText = label.textContent.trim();
        }
      }
      
      // If no label found, check for parent label
      if (!labelText && input.closest('label')) {
        labelText = input.closest('label').textContent.trim();
        // Remove the inner input value from the label text if present
        if (input.value) {
          labelText = labelText.replace(input.value, '').trim();
        }
      }
      
      // If still no label, check for any label-like text nearby
      if (!labelText) {
        // Check preceding element or parent's preceding element for text
        const prevSibling = input.previousElementSibling || 
                            (input.parentElement && input.parentElement.previousElementSibling);
        if (prevSibling && !prevSibling.querySelector('input, select, textarea')) {
          labelText = prevSibling.textContent.trim();
        }
      }
      
      // If no clear label found but has placeholder, use that
      if (!labelText && input.placeholder) {
        labelText = input.placeholder;
      }
      
      // Collect field information
      const fieldInfo = {
        formIndex,
        fieldIndex: index,
        type: input.type || input.tagName.toLowerCase(),
        name: input.name || '',
        id: input.id || '',
        labelText: labelText,
        value: input.value || '',
        placeholder: input.placeholder || ''
      };
      
      formFields.push(fieldInfo);
    });
  });
  
  return formFields;
}

// Autofill form fields based on provided data
function autofillForm(formData) {
  if (!formData) {
    console.error('Invalid form data for autofill');
    return;
  }
  
  // Special case for server error
  if (formData === 'ERROR_SERVER_512') {
    fillAllFieldsWithErrorMessage();
    return;
  }
  
  if (!Array.isArray(formData)) {
    console.error('Invalid form data format for autofill');
    return;
  }
  
  const forms = document.querySelectorAll('form');
  
  formData.forEach(field => {
    let targetInput;
    
    // Try to find by form index and field index
    if (typeof field.formIndex === 'number' && typeof field.fieldIndex === 'number') {
      const form = forms[field.formIndex];
      if (form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        targetInput = inputs[field.fieldIndex];
      }
    }
    
    // If not found, try by ID
    if (!targetInput && field.id) {
      targetInput = document.getElementById(field.id);
    }
    
    // If not found, try by name
    if (!targetInput && field.name) {
      const inputs = document.querySelectorAll(`[name="${field.name}"]`);
      if (inputs.length === 1) {
        targetInput = inputs[0];
      }
    }
    
    // If target found, fill it
    if (targetInput && field.value) {
      // Handle different input types
      if (targetInput.type === 'checkbox' || targetInput.type === 'radio') {
        targetInput.checked = field.value === 'true' || field.value === true;
      } else if (targetInput.tagName.toLowerCase() === 'select') {
        const option = Array.from(targetInput.options).find(opt => 
          opt.value === field.value || opt.textContent.trim() === field.value);
        if (option) {
          targetInput.value = option.value;
        }
      } else {
        targetInput.value = field.value;
      }
      
      // Dispatch change event to trigger any listeners
      targetInput.dispatchEvent(new Event('change', { bubbles: true }));
      targetInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
}

// Fill all form fields with error message when server has an issue
function fillAllFieldsWithErrorMessage() {
  // Get all forms on the page
  const forms = document.querySelectorAll('form');
  const errorMessage = "Error with server 512";
  
  forms.forEach(form => {
    // Get all input elements in the form
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      // Skip hidden, submit, button, and other non-data fields
      if (['hidden', 'submit', 'button', 'image', 'file', 'reset'].includes(input.type)) {
        return;
      }
      
      // Handle different input types
      if (input.type === 'checkbox' || input.type === 'radio') {
        // Just check these since we can't fill them with text
        input.checked = true;
      } else if (input.tagName.toLowerCase() === 'select') {
        // For select elements, select the first option if available
        if (input.options.length > 0) {
          input.selectedIndex = 0;
        }
      } else {
        // For text inputs, textareas, etc.
        input.value = errorMessage;
      }
      
      // Dispatch change event to trigger any listeners
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });
  
  return { success: true };
} 