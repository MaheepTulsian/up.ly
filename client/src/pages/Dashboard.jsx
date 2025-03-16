import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Personal from '../components/profile/Personal'
import Academics from '../components/profile/Academics'
import Projects from '../components/profile/Projects'
import Skills from '../components/profile/Skills'
import WorkExperience from '../components/profile/WorkExperience'
import Certifications from '../components/profile/Certifications'

// Final submission component
const SubmitProfile = ({ profileData }) => {
  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log('Submitting complete profile data:', profileData);
    alert('Profile submitted successfully!');
    // Additional logic like redirecting user or showing success message
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Profile Summary</h2>
      <p className="mb-6 text-gray-600">
        You've completed all the required profile sections. Review your information below and submit your profile.
      </p>
      
      <div className="space-y-6">
        {/* Personal Section Summary */}
        {profileData.personal && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2 mb-2">Personal Information</h3>
            <p>Name: {profileData.personal.firstName} {profileData.personal.lastName}</p>
            <p>Email: {profileData.personal.email}</p>
            <p>Location: {profileData.personal.city}, {profileData.personal.state}, {profileData.personal.country}</p>
          </div>
        )}
        
        {/* Academics Section Summary */}
        {profileData.academics && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2 mb-2">Academic Information</h3>
            <p>Degree: {profileData.academics.degree} in {profileData.academics.fieldOfStudy}</p>
            <p>Institution: {profileData.academics.institution}</p>
          </div>
        )}
        
        {/* Projects Section Summary */}
        {profileData.projects && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2 mb-2">Projects</h3>
            <p>Added Project: {profileData.projects.title}</p>
            <p>Technologies: {profileData.projects.technologiesUsed.join(', ')}</p>
          </div>
        )}
        
        {/* Skills Section Summary */}
        {profileData.skills && profileData.skills.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2 mb-2">Skills</h3>
            <p>{profileData.skills.join(', ')}</p>
          </div>
        )}
        
        {/* Work Experience Section Summary */}
        {profileData.workExperience && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2 mb-2">Work Experience</h3>
            <p>Position: {profileData.workExperience.position} at {profileData.workExperience.company}</p>
            <p>{profileData.workExperience.isCurrent ? 'Current Position' : 'Past Position'}</p>
          </div>
        )}
        
        {/* Certifications Section Summary */}
        {profileData.certifications && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2 mb-2">Certifications</h3>
            <p>{profileData.certifications.name} by {profileData.certifications.issuingOrganization}</p>
          </div>
        )}
      </div>
      
      <div className="border-t pt-6 mt-6">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Submit Complete Profile
        </button>
      </div>
    </div>
  );
};

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeForm, setActiveForm] = useState('personal');
  
  // Store form data from all sections
  const [profileData, setProfileData] = useState({
    personal: null,
    academics: null,
    projects: null,
    skills: null,
    workExperience: null,
    certifications: null
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const saveFormData = (formType, data) => {
    setProfileData(prevData => ({
      ...prevData,
      [formType]: data
    }));
  };

  const handleNextForm = (formType, formData) => {
    // Save the current form data
    if (formData) {
      saveFormData(formType, formData);
    }
    
    const formOrder = ['personal', 'academics', 'projects', 'skills', 'workExperience', 'certifications', 'submit'];
    const currentIndex = formOrder.indexOf(activeForm);
    if (currentIndex < formOrder.length - 1) {
      setActiveForm(formOrder[currentIndex + 1]);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      {!sidebarOpen && (
        <div className="bg-gray-200 px-4 py-2">
          <button 
            onClick={toggleSidebar}
            className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded-md transition-colors"
          >
            Menu
          </button>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-0'}`}>
          <Sidebar toggleSidebar={toggleSidebar} />
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {activeForm === 'personal' && 
            <Personal 
              onNext={(data) => handleNextForm('personal', data)} 
            />
          }
          {activeForm === 'academics' && 
            <Academics 
              onNext={(data) => handleNextForm('academics', data)} 
            />
          }
          {activeForm === 'projects' && 
            <Projects 
              onNext={(data) => handleNextForm('projects', data)} 
            />
          }
          {activeForm === 'skills' && 
            <Skills 
              onNext={(data) => handleNextForm('skills', data)} 
            />
          }
          {activeForm === 'workExperience' && 
            <WorkExperience 
              onNext={(data) => handleNextForm('workExperience', data)} 
            />
          }
          {activeForm === 'certifications' && 
            <Certifications 
              onNext={(data) => handleNextForm('certifications', data)} 
            />
          }
          {activeForm === 'submit' && 
            <SubmitProfile 
              profileData={profileData} 
            />
          }
        </div>
      </div>
    </div>
  )
}

export default Dashboard