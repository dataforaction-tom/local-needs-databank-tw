import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ErrorBoundary from './ErrorBoundary';
import { FilterProvider } from './components/FilterContext';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from "@vercel/analytics/react";

const Health = lazy(() => import('./Health'));
const Youth = lazy(() => import('./Youth'));
const Contribute = lazy(() => import('./Contribute'));
const Context = lazy(() => import('./Context'));
const Advice = lazy(() => import('./Advice'));
const Charity = lazy(() => import('./Charity'));
const Explore = lazy(() => import('./Explore'));
const LandingPage = lazy(() => import('./LandingPage'));

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
              <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
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
              </Suspense>
        </ErrorBoundary>
      </div>
      

    </Router>
    </FilterProvider>
    </QueryClientProvider>
  );
}

export default App;





