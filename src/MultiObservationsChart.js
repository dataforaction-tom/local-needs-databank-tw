import React from 'react';
import SingleObservationChart from './SingleObservationChart';
import { useState, useEffect } from 'react';


function MultiObservationsChart({ observations, title }) {
  const [chartType, setChartType] = useState('bar'); // State to toggle between 'bar' and 'line'

  // Group data by observation name
  const groupByObservation = observations.reduce((acc, curr) => {
    acc[curr.name] = acc[curr.name] || [];
    acc[curr.name].push(curr);
    return acc;
  }, {});

  return (
    <div className="my5">
      <h2 className="text-2xl font-bold text-center my-10">{title || 'Observation Charts'}</h2>
    <div className='grid-cols-2'>
      
      {Object.keys(groupByObservation).map(name => (
        <SingleObservationChart key={name} data={groupByObservation[name]} name={name} chartType={chartType} />
      ))}
    </div>
    </div>
  );
}

export default MultiObservationsChart;

