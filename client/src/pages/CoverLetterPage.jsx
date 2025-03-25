import React from 'react';

const CoverLetterPage = () => {
  return (
    <div className="flex flex-col h-full p-8">
      <h1 className="text-3xl font-bold mb-6">Cover Letter Generator</h1>
      <div className="flex-1 flex gap-6">
        {/* Left side - Input form */}
        <div className="w-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Job Details</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Job Title</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., Tech Company Inc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Job Description</label>
              <textarea
                className="w-full p-2 border rounded-md h-32 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Paste the job description here..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Generate Cover Letter
            </button>
          </form>
        </div>

        {/* Right side - Preview */}
        <div className="w-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Cover Letter Preview</h2>
          <div className="h-full border rounded-md p-4 dark:border-gray-600">
            <p className="text-gray-600 dark:text-gray-400">
              Your generated cover letter will appear here...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterPage; 