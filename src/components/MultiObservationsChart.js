import React from 'react';
import SingleObservationChart from './SingleObservationChart';

function MultiObservationsChart({ observations, title, valueType }) {
  // Group data by observation name
  const groupByObservation = observations.reduce((acc, curr) => {
    acc[curr.name] = acc[curr.name] || [];
    acc[curr.name].push(curr);
    return acc;
  }, {});

  const colorPalette = ['#662583', '#C7215D', '#881866', '#dd35a5']; // Color palette

  return (
    <div className="my5">
      <h2 className="text-2xl font-bold text-center my-10">{title || 'Observation Charts'}</h2>
    
      {Object.keys(groupByObservation).map((name, index,) => (
        <SingleObservationChart 
          key={name} 
          data={groupByObservation[name]} 
          name={name} 
          startColorIndex={index % colorPalette.length} 
          colorPalette={colorPalette} 
          valueType={valueType}
        />
      ))}
    </div>
  );
}

export default MultiObservationsChart;


