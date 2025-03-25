import React from 'react';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to Up.ly</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        Your all-in-one platform for job preparation and career growth
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Resume Builder</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create and customize your professional resume with our easy-to-use builder.
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Cover Letter</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Generate tailored cover letters that match your target job positions.
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Resources</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Access study materials, practice questions, and interview preparation guides.
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Interview Prep</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Practice interviews with our AI-powered mock interview system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 