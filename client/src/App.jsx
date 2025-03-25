import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import Auth from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ResumePage from './pages/ResumePage';
import ResourcesPage from './pages/ResourcesPage';
import HomePage from './pages/HomePage';
import CoverLetterPage from './pages/CoverLetterPage';
import InterviewPage from './pages/InterviewPage';
import ExtensionPage from './pages/ExtensionPage';
import ScraperPage from './pages/ScraperPage';

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/:id/dashboard/" element={<Dashboard />} >
            <Route index element={<HomePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="cover-letter" element={<CoverLetterPage />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="interview" element={<InterviewPage />} />
            <Route path="extension" element={<ExtensionPage />} />
            <Route path="job-search" element={<ScraperPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;