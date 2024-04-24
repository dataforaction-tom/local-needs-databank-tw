import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import Health from './Health';
import Contribute from './Contribute';
import ErrorBoundary from './ErrorBoundary'; // Ensure this is correctly imported
import Context from './Context'
import { FilterProvider } from './components/FilterContext';
import Advice from './Advice'

function App() {
  return (  
    <FilterProvider>
    <Router>
      
      <Navigation /> {/* This will render the navigation bar */}
      <div className="App">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard dashboardId={1} />} />
            <Route path="/health" element={<Health />} />
            <Route path="/advice" element={<Advice />} />
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/context" element={<Context />} />
            {/* Define other routes corresponding to navItems in your Navigation component */}
          </Routes>
        </ErrorBoundary>
      </div>
      

    </Router>
    </FilterProvider>
  );
}

export default App;





