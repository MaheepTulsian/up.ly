const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API with better error handling
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBvO5J0xmb37w6-3xm963ImtV1Juotkyj4';
console.log(`Gemini API Key status: ${apiKey === 'AIzaSyBvO5J0xmb37w6-3xm963ImtV1Juotkyj4' ? 'Not configured' : 'Configured (hidden for security)'}`);

let genAI;
try {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log('Gemini API client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Gemini API client:', error);
  genAI = null;
}

// Load profile data
let profileData = [{
  "_id": "67d854e46af0e3f8c3993926",
  "skills": [
    "C",
    "C++",
    "Java",
    "HTML",
    "CSS",
    "JavaScript",
    "Python",
    "Tailwind",
    "MUI",
    "Node.js",
    "Express.js",
    "React",
    "Redux",
    "Zustand",
    "Neo4j",
    "Charts.js",
    "nivo",
    "Solidity",
    "Thirdweb",
    "MySQL",
    "MongoDB",
    "Git/GitHub"
  ],
  "projects": [
    {
      "title": " Ashwini",
      "description": "Developed a user-friendly interface for real-time drug inventory tracking, reducing tracking errors by 30% \nand ensuring accessibility across all devices. Also designed dashboards with clear layouts and integrated \ndata visualization tools, improving decision-making by 40% and allowing real-time inventory monitoring.",
      "startDate": "2024-09-12T00:00:00.000Z",
      "endDate": "2024-09-16T00:00:00.000Z",
      "technologiesUsed": [
        "MongoDB",
        "React",
        "Express",
        "Node",
        "Tailwind",
        "Python",
        "Neo4j"
      ],
      "projectLink": "https://drug-inventory-and-supply-chain.vercel.app",
      "isOpenSource": false
    },
    {
      "title": " AutoMeet",
      "description": " Developed an AI-driven system to automate meetings, reducing moderators' workload by 70%",
      "startDate": "2024-02-10T00:00:00.000Z",
      "endDate": "2024-02-14T00:00:00.000Z",
      "technologiesUsed": [
        "python"
      ],
      "projectLink": "https://github.com/MaheepTulsian/Video_Conference_Automation_Bot",
      "isOpenSource": true
    }
  ],
  "workEx": [
    {
      "company": "Techsnap Educations LLP",
      "position": " AI Research Intern",
      "startDate": "2025-03-26T00:00:00.000Z",
      "endDate": null,
      "description": "Exploring LLM hosting, AI agent development, and model fine-tuning while learning about scalable \ndeployments, multi-modal AI, RAG, and responsible AI practices",
      "isCurrent": true
    },
    {
      "company": "Next Tech Lab, AP",
      "position": " Member",
      "startDate": "2023-10-01T00:00:00.000Z",
      "endDate": null,
      "description": "Contributing to a QS-ranked, student-led research and development lab as a member of Norman Lab, \nspecializing in Full Stack Development",
      "isCurrent": true
    }
  ],
  "certifications": [
    {
      "name": "AWS Cloud Practitioner",
      "issuingOrganization": "Amazon Web Services",
      "issueDate": "2023-05-10T00:00:00.000Z",
      "expirationDate": "2030-10-30T00:00:00.000Z",
      "credentialId": "AWS-12345",
      "credentialURL": "https://aws.amazon.com/certification/verify/"
    }
  ],
  "achievements": [
    {
      "title": "Winner, Unfold'24 - CoinBase Track",
      "description": "Built an SMS-based crypto transaction protocol using MPC architecture to enable secure, scalable, and \naccessible cryptocurrency transactions in India without internet or smartphones.",
      "date": "2024-02-12T00:00:00.000Z",
      "issuer": "Devfolio"
    }
  ],
  "publications": [
    {
      "title": "AI in Healthcare",
      "publisher": "Springer",
      "publicationDate": "2022-06-15T00:00:00.000Z",
      "description": "Research paper on AI applications in healthcare.",
      "link": "https://example.com/ai-healthcare"
    }
  ],
  "createdAt": "2025-03-17T16:59:16.275Z",
  "updatedAt": "2025-03-25T23:47:41.371Z",
  "__v": 0,
  "personalInfo": {
    "address": {
      "street": "Mahmoorganj",
      "city": "Varanasi",
      "state": "Uttar Pradesh"
    },
    "dateOfBirth": "2003-09-24T00:00:00.000Z",
    "email": "maheep@gmail.com",
    "firstName": "Maheep",
    "lastName": "Tulsyan",
    "phone": "9307775556",
    "resume": "https://example.com/resume.pdf"
  },
  "socials": {
    "linkedIn": "https://www.linkedin.com/in/maheeptulsian",
    "github": "https://github.com/MaheepTulsian",
    "website": "http://maheeptulsyan.me"
  },
  "academic": [
    {
      "institution": "St. John's Convent School",
      "degree": "High School",
      "fieldOfStudy": "Science",
      "startDate": "2018-03-01T00:00:00.000Z",
      "endDate": "2020-03-31T00:00:00.000Z",
      "description": "Completed high school with Science stream.",
      "grade": "A"
    },
    {
      "institution": "SRM University AP",
      "degree": "B.Tech",
      "fieldOfStudy": "Computer Science",
      "startDate": "2022-08-10T00:00:00.000Z",
      "endDate": "2026-10-01T00:00:00.000Z",
      "description": "💻 Software Engineer | Bridging Ideas and Technology for Seamless Digital Transformations | Crafting Efficient Code 💡",
      "grade": "A"
    }
  ]
}
]; // Initialize empty array

