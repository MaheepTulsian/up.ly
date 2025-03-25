import React from 'react';

const ExtensionPage = () => {
  return (
    <div className="flex flex-col h-full p-8">
      <h1 className="text-3xl font-bold mb-6">Browser Extension</h1>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-2xl text-center">
          <h2 className="text-2xl font-semibold mb-4">Install Our Browser Extension</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Get instant job application assistance while browsing job sites. Our extension helps you
            track applications, save job details, and get AI-powered suggestions.
          </p>
          <div className="space-y-4">
            <a
              href="#"
              className="inline-block bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 transition-colors"
            >
              Install Chrome Extension
            </a>
            <p className="text-sm text-gray-500">
              Available for Chrome, Firefox, and Edge
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionPage; 