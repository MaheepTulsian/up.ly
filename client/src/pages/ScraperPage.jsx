import React, { useState, useEffect } from 'react';
import { Search, Briefcase, MapPin, ExternalLink, Loader, AlertCircle } from 'lucide-react';
import { fetchAllJobs, fetchRemotiveJobs, fetchRemoteOkJobs, fetchArbeitnowJobs, fetchGitHubJobs } from '@/lib/api';

const ScraperPage = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [usedMockData, setUsedMockData] = useState(false);
  const [activeAPIs, setActiveAPIs] = useState([]);

  // This function handles job searching using JavaScript APIs
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setJobs([]);
    setSearchPerformed(true);
    setUsedMockData(false);
    setActiveAPIs([]);
    
    let foundJobs = [];
    
    // Start with Arbeitnow as it's most reliable (CORS-friendly)
    try {
      console.log("Attempting to fetch from Arbeitnow API...");
      const arbeitnowJobs = await fetchArbeitnowJobs(keyword, location);
      console.log(`Arbeitnow returned ${arbeitnowJobs.length} jobs`);
      
      if (arbeitnowJobs.length > 0) {
        foundJobs = [...foundJobs, ...arbeitnowJobs];
        setActiveAPIs(prev => [...prev, 'Arbeitnow']);
      }
    } catch (err) {
      console.error('Arbeitnow API failed:', err.message);
    }
    
    // Try GitHub Jobs API (reliable with CORS proxy)
    try {
      console.log("Attempting to fetch from GitHub Jobs API...");
      const githubJobs = await fetchGitHubJobs(keyword, location);
      console.log(`GitHub Jobs returned ${githubJobs.length} jobs`);
      
      if (githubJobs.length > 0) {
        foundJobs = [...foundJobs, ...githubJobs];
        setActiveAPIs(prev => [...prev, 'GitHub Jobs']);
      }
    } catch (err) {
      console.error('GitHub Jobs API failed:', err.message);
    }
    
    // Try Remotive API
    try {
      console.log("Attempting to fetch from Remotive API with proxy...");
      const remotiveJobs = await fetchRemotiveJobs(keyword, location);
      console.log(`Remotive returned ${remotiveJobs.length} jobs`);
      
      if (remotiveJobs.length > 0) {
        foundJobs = [...foundJobs, ...remotiveJobs];
        setActiveAPIs(prev => [...prev, 'Remotive']);
      }
    } catch (err) {
      console.error('Remotive API failed:', err.message);
    }
    
    // Try RemoteOK API
    try {
      console.log("Attempting to fetch from RemoteOK API with proxy...");
      const remoteOkJobs = await fetchRemoteOkJobs(keyword, location);
      console.log(`RemoteOK returned ${remoteOkJobs.length} jobs`);
      
      if (remoteOkJobs.length > 0) {
        foundJobs = [...foundJobs, ...remoteOkJobs];
        setActiveAPIs(prev => [...prev, 'RemoteOK']);
      }
    } catch (err) {
      console.error('RemoteOK API failed:', err.message);
    }
    
    // Update state with all found jobs
    if (foundJobs.length > 0) {
      console.log(`Setting ${foundJobs.length} real jobs from APIs`);
      setJobs(foundJobs);
      setLoading(false);
    } else {
      // If no jobs found from any source, use mock data
      console.log('No jobs found from APIs, using mock data');
      const mockJobs = generateMockJobs(keyword, location);
      setJobs(mockJobs);
      setUsedMockData(true);
      setLoading(false);
    }
  };

  // Generate some sample job data for demonstration
  const generateMockJobs = (keyword, location) => {
    const companies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Facebook', 'Netflix', 'Tesla', 'IBM', 'Oracle', 'Salesforce'];
    const jobTypes = ['Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'DevOps Engineer'];
    const locations = [location || 'Remote', 'Remote', location ? `${location} (Hybrid)` : 'Hybrid', 'Anywhere'];
    
    const mockJobs = [];
    const numJobs = Math.floor(Math.random() * 15) + 5; // 5-20 jobs
    
    for (let i = 0; i < numJobs; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
      const title = keyword ? `${jobType} - ${keyword}` : jobType;
      const jobLocation = locations[Math.floor(Math.random() * locations.length)];
      const source = ['Indeed', 'LinkedIn', 'Glassdoor', 'ZipRecruiter'][Math.floor(Math.random() * 4)];
      
      // Create a realistic-looking link
      let link;
      switch (source) {
        case 'LinkedIn':
          link = `https://www.linkedin.com/jobs/view/${Math.floor(Math.random() * 10000000)}`;
          break;
        case 'Indeed':
          link = `https://www.indeed.com/viewjob?jk=${Math.random().toString(36).substring(2, 10)}`;
          break;
        case 'Glassdoor':
          link = `https://www.glassdoor.com/job-listing/job-${Math.floor(Math.random() * 10000000)}`;
          break;
        default:
          link = `https://www.ziprecruiter.com/jobs/id=${Math.floor(Math.random() * 10000000)}`;
      }
      
      mockJobs.push({
        id: `mock-${i}`,
        title,
        company,
        location: jobLocation,
        link,
        source: `${source} (Demo Data)`
      });
    }
    
    return mockJobs;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Job Listings Search</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">API Testing Mode</h3>
            <p className="text-sm text-blue-700 mt-1">
              Enter job keywords and location to test the job APIs. Check the browser console (F12) for detailed API responses.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
              Job Title or Keywords
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Software Engineer, Data Scientist..."
                required
              />
            </div>
          </div>
          
          <div className="flex-1">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="City, State, or Remote"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2 h-10 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* API Status */}
      {activeAPIs.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {activeAPIs.map(api => (
              <span key={api} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {api} API ✓
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Mock Data Alert */}
      {usedMockData && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Showing demo data. Real API connections couldn't be established or returned no results.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Results Section */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Fetching Job Listings</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {jobs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Found {jobs.length} Job Listings</h2>
          </div>
          
          <ul className="divide-y divide-gray-200">
            {jobs.map((job) => (
              <li key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-semibold text-blue-700">{job.title}</h3>
                    <p className="text-gray-600 mt-1">{job.company}</p>
                    <div className="flex items-center mt-2 text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{job.location}</span>
                    </div>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        {job.source}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Job
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {jobs.length === 0 && !loading && searchPerformed && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500">
            Try broadening your search or using different keywords.
          </p>
        </div>
      )}
      
      {!searchPerformed && !loading && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Search for jobs</h3>
          <p className="text-gray-500">
            Enter a job title or keywords above to find relevant job listings from multiple sources.
          </p>
        </div>
      )}
    </div>
  );
};

export default ScraperPage; 