import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navigation from './components/Navigation';
import Health from './Health';
import Youth from './Youth';
import Contribute from './Contribute';
import ErrorBoundary from './ErrorBoundary'; // Ensure this is correctly imported
import Context from './Context'
import { FilterProvider } from './components/FilterContext';
import Advice from './Advice'
import Charity from './Charity';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Explore from './Explore';
import LandingPage from './LandingPage';
import { Analytics } from "@vercel/analytics/react"

const queryClient = new QueryClient();

Chart.register(ChartDataLabels);
Chart.defaults.plugins.datalabels.display = false;


function App() {
  return (  
    <QueryClientProvider client={queryClient}>
    <FilterProvider>
    <Router>
    <Analytics/>
      <Navigation /> 
      <div className="App">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/health" element={<Health />} />
            <Route path="/advice" element={<Advice />} />
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/context" element={<Context />} />
            <Route path="/charity" element={<Charity />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/youth" element={<Youth />} />
            
          </Routes>
        </ErrorBoundary>
      </div>
      

    </Router>
    </FilterProvider>
    </QueryClientProvider>
  );
}

export default App;





