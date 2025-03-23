import React, { useState, useRef, useEffect } from 'react'
import resourcesData from '@/data/resourcesData.json'

const ResourcesPage = () => {
  const [data] = useState(resourcesData);
  const [jobTitle, setJobTitle] = useState('Full Stack Developer');
  const [jobDescription, setJobDescription] = useState('Sample job description');
  // Pre-populated with recommended topics for a Full Stack Developer
  const [suggestedTopics, setSuggestedTopics] = useState(
    [1, 3, 4, 6, 7].map(id => resourcesData.topics.find(topic => topic.id === id))
  );
  // Pre-populated with recommended questions for a Full Stack Developer
  const [suggestedQuestions, setSuggestedQuestions] = useState(
    [1, 2, 3, 4, 5, 6].map(id => resourcesData.dsaQuestions.find(q => q.id === id))
  );
  const [isAnalyzed, setIsAnalyzed] = useState(true);
  
  // Message state
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      content: 'Welcome! Please share the job role and description you want to prepare for.',
      timestamp: new Date()
    },
    {
      sender: 'user',
      content: 'Full Stack Developer',
      timestamp: new Date()
    },
    {
      sender: 'assistant',
      content: 'Great! Now please paste the job description.',
      timestamp: new Date()
    },
    {
      sender: 'user',
      content: 'Sample job description for Full Stack Developer position',
      timestamp: new Date()
    },
    {
      sender: 'assistant',
      content: 'Based on the job description for Full Stack Developer, I\'ve prepared some recommended topics and practice questions for you. Check them out on the right side!',
      timestamp: new Date()
    }
  ]);
  
  // Input state
  const [inputMessage, setInputMessage] = useState('');
  
  // Function to analyze job description and provide recommendations
  const analyzeJobDescription = () => {
    if (!jobTitle.trim() || !jobDescription.trim()) {
      addMessage('assistant', 'Please provide both job title and description for analysis.');
      return;
    }
    
    // Simple keyword matching for demo
    let matchedRole = "Software Engineer"; // Default
    
    // Try to match job title to our predefined roles
    const roleTitles = data.jobRoles.map(role => role.title.toLowerCase());
    const userTitle = jobTitle.toLowerCase();
    
    for (const title of roleTitles) {
      if (userTitle.includes(title.toLowerCase()) || 
          title.toLowerCase().includes(userTitle)) {
        matchedRole = data.jobRoles.find(
          role => role.title.toLowerCase() === title
        ).title;
        break;
      }
    }
    
    // Find the matched role data
    const role = data.jobRoles.find(r => r.title === matchedRole);
    
    // Get recommended topics
    const topics = role.recommendedTopics.map(id => 
      data.topics.find(topic => topic.id === id)
    );
    
    // Get recommended questions
    const questions = role.recommendedQuestions.map(id =>
      data.dsaQuestions.find(q => q.id === id)
    );
    
    setSuggestedTopics(topics);
    setSuggestedQuestions(questions);
    setIsAnalyzed(true);
    
    addMessage('assistant', `Based on the job description for ${matchedRole}, I've prepared some recommended topics and practice questions for you. Check them out on the right side!`);
  };
  
  // Function to add a message to the chat
  const addMessage = (sender, content) => {
    const newMessage = {
      sender,
      content,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    addMessage('user', inputMessage);
    
    // Process the message
    if (!jobTitle) {
      setJobTitle(inputMessage);
      addMessage('assistant', 'Great! Now please paste the job description.');
    } else if (!jobDescription) {
      setJobDescription(inputMessage);
      addMessage('assistant', 'Thanks! Analyzing the job description...');
      
      // Short timeout to simulate processing
      setTimeout(analyzeJobDescription, 1000);
    } else {
      // Handle follow-up questions
      addMessage('assistant', 'I\'m here to help with your interview preparation. Let me know if you need more specific resources or have questions about any topic.');
    }
    
    setInputMessage('');
  };
  
  // Handle Enter key for sending messages
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex absolute inset-0 top-16 bg-gray-200 dark:bg-gray-900">
      {/* Left side - Chatbot space */}
      <div className="w-[calc(100%-210mm-20px)] h-full bg-gray-100 dark:bg-gray-800 p-4 rounded-l-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Interview Prep Assistant</h2>
        
        {/* Chatbot interface */}
        <div className="flex flex-col h-[calc(100%-32px)] bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md overflow-hidden">
          {/* Messages area */}
          <div className="flex-1 p-4 overflow-y-auto styled-scrollbar">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-4 p-3 rounded-lg max-w-[85%] shadow-sm ${
                  message.sender === 'assistant' 
                    ? 'bg-blue-100 dark:bg-blue-900/30' 
                    : 'bg-gray-100 dark:bg-gray-800 ml-auto'
                }`}
              >
                {message.sender === 'assistant' && (
                  <p className="font-medium text-gray-800 dark:text-white mb-1">Interview Prep Assistant</p>
                )}
                <p className="text-gray-700 dark:text-gray-200">{message.content}</p>
              </div>
            ))}
          </div>
          {/* Input area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
            <div className="flex">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={!jobTitle ? "Enter job title..." : !jobDescription ? "Paste job description..." : "Ask follow-up questions..."}
                className="flex-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200"
              />
              <button 
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-r-lg transition font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Resources with simple box layout */}
      <div className="flex-1 h-full overflow-auto p-4 rounded-r-lg">
        <div 
          className="w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg"
        >
          {/* Content container - scrollable */}
          <div className="p-6 styled-scrollbar">
            
            {!isAnalyzed ? (
              <div className="py-8">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Interview Preparation Resources</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Share your job title and description in the chat to get personalized study topics and practice questions for your interview.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-200">
                    <p className="font-medium mb-2">How it works:</p>
                    <ol className="list-decimal list-inside space-y-2 text-left">
                      <li>Enter the job title you're applying for</li>
                      <li>Paste the full job description</li>
                      <li>Get customized topics to study</li>
                      <li>Practice with relevant DSA questions</li>
                    </ol>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-6 border-b dark:border-gray-700 pb-3">
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Interview Preparation Plan</h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">Tailored resources for: {jobTitle}</p>
                </div>
                
                {/* Suggested Topics */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Recommended Topics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {suggestedTopics.map((topic) => (
                      <div key={topic.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">{topic.name}</h3>
                        <ul className="list-disc list-inside space-y-1 mb-3">
                          {topic.subtopics.map((subtopic, index) => (
                            <li key={index} className="text-gray-700 dark:text-gray-300">{subtopic}</li>
                          ))}
                        </ul>
                        {topic.resources && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resources:</p>
                            <ul className="space-y-1">
                              {topic.resources.map((resource, index) => (
                                <li key={index}>
                                  <a 
                                    href={resource} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                                  >
                                    {resource.replace(/(^\w+:|^)\/\//, '').split('/')[0]}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* DSA Questions */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Recommended Practice Questions</h2>
                  <div className="space-y-5">
                    {suggestedQuestions.map((question) => (
                      <div key={question.id} className="bg-white dark:bg-gray-750 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            <a 
                              href={question.leetcodeLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
                            >
                              {question.title}
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(LC-{question.leetcodeId})</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            question.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                            question.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}>
                            {question.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 my-2">{question.description}</p>
                        
                        {/* Solution approach */}
                        <div className="my-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                          <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Solution Approach:</p>
                          <p className="text-gray-700 dark:text-gray-300">{question.solution}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {question.tags.map((tag, index) => (
                            <span key={index} className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Common at: {question.companies.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResourcesPage 