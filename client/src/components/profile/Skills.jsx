import React, { useState, useEffect } from 'react';
import useFormDataStore from '../../store/formStore'; // Adjust the path if needed

const Skills = ({ onNext }) => {
  const { updateFormData, getFormData } = useFormDataStore(); // Access store methods
  const [skills, setSkills] = useState(['']);

  // Load existing data from Zustand store if available
  useEffect(() => {
    const existingData = getFormData('skills'); // Get skills data from the store
    if (existingData && Array.isArray(existingData) && existingData.length > 0) {
      setSkills(existingData); // Only set skills if they exist
    }
  }, [getFormData]);
  
  const handleSkillChange = (index, value) => {
    const updatedSkills = [...skills];
    updatedSkills[index] = value;
    setSkills(updatedSkills);
  };

  const addSkill = () => {
    setSkills([...skills, '']);
  };

  const removeSkill = (index) => {
    if (skills.length > 1) {
      const updatedSkills = [...skills];
      updatedSkills.splice(index, 1);
      setSkills(updatedSkills);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter out empty skills
    const filteredSkills = skills.filter(skill => skill.trim() !== '');
    console.log('Skills submitted:', filteredSkills);
    // Update store with skills data
    updateFormData('skills', filteredSkills);
    // Move to next form and pass data
    onNext(filteredSkills);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-8 mb-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <div className="mr-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Professional Skills</h2>
          <p className="text-gray-500 mt-1">List your key professional skills and competencies</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Skills Inventory
          </h3>
          
          <div className="space-y-4">
            {skills.map((skill, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleSkillChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="e.g., JavaScript, Project Management, Data Analysis"
                />
                
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="ml-3 text-red-500 hover:text-red-700 transition duration-200"
                  disabled={skills.length === 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addSkill}
              className="mt-4 flex items-center text-blue-600 hover:text-blue-800 font-medium transition duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Another Skill
            </button>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:-translate-y-0.5 transition duration-300"
          >
            Next Step
          </button>
        </div>
      </form>
    </div>
  );
};

export default Skills;