// Function to fetch profile data from your API
// async function fetchProfileData(userId = "67d854e46af0e3f8c3993926") {
//   try {
//     const response = await fetch(
//       `http://localhost:8000/api/v1/${userId}/getprofile`
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch profile data");
//     }

//     const data = await response.json();
//     profileData = data; // Update profileData dynamically
//     console.log("Profile data updated:", profileData);
//   } catch (error) {
//     console.error("Error fetching profile:", error);
//     return null;
//   }
// }

// // Example Usage:
// // Fetch once when the page loads
// fetchProfileData();

// // (Optional) Fetch periodically (e.g., every 30 seconds)
// setInterval(() => fetchProfileData(), 80000);
// Cache for processed form data
const processedFormCache = new Map();

// Process form data using Gemini
async function processFormData(url, formData) {
  try {
    console.log(`Processing form data for URL: ${url}`);
    console.log(`Form fields count: ${formData.length}`);
    
    // Store the original form data in cache
    const cacheKey = url;
    processedFormCache.set(cacheKey, {
      url,
      originalForm: formData,
      processedForm: formData, // We'll update this with Gemini responses
      timestamp: new Date().toISOString()
    });
    
    // For each field, try to find matching data in profiles using Gemini
    const enhancedFormData = await Promise.all(formData.map(async (field) => {
      // Skip if already has a value
      if (field.value) {
        return field;
      }
      
      // Skip password fields as requested
      if (isPasswordField(field)) {
        console.log(`Skipping password field: ${field.labelText || field.name || field.id}`);
        return field;
      }
      
      try {
        // If the field has a label, try to get a recommendation
        let recommendation = '';
        if (field.labelText) {
          recommendation = await getGeminiRecommendation(field.labelText, url, profileData);
        }
        
        // If no recommendation found, generate a custom value
        if (!recommendation) {
          recommendation = generateCustomValue(field);
        }
        
        // Update the processed form in cache
        const updatedField = { ...field, value: recommendation };
        
        // Update the cache
        const cachedData = processedFormCache.get(cacheKey);
        if (cachedData) {
          const updatedProcessedForm = cachedData.processedForm.map(f => 
            f.fieldIndex === field.fieldIndex && f.formIndex === field.formIndex ? updatedField : f
          );
          processedFormCache.set(cacheKey, {
            ...cachedData,
            processedForm: updatedProcessedForm
          });
        }
        
        return updatedField;
      } catch (error) {
        console.error(`Error processing field "${field.labelText}":`, error);
        // Even if there's an error, try to fill with a custom value
        const customValue = generateCustomValue(field);
        return { ...field, value: customValue };
      }
    }));
    
    return enhancedFormData;
  } catch (error) {
    console.error('Error in processFormData:', error);
    throw error;
  }
}

