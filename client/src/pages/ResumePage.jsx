import React, { useState, useRef, useEffect } from 'react'
import resumeData from '@/data/resdata.json'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import html2pdf from 'html2pdf.js'

// Format date strings to readable format
const formatDate = (dateString) => {
  if (!dateString) return '';
  return format(new Date(dateString), 'MMM yyyy');
};

const ResumePage = () => {
  const [data] = useState(resumeData);
  const resumeRef = useRef(null);
  
  // Load Lato font
  useEffect(() => {
    // Add Lato font from Google Fonts
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap';
    document.head.appendChild(linkElement);
    
    return () => {
      // Cleanup function to remove the link when component unmounts
      document.head.removeChild(linkElement);
    };
  }, []);
  
  // Filter to only show university education
  const universityEducation = data.academic.filter(edu => 
    edu.degree === 'B.Tech' || 
    edu.degree === 'M.Tech' || 
    edu.degree.includes('Bachelor') || 
    edu.degree.includes('Master') || 
    edu.degree.includes('PhD') ||
    edu.institution.toLowerCase().includes('university') ||
    edu.institution.toLowerCase().includes('college')
  );

  const downloadPDF = () => {
    const element = resumeRef.current;
    const opt = {
      margin: [0, 0, 0, 0],
      filename: `${data.personalInfo.firstName}_${data.personalInfo.lastName}_Resume.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        allowTaint: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true,
        // Enable font embedding
        putOnlyUsedFonts: true
      },
      fontFaces: [
        {
          family: 'Lato',
          style: 'normal',
          weight: 400
        },
        {
          family: 'Lato',
          style: 'normal',
          weight: 700
        }
      ]
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="flex absolute inset-0 top-16 bg-gray-200 dark:bg-gray-900">
      {/* Left side - Chatbot space */}
      <div className="w-[calc(100%-210mm-20px)] h-full bg-gray-100 dark:bg-gray-800 p-4 rounded-l-lg">
   
        
        {/* Chatbot interface */}
        <div className="flex flex-col h-[calc(100%-32px)] bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md overflow-hidden">
          {/* Messages area */}
          <div className="flex-1 p-4 overflow-y-auto styled-scrollbar">
            <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg max-w-[85%] shadow-sm">
              <p className="font-medium text-gray-800 dark:text-white mb-1">UP.ly Assistant</p>
              <p className="text-gray-700 dark:text-gray-200">How can I help with your resume today?</p>
            </div>
            {/* User message example */}
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-[85%] ml-auto shadow-sm">
              <p className="text-gray-800 dark:text-gray-200">Can you add my recent job experience?</p>
            </div>
            <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg max-w-[85%] shadow-sm">
              <p className="font-medium text-gray-800 dark:text-white mb-1">Resume Assistant</p>
              <p className="text-gray-700 dark:text-gray-200">Working on it!</p>
            </div>
          </div>
          {/* Input area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
            <div className="flex mb-3">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-r-lg transition font-medium">
                Send
              </button>
            </div>
            
            {/* Download button */}
            <button
              onClick={downloadPDF}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition shadow-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 13.586V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </div>
      
      {/* Right side - A4 Resume with exact proportions */}
      <div className="flex-1 h-full flex items-start justify-end p-[10px] pt-2 overflow-hidden rounded-r-lg">
        <div 
          ref={resumeRef} 
          className="w-[210mm] bg-white shadow-lg flex flex-col rounded-sm"
          style={{ 
            fontFamily: 'Lato, sans-serif',
            height: '297mm', // A4 height
            transform: 'scale(0.82)',
            transformOrigin: 'top right',
            overflow: 'hidden'
          }}
        >
          {/* Content container - scrollable */}
          <div className="h-full overflow-auto p-5 styled-scrollbar">
    
            
            {/* Header / Personal Info - More compact */}
            <div className="mb-3 border-b pb-2">
              <h1 className="text-2xl font-bold text-gray-800">{data.personalInfo.firstName} {data.personalInfo.lastName}</h1>
              <div className="flex flex-wrap gap-x-3 mt-1 text-sm text-gray-600">
                <span>{data.personalInfo.email}</span>
                <span>•</span>
                <span>{data.personalInfo.phone}</span>
                <span>•</span>
                <span>{data.personalInfo.address.city}, {data.personalInfo.address.state}</span>
                {data.socials.linkedIn && <><span>•</span><a href={data.socials.linkedIn} className="text-blue-600 hover:underline">LinkedIn</a></>}
                {data.socials.github && <><span>•</span><a href={data.socials.github} className="text-blue-600 hover:underline">GitHub</a></>}
              </div>
            </div>
            
            {/* Two column layout for first sections */}
            <div className="flex gap-4 mb-3">
              {/* Skills column */}
              <div className="w-1/2">
                <h2 className="text-lg font-bold text-gray-800 mb-1 border-b border-gray-300 pb-1">Skills</h2>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.skills.map((skill, index) => (
                    <span key={index} className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Education column - University only */}
              <div className="w-1/2">
                <h2 className="text-lg font-bold text-gray-800 mb-1 border-b border-gray-300 pb-1">Education</h2>
                {universityEducation.map((edu, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{edu.institution}</span>
                      <span className="text-xs text-gray-600">
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </span>
                    </div>
                    <div className="text-sm">{edu.degree} in {edu.fieldOfStudy}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Work Experience section */}
            <div className="mb-3">
              <h2 className="text-lg font-bold text-gray-800 mb-1 border-b border-gray-300 pb-1">Work Experience</h2>
              {data.workEx.map((job, index) => (
                <div key={index} className="mb-2">
                  <div className="flex justify-between">
                    <div>
                      <span className="font-medium">{job.company}</span>
                      <span className="mx-1">|</span>
                      <span>{job.position}</span>
                    </div>
                    <span className="text-xs text-gray-600">
                      {formatDate(job.startDate)} - {job.isCurrent ? 'Present' : formatDate(job.endDate)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{job.description}</p>
                </div>
              ))}
            </div>
            
            {/* Projects section */}
            <div className="mb-3">
              <h2 className="text-lg font-bold text-gray-800 mb-1 border-b border-gray-300 pb-1">Projects</h2>
              <div className="grid grid-cols-1 gap-y-2">
                {data.projects.map((project, index) => (
                  <div key={index}>
                    <div className="flex justify-between">
                      <span className="font-medium">{project.title}</span>
                      <span className="text-xs text-gray-600">
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 whitespace-pre-line">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.technologiesUsed.map((tech, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-700 px-1 py-0.5 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Certifications section */}
            <div className="mb-3">
              <h2 className="text-lg font-bold text-gray-800 mb-1 border-b border-gray-300 pb-1">Certifications</h2>
              <div className="grid grid-cols-1 gap-y-1">
                {data.certifications.map((cert, index) => (
                  <div key={index} className="mb-1">
                    <div className="font-medium text-sm">{cert.name}</div>
                    <div className="text-xs">{cert.issuingOrganization} • {formatDate(cert.issueDate)}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Achievements section */}
            <div className="mb-3">
              <h2 className="text-lg font-bold text-gray-800 mb-1 border-b border-gray-300 pb-1">Achievements</h2>
              <div className="grid grid-cols-1 gap-y-1">
                {data.achievements.map((achievement, index) => (
                  <div key={index} className="mb-1">
                    <div className="font-medium text-sm">{achievement.title}</div>
                    <div className="text-xs">{achievement.issuer} • {formatDate(achievement.date)}</div>
                    <p className="text-xs text-gray-600 whitespace-pre-line">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
           
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumePage 