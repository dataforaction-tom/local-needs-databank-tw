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
    <div className='flex'>
      <h2>{title || 'Observation Charts'}</h2>
      {Object.keys(groupByObservation).map(name => (
        <SingleObservationChart key={name} data={groupByObservation[name]} name={name} chartType={chartType} />
      ))}
    </div>
  );
}

export default MultiObservationsChart;

