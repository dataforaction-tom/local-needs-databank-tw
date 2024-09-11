import React, { useEffect, useRef, useMemo } from 'react';
import { Radar } from 'react-chartjs-2';

const RadarChart = ({ observations, title }) => {
  const chartRef = useRef(null);

  const colorPalette = useMemo(() => {
    return ['#662583', '#C7215D', '#881866', '#dd35a5', '#EE4023'];
  }, []); // Empty dependency array means this runs only once when the component mounts

  const categories = useMemo(() => {
    return [...new Set(observations.map(obs => obs.name))].sort();
  }, [observations]);

  const places = useMemo(() => {
    return [...new Set(observations.map(obs => obs.place))].sort();
  }, [observations]);

  const computedColorMapping = useMemo(() => {
    const newColorMapping = {};
    places.forEach((place, index) => {
      newColorMapping[place] = colorPalette[index % colorPalette.length];
    });
    return newColorMapping;
  }, [places, colorPalette]);

  const data = useMemo(() => {
    const datasets = places.map(place => {
      const placeObservations = observations.filter(obs => obs.place === place);
      const data = categories.map(category => {
        const observation = placeObservations.find(obs => obs.name === category);
        return observation ? parseFloat(observation.value) : 0;
      });

      return {
        label: place,
        data,
        backgroundColor: computedColorMapping[place] + '33', // Add some transparency
        borderColor: computedColorMapping[place],
        pointBackgroundColor: computedColorMapping[place],
        pointBorderColor: '#fff',
      };
    });

    return {
      labels: categories,
      datasets,
    };
  }, [observations, categories, places, computedColorMapping]);

  return (
    <div className="relative p-5 m-5">
      <h2 className="text-xl font-bold">{title || 'Radar Chart'}</h2>
      <Radar ref={chartRef} data={data} options={{ responsive: true }} />
    </div>
  );
};

export default RadarChart;
