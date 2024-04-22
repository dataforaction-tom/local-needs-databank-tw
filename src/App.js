import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Navigation from './Navigation';
import Health from './Health';
import Contribute from './Contribute';
import ErrorBoundary from './ErrorBoundary'; // Ensure this is correctly imported
import Test from './Test'

function App() {
  return (
    <Router>
      <Navigation /> {/* This will render the navigation bar */}
      <div className="App">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard dashboardId={1} />} />
            <Route path="/health" element={<Health />} />
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/context" element={<Test />} />
            {/* Define other routes corresponding to navItems in your Navigation component */}
          </Routes>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;





