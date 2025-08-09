import React from 'react';
import TopAreasDashboard from './components/TopAreasDashboard';

export default function TopAreas() {
  return (
    <div className="p-4 md:p-6">
      <section className="max-w-5xl mx-auto mb-6 bg-white rounded-lg shadow p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-2">Highest and Lowest Areas by Need</h1>
        <p className="text-slate-700 mb-2">
          This page shows the areas with the highest and lowest values for each selected dataset’s observations. We present two charts per observation:
          the top 10 areas and the lowest 10 areas. A “spread” value (max − min) is also shown to highlight variation.
        </p>
        <h2 className="text-xl font-semibold mt-4 mb-1">Methodology</h2>
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          <li>We fetch observations for the selected dataset(s).</li>
          <li>For each area, we keep the most recent year&apos;s value per observation name.</li>
          <li>Areas with missing, non-numeric, or zero values are excluded.</li>
          <li>
            If &quot;Normalise by population&quot; is enabled, we compute per-capita values using population data loaded from the ONS
            (Estimated Population mid-2019). We calculate per 100,000 residents and only include observations where the base count meets the minimum threshold.
          </li>
          <li>We then rank areas by value to produce the highest 10 and lowest 10 lists for each observation.</li>
        </ul>
        <p className="text-slate-700 mt-2">
          Notes: Different datasets may define observations differently. When multiple datasets are selected, we label each observation with its dataset title
          so the rankings remain interpretable. Population matching uses local authority code where available or name-based matching as a fallback.
        </p>
      </section>
      <TopAreasDashboard />
    </div>
  );
}


