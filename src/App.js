import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Navigation from './Navigation';
import Health from './Health';
// Import your page components for routing

function App() {
  return (
    <Router>
      <Navigation /> {/* This will render the navigation bar */}
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard dashboardId={1} />} />
          <Route path="/health" element={<Health/>} />
          {/* Define other routes corresponding to navItems in your Navigation component */}
          {/* For example:
              <Route path="/health-social" element={<HealthSocial />} />
              <Route path="/support" element={<Support />} />
              ... */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;




