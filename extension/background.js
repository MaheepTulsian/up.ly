// Configuration
const API_BASE_URL = 'http://localhost:8000/extension';

let currentUrl = '';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Form Assistant extension installed');
  

  chrome.contextMenus.create({
    id: 'extractCurrentField',
    title: 'Extract this field',
    contexts: ['editable']
  });

  chrome.contextMenus.create({
    id: 'extractAllFields',
    title: 'Extract all fields',
    contexts: ['page', 'editable']
  });
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Extension starting up');
});

chrome.runtime.onSuspendCanceled.addListener(() => { 
  console.log('Suspension cancelled'); 
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'extractCurrentField') {
    chrome.tabs.sendMessage(
      tab.id, 
      { action: 'extractCurrentField' },
      response => {
        if (chrome.runtime.lastError || !response) {
          console.error('Error extracting field:', chrome.runtime.lastError);
          return;
        }
        
        // Store the data and show a notification
        chrome.storage.local.set({ 'lastExtractedField': response }, () => {
          console.log('Field data saved');
          
          // Send to backend
          sendFormDataToBackend([response])
            .then(processedData => {
              console.log('Backend processed the field data:', processedData);
              
              // After getting backend data, immediately autofill the form
              // The sendFormDataToBackend function now returns the data array directly
              chrome.tabs.sendMessage(
                tab.id,
                { action: 'autofillForm', data: processedData },
                fillResponse => {
                  if (chrome.runtime.lastError || !fillResponse || !fillResponse.success) {
                    console.error('Error auto-filling form:', chrome.runtime.lastError);
                    return;
                  }
                  
                  // Show notification
                  chrome.notifications.create({
                    type: 'basic',
                    iconUrl: chrome.runtime.getURL('images/icon128.png'),
                    title: 'Form Assistant',
                    message: 'Field extracted and auto-filled'
                  });
                }
              );
            })
            .catch(err => {
              console.error('Error sending to backend:', err);
              handleBackendError(tab.id);
            });
        });
      }
    );
  } else if (info.menuItemId === 'extractAllFields') {
    chrome.tabs.sendMessage(
      tab.id,
      { action: 'extractFormData' },
      response => {
        if (chrome.runtime.lastError || !response) {
          console.error('Error extracting all fields:', chrome.runtime.lastError);
          return;
        }
        
        // Store the data
        chrome.storage.local.set({ 'lastExtractedFields': response }, () => {
          console.log('All field data saved');
          
          // Send to backend
          sendFormDataToBackend(response)
            .then(processedData => {
              console.log('Backend processed all form data:', processedData);
              
              // After getting backend data, immediately autofill the form
              // The sendFormDataToBackend function now returns the data array directly
              chrome.tabs.sendMessage(
                tab.id,
                { action: 'autofillForm', data: processedData },
                fillResponse => {
                  if (chrome.runtime.lastError || !fillResponse || !fillResponse.success) {
                    console.error('Error auto-filling form:', chrome.runtime.lastError);
                    return;
                  }
                  
                  // Show notification
                  chrome.notifications.create({
                    type: 'basic',
                    iconUrl: chrome.runtime.getURL('images/icon128.png'),
                    title: 'Form Assistant',
                    message: 'All fields extracted and auto-filled'
                  });
                }
              );
            })
            .catch(err => {
              console.error('Error sending to backend:', err);
              handleBackendError(tab.id);
            });
        });
      }
    );
  }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sendToBackend") {
    
    if (sender.tab) {
      currentUrl = sender.tab.url;
      chrome.storage.local.set({ 'lastActiveUrl': currentUrl });
    }
    
    sendFormDataToBackend(message.data)
      .then(processedData => {
        // Add the processed data to a success response
        sendResponse({ 
          success: true, 
          data: processedData 
        });
      })
      .catch(error => {
        console.error('Error sending to backend:', error);
        if (sender.tab) {
          handleBackendError(sender.tab.id);
        }
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the message channel open for async response
  } else if (message.action === "getFromBackend") {
    getFormDataFromBackend(message.url, message.formIdentifier)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => {
        console.error('Error getting from backend:', error);
        if (sender.tab) {
          handleBackendError(sender.tab.id);
        }
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the message channel open for async response
  }
});

// Function to send form data to backend
async function sendFormDataToBackend(formData) {
  try {
    // Get the active tab URL to include with the form data
    let pageUrl = currentUrl;
    
    if (!pageUrl) {
      try {
        // Try to get from storage if service worker was restarted
        const result = await chrome.storage.local.get('lastActiveUrl');
        if (result.lastActiveUrl) {
          pageUrl = result.lastActiveUrl;
        } else {
          // If still not available, get from active tab
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          pageUrl = tab.url;
        }
      } catch (err) {
        console.error('Error getting URL:', err);
        pageUrl = 'unknown';
      }
    }
    
    const payload = {
      url: pageUrl,
      formData: formData,
      timestamp: new Date().toISOString()
    };
    
    const response = await fetch(`${API_BASE_URL}/submit-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('Server response:', responseData);
    
    // Our server returns {success: true, message: string, data: array}
    // Extract the data array from the response
    if (responseData && responseData.data) {
      return responseData.data;
    }
    
    return responseData; // Return the whole response if it doesn't have the expected structure
  } catch (error) {
    console.error('Error sending form data to backend:', error);
    throw error;
  }
}

// Function to get form data from backend for autofill
async function getFormDataFromBackend(url, formIdentifier) {
  try {
    // Construct API endpoint with query parameters
    const endpoint = new URL(`${API_BASE_URL}/get-form-data`);
    endpoint.searchParams.append('url', url);
    if (formIdentifier) {
      endpoint.searchParams.append('formId', formIdentifier);
    }
    
    const response = await fetch(endpoint.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting form data from backend:', error);
    throw error;
  }
}

// Function to handle backend errors by filling form fields with error message
function handleBackendError(tabId) {
  // Create error data for autofill - each field will be filled with the error message
  chrome.tabs.sendMessage(
    tabId,
    { 
      action: 'autofillForm', 
      data: 'ERROR_SERVER_512' // Special code that the content script will recognize
    },
    function(response) {
      if (chrome.runtime.lastError || !response || !response.success) {
        console.error('Error applying error messages to form:', chrome.runtime.lastError);
      } else {
        console.log('Error messages applied to form fields');
        
        // Show notification with proper icon path
        chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('images/icon128.png'),
          title: 'Form Assistant',
          message: 'Error with server 512. Form fields updated with error message.'
        });
      }
    }
  );
} 