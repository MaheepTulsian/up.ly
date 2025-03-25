// Backend API URL
export const API_URL = 'http://localhost:8000';  // Update this if your backend is on a different URL

// CORS Proxy URLs - we'll try multiple options
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const CORSPROXY_IO = 'https://corsproxy.io/?';

/**
 * Sends a request to the backend to scrape job listings
 * @param {string} keyword - Job title or keywords
 * @param {string} location - Job location
 * @returns {Promise} - Job listings data
 */
export const scrapeJobs = async (keyword, location) => {
  try {
    console.log(`Searching for "${keyword}" jobs in "${location}"`);
    console.log(`Connecting to backend at: ${API_URL}/api/scrape-jobs`);
    
    const response = await fetch(`${API_URL}/api/scrape-jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyword, location }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server responded with status ${response.status}: ${errorText}`);
      
      if (response.status === 404) {
        throw new Error('Backend server not found. Please ensure the Python backend is running.');
      } else if (response.status === 500) {
        throw new Error('Server error occurred. The scraper might be having issues accessing job sites.');
      } else {
        throw new Error(`Failed to fetch job listings (Status: ${response.status})`);
      }
    }
    
    const data = await response.json();
    console.log(`Retrieved ${data.length || 0} job listings`);
    return data;
  } catch (error) {
    // Handle network errors (like CORS or connection refused)
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      console.error('Network error:', error);
      throw new Error('Unable to connect to backend server. Please ensure the server is running and accessible.');
    }
    
    console.error('Error scraping jobs:', error);
    throw error;
  }
};

// Job search API functions

/**
 * Fetches job listings from Remotive.io API with CORS proxy
 * @param {string} keyword - Job title or keywords
 * @param {string} location - Job location (optional for remote jobs)
 * @returns {Promise<Array>} - Array of job objects
 */
export const fetchRemotiveJobs = async (keyword, location = '') => {
  try {
    console.log(`Searching for "${keyword}" jobs on Remotive.io`);
    
    // Try corsproxy.io first as it tends to be more reliable
    const proxyUrl = `${CORSPROXY_IO}${encodeURIComponent(`https://remotive.com/api/remote-jobs/search?search=${encodeURIComponent(keyword)}`)}`;
    console.log(`Remotive API URL with proxy: ${proxyUrl}`);
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Remotive API error (${response.status}): ${errorText}`);
      throw new Error(`Remotive API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Remotive API response:', data);
    
    if (!data.jobs || !Array.isArray(data.jobs)) {
      console.warn('Remotive API returned unexpected data format:', data);
      return [];
    }
    
    // Map and filter the results
    const jobs = data.jobs
      .filter(job => !location || job.candidate_required_location.toLowerCase().includes(location.toLowerCase()))
      .slice(0, 15)
      .map((job, index) => ({
        id: job.id || `remotive-${index}`,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote',
        link: job.url,
        source: 'Remotive.io'
      }));
    
    console.log(`Found ${jobs.length} matching jobs from Remotive`);
    return jobs;
  } catch (error) {
    console.error('Error fetching from Remotive:', error);
    throw error;
  }
};

/**
 * Fetches job listings from RemoteOK API with CORS proxy
 * @param {string} keyword - Job title or keywords
 * @param {string} location - Job location (optional for remote jobs)
 * @returns {Promise<Array>} - Array of job objects
 */
export const fetchRemoteOkJobs = async (keyword, location = '') => {
  try {
    console.log(`Searching for "${keyword}" jobs on RemoteOK`);
    
    // Try corsproxy.io first as it tends to be more reliable
    const proxyUrl = `${CORSPROXY_IO}${encodeURIComponent(`https://remoteok.io/api?tag=${encodeURIComponent(keyword)}`)}`;
    console.log(`RemoteOK API URL with proxy: ${proxyUrl}`);
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`RemoteOK API error (${response.status}): ${errorText}`);
      throw new Error(`RemoteOK API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('RemoteOK API response:', data);
    
    if (!Array.isArray(data)) {
      console.warn('RemoteOK API returned unexpected data format:', data);
      return [];
    }
    
    // RemoteOK returns an array where the first object is usually metadata
    const jobs = data
      .filter(job => job.id && job.company) // Filter out any non-job items
      .filter(job => !location || (job.location && job.location.toLowerCase().includes(location.toLowerCase())))
      .slice(0, 15)
      .map((job, index) => ({
        id: job.id || `remoteok-${index}`,
        title: job.position,
        company: job.company,
        location: job.location || 'Remote',
        link: `https://remoteok.io${job.url}`,
        source: 'RemoteOK'
      }));
    
    console.log(`Found ${jobs.length} matching jobs from RemoteOK`);
    return jobs;
  } catch (error) {
    console.error('Error fetching from RemoteOK:', error);
    throw error;
  }
};

/**
 * Fetches job listings from JSearch API via RapidAPI
 * @param {string} keyword - Job title or keywords
 * @param {string} location - Job location
 * @returns {Promise<Array>} - Array of job objects
 */
