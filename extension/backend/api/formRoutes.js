const express = require('express');
const router = express.Router();
const { processFormData, getAutofillData } = require('../services/formService');

// Route to submit form data for processing
router.post('/submit-form', async (req, res) => {
  try {
    const { url, formData, timestamp } = req.body;
    
    if (!formData || !Array.isArray(formData)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid form data format'
      });
    }
    
    const processedData = await processFormData(url, formData);
    
    return res.status(200).json({
      success: true,
      message: 'Form data processed successfully',
      data: processedData
    });
  } catch (error) {
    console.error('Error processing form data:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Route to get form data for autofill
router.get('/get-form-data', async (req, res) => {
  try {
    const { url, formId } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL parameter is required'
      });
    }
    
    const autofillData = await getAutofillData(url, formId);
    
    return res.status(200).json(autofillData);
  } catch (error) {
    console.error('Error retrieving form data:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

module.exports = router; 