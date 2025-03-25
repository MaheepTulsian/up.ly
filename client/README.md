# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# up.ly - Job Search and Career Management Platform

A comprehensive platform for job seekers to manage their career development, featuring tools for resume building, cover letter creation, interview preparation, and job searching.

## Features

- **Resume Builder**: Create and manage professional resumes
- **Cover Letter Generator**: Generate tailored cover letters
- **Interview Preparation**: Practice interviews with feedback
- **Resource Library**: Access career development resources
- **Job Search**: Search for jobs across multiple platforms using public APIs

## Getting Started

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Job Search Feature

The job search feature uses JavaScript to fetch job listings from multiple public APIs:

### How It Works

1. **Multiple API Sources**: The application fetches job listings from:
   - Arbeitnow API (CORS-friendly)
   - Remotive.io API (requires CORS proxy)
   - RemoteOK API (requires CORS proxy)
   - Optional integration with JSearch API (requires RapidAPI key)

2. **No Backend Required**: All job fetching happens directly in the browser, eliminating the need for a Python backend.

3. **Fault Tolerance**: If one API fails, the system tries others before falling back to mock data.

### CORS Proxy Setup

For optimal functionality, activate the CORS proxy:

1. Visit https://cors-anywhere.herokuapp.com/corsdemo
2. Click "Request temporary access to the demo server"
3. Return to the application - it will now be able to access more job sources

### RapidAPI Integration (Optional)

For even more job listings:

1. Sign up for a free RapidAPI account at https://rapidapi.com/
2. Subscribe to the JSearch API: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
3. Get your API key from your RapidAPI dashboard
4. Update the API key in `src/lib/api.js` in the `fetchJSearchJobs` function
5. Uncomment the JSearch function call in the `fetchAllJobs` function

### Technical Implementation

The job search feature:

1. Uses fetch API to make requests to public job listing APIs
2. Uses a CORS proxy for APIs that have CORS restrictions
3. Handles data transformation from multiple API formats to a consistent job object structure
4. Provides graceful degradation with mock data when APIs are unavailable
5. Displays job listings with links to apply directly on the original job posting

## Troubleshooting Job Search

If you encounter issues with the job search feature:

### No jobs appearing
- Ensure you've activated the CORS proxy as described above
- Try different search terms or broaden your search
- Check the browser console for specific error messages

### CORS errors
- The application will notify you if the CORS proxy needs to be activated
- Click the link in the notification and follow the instructions
- Return to the app and try your search again

### Sample/Demo data showing instead of real jobs
- This happens when the APIs are unavailable or return no results for your search
- The system automatically falls back to demo data to demonstrate the interface
- Try a more common job title or location

### API rate limiting
- Some APIs may limit the number of requests you can make
- If you notice errors, try again after a short delay

### Adding more job sources
To add additional job sources:

1. Create a new fetch function in `src/lib/api.js`
2. Map the API response to the standard job object format
3. Add the new fetch function to the `fetchAllJobs` function