// Helper function to check if a field is a password field
function isPasswordField(field) {
  // Check type, name, id, and label for password indicators
  const passwordIndicators = ['password', 'pwd', 'pass', 'secret'];
  
  // Check field type
  if (field.type && field.type.toLowerCase() === 'password') {
    return true;
  }
  
  // Check field name, id, and label
  const fieldAttributes = [
    field.name, 
    field.id, 
    field.labelText, 
    field.placeholder
  ].filter(Boolean).map(attr => attr.toLowerCase());
  
  return fieldAttributes.some(attr => 
    passwordIndicators.some(indicator => attr.includes(indicator))
  );
}

// Helper function to generate custom values for different field types
function generateCustomValue(field) {
  const fieldType = (field.type || '').toLowerCase();
  const fieldName = (field.name || '').toLowerCase();
  const fieldLabel = (field.labelText || '').toLowerCase();
  const fieldId = (field.id || '').toLowerCase();
  
  // Identify field purpose
  const isNameField = containsAny(['name', 'fullname', 'full name', 'first name', 'firstname', 'last name', 'lastname'], [fieldName, fieldLabel, fieldId]);
  const isEmailField = containsAny(['email', 'e-mail'], [fieldName, fieldLabel, fieldId]);
  const isPhoneField = containsAny(['phone', 'mobile', 'cell', 'telephone'], [fieldName, fieldLabel, fieldId]);
  const isAddressField = containsAny(['address', 'street'], [fieldName, fieldLabel, fieldId]);
  const isCityField = containsAny(['city', 'town'], [fieldName, fieldLabel, fieldId]);
  const isStateField = containsAny(['state', 'province', 'region'], [fieldName, fieldLabel, fieldId]);
  const isZipField = containsAny(['zip', 'postal', 'postcode'], [fieldName, fieldLabel, fieldId]);
  const isCountryField = containsAny(['country', 'nation'], [fieldName, fieldLabel, fieldId]);
  const isDobField = containsAny(['dob', 'birth', 'birthday', 'date of birth'], [fieldName, fieldLabel, fieldId]);
  const isAgeField = containsAny(['age', 'years old'], [fieldName, fieldLabel, fieldId]);
  
  // Return appropriate values based on field type
  if (isNameField) {
    return 'John Doe';
  } else if (isEmailField) {
    return 'example@mail.com';
  } else if (isPhoneField) {
    return '555-123-4567';
  } else if (isAddressField) {
    return '123 Main Street';
  } else if (isCityField) {
    return 'New York';
  } else if (isStateField) {
    return 'NY';
  } else if (isZipField) {
    return '10001';
  } else if (isCountryField) {
    return 'United States';
  } else if (isDobField) {
    return '01/01/1990';
  } else if (isAgeField) {
    return '30';
  } else if (fieldType === 'checkbox') {
    return 'true';
  } else if (fieldType === 'radio') {
    return 'true';
  } else if (fieldType === 'date') {
    return '2023-01-01';
  } else if (fieldType === 'number') {
    return '1';
  } else {
    // Default text value
    return 'AutoFill Value';
  }
}