export const fetchJSearchJobs = async (keyword, location = '') => {
  try {
    console.log(`Searching for "${keyword}" jobs in "${location}" via JSearch API`);
    
    // NOTE: You need to sign up for RapidAPI and get an API key for JSearch
    // Replace 'YOUR_RAPIDAPI_KEY' with your actual key
    // https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
    
    const url = new URL('https://jsearch.p.rapidapi.com/search');
    url.searchParams.append('query', `${keyword} ${location}`.trim());
    url.searchParams.append('page', '1');
    url.searchParams.append('num_pages', '1');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY', // Replace with your RapidAPI key
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });
    
    if (!response.ok) {
      throw new Error(`JSearch API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.data) {
      return [];
    }
    
    return data.data.slice(0, 15).map((job, index) => ({
      id: `jsearch-${index}`,
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city ? `${job.job_city}, ${job.job_country}` : job.job_country || 'Remote',
      link: job.job_apply_link,
      source: 'JSearch'
    }));
  } catch (error) {
    console.error('Error fetching from JSearch API:', error);
    throw error;
  }
};

/**
 * Fetches job listings from Arbeitnow API
 * @param {string} keyword - Job title or keywords
 * @param {string} location - Job location
 * @returns {Promise<Array>} - Array of job objects
 */
export const fetchArbeitnowJobs = async (keyword, location = '') => {
  try {
    console.log(`Searching for "${keyword}" jobs on Arbeitnow`);
    
    // This API is CORS-friendly
    const url = new URL('https://arbeitnow.com/api/job-board-api');
    if (keyword) url.searchParams.append('query', keyword);
    
    console.log(`Arbeitnow API URL: ${url.toString()}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Arbeitnow API error (${response.status}): ${errorText}`);
      throw new Error(`Arbeitnow API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Arbeitnow API response:', data);
    
    if (!data.data || !Array.isArray(data.data)) {
      console.warn('Arbeitnow API returned unexpected data format:', data);
      return [];
    }
    
    const jobs = data.data
      .filter(job => !location || (job.location && job.location.toLowerCase().includes(location.toLowerCase())))
      .slice(0, 15)
      .map((job, index) => ({
        id: `arbeitnow-${index}`,
        title: job.title,
        company: job.company_name,
        location: job.location || 'Remote',
        link: job.url,
        source: 'Arbeitnow'
      }));
    
    console.log(`Found ${jobs.length} matching jobs from Arbeitnow`);
    return jobs;
  } catch (error) {
    console.error('Error fetching from Arbeitnow:', error);
    throw error;
  }
};

/**
 * Fetches job listings from GitHub Jobs API via proxy
 * @param {string} keyword - Job title or keywords
 * @param {string} location - Job location
 * @returns {Promise<Array>} - Array of job objects
 */
export const fetchGitHubJobs = async (keyword, location = '') => {
  try {
    console.log(`Searching for "${keyword}" jobs on GitHub Jobs API`);
    
    // Use this reliable proxy for GitHub Jobs API
    const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://jobs.github.com/positions.json?description=${keyword}&location=${location}`)}`;
    console.log(`GitHub Jobs API URL with proxy: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GitHub Jobs API error (${response.status}): ${errorText}`);
      throw new Error(`GitHub Jobs API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('GitHub Jobs API response:', data);
    
    if (!Array.isArray(data)) {
      console.warn('GitHub Jobs API returned unexpected data format:', data);
      return [];
    }
    
    const jobs = data.slice(0, 15).map((job, index) => ({
      id: `github-${job.id || index}`,
      title: job.title,
      company: job.company,
      location: job.location || 'Remote',
      link: job.url,
      source: 'GitHub Jobs'
    }));
    
    console.log(`Found ${jobs.length} matching jobs from GitHub Jobs`);
    return jobs;
  } catch (error) {
    console.error('Error fetching from GitHub Jobs:', error);
    throw error;
  }
};

/**
 * Fetches job listings from multiple sources and combines the results
 * @param {string} keyword - Job title or keywords
 * @param {string} location - Job location
 * @returns {Promise<Array>} - Combined array of job objects from all sources
 */
export const fetchAllJobs = async (keyword, location = '') => {
  try {
    console.log(`Searching for "${keyword}" jobs in "${location}" across multiple sources`);
    
    // Try to fetch from multiple sources in parallel
    const results = await Promise.allSettled([
      fetchArbeitnowJobs(keyword, location),
      fetchRemotiveJobs(keyword, location),
      fetchRemoteOkJobs(keyword, location),
      fetchGitHubJobs(keyword, location),
      // Uncomment if you have a RapidAPI key
      // fetchJSearchJobs(keyword, location)
    ]);
    
    // Combine results from all successful sources
    let allJobs = [];
    
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allJobs = [...allJobs, ...result.value];
      }
    });
    
    console.log(`Retrieved ${allJobs.length} job listings from all sources`);
    return allJobs;
  } catch (error) {
    console.error('Error fetching all jobs:', error);
    throw error;
  }
}; 