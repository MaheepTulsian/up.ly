import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/auth" element={<Auth />} />

        <Route path="/:id/dashboard/" element={<Dashboard />} >
          {/* <Route path="profile" element={<Profile />} /> */}
        
        </Route>
      </Routes>
    </Router>
  )
}

export default App