// Helper to check if any of the needles appear in any of the haystacks
function containsAny(needles, haystacks) {
  for (const haystack of haystacks) {
    if (haystack) {
      for (const needle of needles) {
        if (haystack.includes(needle)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Get autofill data for a form
async function getAutofillData(url, formId) {
  try {
    console.log(`Getting autofill data for URL: ${url}, FormID: ${formId || 'any'}`);
    
    // Check if we have cached data for this URL
    const cacheKey = url;
    const cachedData = processedFormCache.get(cacheKey);
    
    if (cachedData) {
      console.log(`Found cached data for URL: ${url}`);
      return {
        success: true,
        data: cachedData.processedForm
      };
    }
    
    // If no cached data, return profiles data based on form fields
    // In a real implementation, this would be more sophisticated
    console.log(`No cached data found, returning default profile data`);
    
    // Return the first profile as a fallback
    if (profileData.length > 0) {
      return {
        success: true,
        data: Object.entries(profileData[0]).map(([key, value], index) => ({
          formIndex: 0,
          fieldIndex: index,
          name: key,
          labelText: key,
          value: value.toString(),
          type: typeof value === 'boolean' ? 'checkbox' : 'text'
        }))
      };
    }
    
    return {
      success: false,
      error: 'No profile data available'
    };
  } catch (error) {
    console.error('Error in getAutofillData:', error);
    throw error;
  }
}

// Function to get recommendations from Gemini
async function getGeminiRecommendation(fieldLabel, url, profiles) {
  try {
    // Skip Gemini if no API key configured or if client initialization failed
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE' || genAI === null) {
      console.log('Skipping Gemini (no API key or client initialization failed) for field:', fieldLabel);
      return fallbackMatching(fieldLabel, profiles);
    }
    
    // Initialize Gemini model - try available models in order
    let model;
    try {
      // Try gemini-1.5-pro first (latest model)
      console.log('Using gemini-1.5-pro model');
      model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    } catch (modelError) {
      console.log('Error with gemini-1.5-pro model, trying gemini-1.0-pro...');
      try {
        // Try gemini-1.0-pro next
        model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
      } catch (altModelError) {
        console.log('Error with gemini-1.0-pro model, trying gemini-pro...');
        try {
          // Try the original gemini-pro as last resort
          model = genAI.getGenerativeModel({ model: "gemini-pro" });
        } catch (originalModelError) {
          console.error('Could not initialize any Gemini models:', originalModelError.message);
          // Fall back to direct matching if model initialization fails
          return fallbackMatching(fieldLabel, profiles);
        }
      }
    }
    
    // Convert profiles to string for Gemini prompt
    const profilesStr = JSON.stringify(profiles, null, 2);
    
    // Create prompt for Gemini
    const prompt = `
    I have a form field with the label: "${fieldLabel}" on the webpage with URL: ${url}.
    I need to fill it with the most appropriate value from these user profiles:
    
    ${profilesStr}
    
    Please provide ONLY the value that would best fit this form field, with no explanation or additional text.
    If nothing matches, just return an empty string.`;
    
    try {
      // Generate content with Gemini
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const recommendedValue = response.text().trim();
      
      console.log(`Gemini recommendation for "${fieldLabel}": ${recommendedValue}`);
      return recommendedValue;
    } catch (generationError) {
      console.error('Error generating content with Gemini:', generationError);
      // Fall back to direct matching if content generation fails
      return fallbackMatching(fieldLabel, profiles);
    }
  } catch (error) {
    console.error('Error getting Gemini recommendation:', error);
    return fallbackMatching(fieldLabel, profiles); // Fall back to direct matching
  }
}

// Helper function for fallback matching logic
function fallbackMatching(fieldLabel, profiles) {
  console.log('Using fallback matching for field:', fieldLabel);
  
  // Skip password fields
  if (isPasswordField({ labelText: fieldLabel })) {
    console.log(`Skipping password field in fallback matching: ${fieldLabel}`);
    return '';
  }
  
  // Direct field matching
  for (const profile of profiles) {
    // Try exact match first
    if (profile[fieldLabel]) {
      return profile[fieldLabel].toString();
    }
    
    // Try case-insensitive match
    const caseInsensitiveKey = Object.keys(profile).find(
      key => key.toLowerCase() === fieldLabel.toLowerCase()
    );
    
    if (caseInsensitiveKey) {
      return profile[caseInsensitiveKey].toString();
    }
    
    // Try partial match - field label contained in profile key
    const partialMatchKey = Object.keys(profile).find(
      key => key.toLowerCase().includes(fieldLabel.toLowerCase()) || 
             fieldLabel.toLowerCase().includes(key.toLowerCase())
    );
    
    if (partialMatchKey) {
      return profile[partialMatchKey].toString();
    }
  }
  
  // Generate a custom value for non-matching fields
  return generateCustomValue({ labelText: fieldLabel });
}

module.exports = {
  processFormData,
  getAutofillData
}; 