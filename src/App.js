import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import ErrorBoundary from './ErrorBoundary';
import { FilterProvider } from './components/FilterContext';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from "@vercel/analytics/react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence } from 'framer-motion';
import PageContainer from './components/PageContainer';

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


function AppRoutes() {
  const location = useLocation();
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageContainer><LandingPage /></PageContainer>} />
            <Route path="/health" element={<PageContainer><Health /></PageContainer>} />
            <Route path="/advice" element={<PageContainer><Advice /></PageContainer>} />
            <Route path="/contribute" element={<PageContainer><Contribute /></PageContainer>} />
            <Route path="/context" element={<PageContainer><Context /></PageContainer>} />
            <Route path="/charity" element={<PageContainer><Charity /></PageContainer>} />
            <Route path="/explore" element={<PageContainer><Explore /></PageContainer>} />
            <Route path="/youth" element={<PageContainer><Youth /></PageContainer>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FilterProvider>
        <Router>
          <Analytics />
          <ToastContainer position="bottom-right" newestOnTop closeOnClick pauseOnHover theme="light" />
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-white text-slate-900 px-3 py-2 rounded shadow">Skip to main content</a>
          <Navigation />
          <main id="main" className="App">
            <AppRoutes />
          </main>
        </Router>
      </FilterProvider>
    </QueryClientProvider>
  );
}

export default App;





