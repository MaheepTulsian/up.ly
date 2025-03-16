import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Personal from '../components/profile/Personal';
import Academics from '../components/profile/Academics';
import Projects from '../components/profile/Projects';
import Skills from '../components/profile/Skills';
import WorkExperience from '../components/profile/WorkExperience';
import Certifications from '../components/profile/Certifications';

function Dashboard() {
  const [activeStep, setActiveStep] = useState(0);

  const [profileData, setProfileData] = useState({
    personal: {}, // Use an empty object instead of null
    academics: null,
    projects: null,
    skills: null,
    workExperience: null,
    certifications: null
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNextStep = (formType, data) => {
    if (data) {
      saveFormData(formType, data);
    }
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleStepClick = (index) => {
    if (isStepCompleted(index)) {
      setActiveStep(index);
    }
  };

  const isStepCompleted = (index) => {
    // For index 0 (Personal), always allow access
    if (index === 0) return true;
    
    // For other steps, check if all previous steps are completed
    for (let i = 0; i < index; i++) {
      const stepKey = Object.keys(profileData)[i];
      if (!profileData[stepKey] || Object.keys(profileData[stepKey]).length === 0) {
        return false;
      }
    }
    return true;
  };

  const saveFormData = (formType, data) => {
    setProfileData(prevData => ({
      ...prevData,
      [formType]: data
    }));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const steps = [
    { name: 'Personal', component: <Personal onNext={(data) => handleNextStep('personal', data)} /> },
    { name: 'Academics', component: <Academics onNext={(data) => handleNextStep('academics', data)} /> },
    { name: 'Projects', component: <Projects onNext={(data) => handleNextStep('projects', data)} /> },
    { name: 'Skills', component: <Skills onNext={(data) => handleNextStep('skills', data)} /> },
    { name: 'Work Experience', component: <WorkExperience onNext={(data) => handleNextStep('workExperience', data)} /> },
    { name: 'Certifications', component: <Certifications onNext={(data) => handleNextStep('certifications', data)} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {sidebarOpen && (
        <Sidebar activeStep={activeStep} steps={steps} onStepClick={handleStepClick} />
      )}
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4">
          <div className="flex mb-4">
            {!sidebarOpen && (
              <button 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={toggleSidebar}
              >
                Menu
              </button>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              {/* Dots style stepper */}
              <div className="flex justify-center items-center">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <button
                      onClick={() => handleStepClick(index)}
                      disabled={!isStepCompleted(index)}
                      className={`rounded-full w-4 h-4 mx-2 flex items-center justify-center ${
                        activeStep === index
                          ? 'bg-blue-600 border-2 border-blue-600'
                          : isStepCompleted(index)
                            ? 'bg-blue-200 border-2 border-blue-400 cursor-pointer'
                            : 'bg-gray-300 border-2 border-gray-400 cursor-not-allowed'
                      }`}
                      title={step.name}
                    />
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-1 ${
                        index < activeStep ? 'bg-blue-400' : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Step name display */}
              {/* <div className="text-center mt-2 font-medium text-gray-800">
                {steps[activeStep].name}
              </div> */}
            </div>
            
            {steps[activeStep].component}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;

