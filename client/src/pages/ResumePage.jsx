import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { useParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'MMM yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

const ResumePage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [error, setError] = useState(null);
  const resumeRef = useRef(null);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Please enter the Job Description." },
  ]);
  const [input, setInput] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [resumeData, setResumeData] = useState(null);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await fetch(`http://localhost:3000/api/v1/${id}/getprofile`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError(error);
      } finally {
        setProfileLoading(false);
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [id]);

  const handleSend = async () => {
    if (!input.trim() || !userProfile) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);

    if (!jobDescription) {
      setJobDescription(input);
      setMessages([...newMessages, { sender: "bot", text: "Processing your resume..." }]);

      try {
        setResumeLoading(true);
        const body = JSON.stringify({ 
          user_profile: userProfile, 
          job_description: input 
        });

        const response = await fetch("http://localhost:7070/resume/create", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: body,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setResumeData(data.resume);
        setMessages(prev => [...prev, { 
          sender: "bot", 
          text: "Resume generated successfully! You can now download it as PDF." 
        }]);
      } catch (error) {
        console.error("Error generating resume:", error);
        setMessages(prev => [...prev, { 
          sender: "bot", 
          text: "Failed to generate resume. Please try again later." 
        }]);
      } finally {
        setResumeLoading(false);
      }
    }

    setInput("");
  };

  // Load fonts for PDF generation
  useEffect(() => {
    const loadFonts = async () => {
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: 'Lato';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: local('Lato Regular'), local('Lato-Regular'),
               url('https://fonts.gstatic.com/s/lato/v23/S6uyw4BMUTPHjx4wXiWtFCc.woff2') format('woff2');
        }
        @font-face {
          font-family: 'Lato';
          font-style: normal;
          font-weight: 700;
          font-display: swap;
          src: local('Lato Bold'), local('Lato-Bold'),
               url('https://fonts.gstatic.com/s/lato/v23/S6u9w4BMUTPHh6UVSwiPGQ3q5d0.woff2') format('woff2');
        }
      `;
      document.head.appendChild(style);

      await document.fonts.ready;
      setFontLoaded(true);
    };

    loadFonts();
  }, []);

  const downloadPDF = async () => {
    if (!resumeData || !resumeRef.current) return;

    try {
      if (!fontLoaded) {
        alert('Fonts are still loading, please try again in a moment');
        return;
      }

      const element = resumeRef.current;
      const opt = {
        margin: 10,
        filename: `${resumeData.basics.firstName}_${resumeData.basics.lastName}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
          timeout: 30000
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true,
          precision: 16
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // Generate PDF
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert(`Failed to generate PDF: ${error.message}`);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col md:flex-row absolute inset-0 top-16">
      {/* Left side - Chatbot space */}
      <div className="w-full md:w-1/2 h-full p-4">
        <div className="flex flex-col h-full bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto styled-scrollbar">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 p-3 rounded-lg max-w-[85%] shadow-sm ${msg.sender === "bot"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-gray-800 dark:text-white"
                  : "bg-gray-100 dark:bg-gray-800 ml-auto text-gray-800 dark:text-gray-200"
                  }`}
              >
                <p className="font-medium">{msg.sender === "bot" ? "Resume Assistant" : "You"}</p>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            ))}
            {(resumeLoading || loading) && (
              <div className="mb-4 p-3 rounded-lg max-w-[85%] bg-blue-100 dark:bg-blue-900/30">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-200"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
            <div className="flex">
              <input
                type="text"
                placeholder={resumeData ? "Ask something about the resume..." : "Type your job description..."}
                className="flex-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                disabled={resumeLoading}
              />
              <button 
                onClick={handleSend} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-r-lg transition font-medium disabled:opacity-50"
                disabled={resumeLoading || !input.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Resume Preview */}
      <div className="w-full md:w-1/2 h-full p-4 bg-gray-50 dark:bg-gray-800 border-t md:border-t-0 md:border-l border-gray-300 dark:border-gray-600">
        <div className="flex flex-col h-full bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              {resumeData ? "Generated Resume" : "Resume Preview"}
            </h2>
            {resumeData && (
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                disabled={!fontLoaded}
              >
                <Download size={18} />
                Download PDF
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto styled-scrollbar p-4">
            {resumeLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : resumeData ? (
              <div ref={resumeRef} className="bg-white dark:bg-gray-800 p-6 rounded-sm">
                {/* Header Section */}
                <div className="mb-6 border-b border-gray-300 dark:border-gray-600 pb-4">
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                    {resumeData.basics.firstName} {resumeData.basics.lastName}
                  </h1>
                  <div className="flex flex-wrap gap-x-3 text-sm text-gray-600 dark:text-gray-300">
                    {[resumeData.basics.email, resumeData.basics.phone].filter(Boolean).map((item, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <span className="text-gray-400">|</span>}
                        <span>{item}</span>
                      </React.Fragment>
                    ))}
                  </div>
                  {resumeData.basics.address && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {resumeData.basics.address.city}, {resumeData.basics.address.state}
                    </p>
                  )}
                  {resumeData.basics.socials && (
                    <div className="flex gap-2 mt-1">
                      {resumeData.basics.socials.linkedIn && (
                        <a 
                          href={resumeData.basics.socials.linkedIn} 
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LinkedIn
                        </a>
                      )}
                      {resumeData.basics.socials.github && (
                        <a 
                          href={resumeData.basics.socials.github} 
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* All other resume sections remain the same as before */}
                {/* Work Experience */}
                {resumeData.workExperience?.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3 border-b-2 border-blue-600 pb-1 uppercase">
                      Work Experience
                    </h2>
                    {resumeData.workExperience.map((job, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                          <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{job.position}</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{job.company}</p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 sm:mt-0 mt-1">
                            {formatDate(job.startDate)} - {job.isCurrent ? 'Present' : formatDate(job.endDate)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{job.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects */}
                {resumeData.projects?.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3 border-b-2 border-blue-600 pb-1 uppercase">
                      Projects
                    </h2>
                    {resumeData.projects.map((project, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                          <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{project.title}</h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400 sm:mt-0 mt-1">
                            {formatDate(project.startDate)} - {formatDate(project.endDate)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{project.description}</p>
                        {project.technologiesUsed?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {project.technologiesUsed.map((tech, i) => (
                              <span 
                                key={i} 
                                className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-sm text-gray-800 dark:text-gray-200"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Education */}
                {resumeData.education?.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3 border-b-2 border-blue-600 pb-1 uppercase">
                      Education
                    </h2>
                    {resumeData.education.map((edu, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{edu.institution}</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {edu.degree} in {edu.fieldOfStudy}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 sm:mt-0 mt-1">
                            {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills */}
                {resumeData.skills?.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3 border-b-2 border-blue-600 pb-1 uppercase">
                      Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-sm text-gray-800 dark:text-gray-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {resumeData.achievements?.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3 border-b-2 border-blue-600 pb-1 uppercase">
                      Achievements
                    </h2>
                    {resumeData.achievements.map((achievement, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                          <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{achievement.title}</h3>
                          {achievement.date && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 sm:mt-0 mt-1">
                              {formatDate(achievement.date)}
                            </span>
                          )}
                        </div>
                        {achievement.issuer && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Issued by: {achievement.issuer}
                          </p>
                        )}
                        <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {achievement.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Certifications */}
                {resumeData.certifications?.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3 border-b-2 border-blue-600 pb-1 uppercase">
                      Certifications
                    </h2>
                    {resumeData.certifications.map((cert, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                          <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{cert.name}</h3>
                          {cert.issueDate && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 sm:mt-0 mt-1">
                              Issued: {formatDate(cert.issueDate)}
                            </span>
                          )}
                        </div>
                        {cert.issuingOrganization && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Issued by: {cert.issuingOrganization}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400 text-center p-4">
                  {messages.length <= 1 
                    ? "Please enter a job description to generate your tailored resume"
                    : "Your resume will appear here once generated"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;