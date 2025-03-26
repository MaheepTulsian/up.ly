document.addEventListener('DOMContentLoaded', function() {
  const extractBtn = document.getElementById('extractBtn');
  const extractCurrentBtn = document.getElementById('extractCurrentBtn');
  const autofillBtn = document.getElementById('autofillBtn');
  const statusDiv = document.getElementById('status');
  const formDataPre = document.getElementById('formData');
  
  let currentFormData = null;
  let currentUrl = '';
  
  // Helper function to show status messages
  function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.className = isError ? 'status error' : 'status success';
  }
  
  // Get the current tab information
  async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentUrl = tab.url;
    return tab;
  }
  
  // Extract all form data button click handler
  extractBtn.addEventListener('click', async function() {
    try {
      extractBtn.disabled = true;
      showStatus('Extracting all form data...');
      
      const tab = await getCurrentTab();
      
      // Send message to content script to extract form data
      chrome.tabs.sendMessage(tab.id, { action: 'extractFormData' }, async function(response) {
        if (chrome.runtime.lastError) {
          showStatus('Error: ' + chrome.runtime.lastError.message, true);
          extractBtn.disabled = false;
          return;
        }
        
        if (!response || response.length === 0) {
          showStatus('No form fields found on this page', true);
          extractBtn.disabled = false;
          return;
        }
        
        // Store the extracted form data
        currentFormData = response;
        
        // Display the data in the popup
        formDataPre.textContent = JSON.stringify(response, null, 2);
        formDataPre.style.display = 'block';
        
        // Send the data to the backend
        chrome.runtime.sendMessage(
          { action: 'sendToBackend', data: currentFormData },
          function(backendResponse) {
            if (chrome.runtime.lastError) {
              showStatus('Browser error: ' + chrome.runtime.lastError.message, true);
              extractBtn.disabled = false;
              return;
            }
            
            if (!backendResponse || !backendResponse.success) {
              const errorMsg = backendResponse?.error || 'Unknown error';
              if (errorMsg.includes('Server responded with status') || errorMsg.includes('NetworkError')) {
                showStatus('Error with server 512. Form fields will be filled with error message.', true);
              } else {
                showStatus('Error sending to backend: ' + errorMsg, true);
              }
              extractBtn.disabled = false;
              return;
            }
            
            // We got successful data from the backend
            showStatus('Form data processed. Auto-filling form...');
            console.log('Backend response:', backendResponse);
            
            // Get the processed data from the backendResponse
            // It might be in backendResponse.data.data (if server returns {data: {success: true, data: [...]}})
            // or in backendResponse.data (if server returns {success: true, data: [...]})
            let processedData;
            if (backendResponse.data && Array.isArray(backendResponse.data)) {
              processedData = backendResponse.data;
            } else if (backendResponse.data && backendResponse.data.data && Array.isArray(backendResponse.data.data)) {
              processedData = backendResponse.data.data;
            } else {
              showStatus('Unexpected data format from backend', true);
              console.error('Unexpected data format:', backendResponse);
              extractBtn.disabled = false;
              return;
            }
            
            // Automatically fill the form with the processed data
            chrome.tabs.sendMessage(
              tab.id, 
              { action: 'autofillForm', data: processedData },
              function(fillResponse) {
                if (chrome.runtime.lastError || !fillResponse || !fillResponse.success) {
                  showStatus('Error auto-filling form: ' + 
                    (chrome.runtime.lastError?.message || 'Unknown error'), true);
                } else {
                  showStatus('Form data extracted and auto-filled successfully');
                }
                extractBtn.disabled = false;
              }
            );
          }
        );
      });
    } catch (error) {
      showStatus('Error: ' + error.message, true);
      extractBtn.disabled = false;
    }
  });
  
  // Extract current focused field button click handler
  extractCurrentBtn.addEventListener('click', async function() {
    try {
      extractCurrentBtn.disabled = true;
      showStatus('Extracting current field...');
      
      const tab = await getCurrentTab();
      
      // Send message to content script to extract current field
      chrome.tabs.sendMessage(tab.id, { action: 'extractCurrentField' }, async function(response) {
        if (chrome.runtime.lastError) {
          showStatus('Error: ' + chrome.runtime.lastError.message, true);
          extractCurrentBtn.disabled = false;
          return;
        }
        
        if (!response) {
          showStatus('No form field currently focused', true);
          extractCurrentBtn.disabled = false;
          return;
        }
        
        // Store the extracted field data
        currentFormData = [response]; // Wrap in array to match format expected by backend
        
        // Display the data in the popup
        formDataPre.textContent = JSON.stringify(response, null, 2);
        formDataPre.style.display = 'block';
        
        // Send the data to the backend
        chrome.runtime.sendMessage(
          { action: 'sendToBackend', data: currentFormData },
          function(backendResponse) {
            if (chrome.runtime.lastError) {
              showStatus('Browser error: ' + chrome.runtime.lastError.message, true);
              extractCurrentBtn.disabled = false;
              return;
            }
            
            if (!backendResponse || !backendResponse.success) {
              const errorMsg = backendResponse?.error || 'Unknown error';
              if (errorMsg.includes('Server responded with status') || errorMsg.includes('NetworkError')) {
                showStatus('Error with server 512. Form fields will be filled with error message.', true);
              } else {
                showStatus('Error sending to backend: ' + errorMsg, true);
              }
              extractCurrentBtn.disabled = false;
              return;
            }
            
            // We got successful data from the backend
            showStatus('Field data processed. Auto-filling form...');
            console.log('Backend response for current field:', backendResponse);
            
            // Get the processed data from the backendResponse
            // It might be in backendResponse.data.data (if server returns {data: {success: true, data: [...]}})
            // or in backendResponse.data (if server returns {success: true, data: [...]})
            let processedData;
            if (backendResponse.data && Array.isArray(backendResponse.data)) {
              processedData = backendResponse.data;
            } else if (backendResponse.data && backendResponse.data.data && Array.isArray(backendResponse.data.data)) {
              processedData = backendResponse.data.data;
            } else {
              showStatus('Unexpected data format from backend', true);
              console.error('Unexpected data format:', backendResponse);
              extractCurrentBtn.disabled = false;
              return;
            }
            
            // Automatically fill the form with the processed data
            chrome.tabs.sendMessage(
              tab.id, 
              { action: 'autofillForm', data: processedData },
              function(fillResponse) {
                if (chrome.runtime.lastError || !fillResponse || !fillResponse.success) {
                  showStatus('Error auto-filling form: ' + 
                    (chrome.runtime.lastError?.message || 'Unknown error'), true);
                } else {
                  showStatus('Field data extracted and auto-filled successfully');
                }
                extractCurrentBtn.disabled = false;
              }
            );
          }
        );
      });
    } catch (error) {
      showStatus('Error: ' + error.message, true);
      extractCurrentBtn.disabled = false;
    }
  });
  
  // Autofill form button click handler
  autofillBtn.addEventListener('click', async function() {
    try {
      autofillBtn.disabled = true;
      showStatus('Fetching form data from backend...');
      
      const tab = await getCurrentTab();
      
      // Get form data from backend for autofill
      chrome.runtime.sendMessage(
        { action: 'getFromBackend', url: currentUrl },
        function(backendResponse) {
          if (chrome.runtime.lastError || !backendResponse || !backendResponse.success) {
            showStatus('Error fetching form data: ' + 
              (backendResponse?.error || chrome.runtime.lastError?.message || 'Unknown error'), true);
            autofillBtn.disabled = false;
            return;
          }
          
          const autofillData = backendResponse.data;
          
          if (!autofillData || !Array.isArray(autofillData) || autofillData.length === 0) {
            showStatus('No form data available for this page', true);
            autofillBtn.disabled = false;
            return;
          }
          
          // Send autofill data to content script
          chrome.tabs.sendMessage(
            tab.id, 
            { action: 'autofillForm', data: autofillData },
            function(response) {
              if (chrome.runtime.lastError || !response || !response.success) {
                showStatus('Error autofilling form: ' + 
                  (chrome.runtime.lastError?.message || 'Unknown error'), true);
              } else {
                showStatus('Form autofilled successfully');
              }
              autofillBtn.disabled = false;
            }
          );
        }
      );
    } catch (error) {
      showStatus('Error: ' + error.message, true);
      autofillBtn.disabled = false;
    }
  });
  
  // Initialize popup
  getCurrentTab();
}); 