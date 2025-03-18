import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Layout from './pages/Layout';
import { Navigate } from 'react-router-dom';
import Resume from './pages/Resume';
import MockInterview from './pages/MockInterview';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route for the Landing page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
        
        {/* Authentication route */}
        <Route path="/auth" element={<Auth />} />

        {/* Dashboard route wrapped inside Layout */}
        <Route path="/user" element={<Layout />}>
          <Route index element={<Navigate to="dashboard" />} /> {/* Redirect to dashboard by default */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="resume-tailoring" element={<Resume/>} />
          <Route path="mock-interview" element={<MockInterview />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

