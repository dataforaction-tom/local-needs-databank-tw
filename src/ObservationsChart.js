import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function ObservationsChart({ observations }) {
  const chartRef = useRef(null);
  const colorPalette = ['#662583', '#C7215D', '#881866', '#dd35a5'];

  useEffect(() => {
    if (!observations || observations.length === 0) {
      console.log("No observations data available for chart.");
      return; // Exit if no data is available
    }

    const chartContext = chartRef.current.getContext('2d');
    const places = [...new Set(observations.map(obs => obs.place))].sort();  // Define places array here

    if (window.myBarChart) {
      window.myBarChart.destroy();
    }

    const datasets = createDatasets(observations, places);  // Pass places to function

    window.myBarChart = new Chart(chartContext, {
      type: 'bar',
      data: {
        labels: places,
        datasets: datasets
      },
      options: {
        scales: {
          x: {
            stacked: false,
          },
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: true
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false
          }
        }
      }
    });

  }, [observations]);

  function createDatasets(data, places) {  // Accept places as an argument
    const datasetMap = {};

    data.forEach(obs => {
      const name = obs.name;
      const place = obs.place;
      const value = parseInt(obs.value, 10);

      if (!datasetMap[name]) {
        datasetMap[name] = {
          label: name,
          data: Array(places.length).fill(0),  // Initialize array based on number of places
          backgroundColor: colorPalette[(Object.keys(datasetMap).length) % colorPalette.length], // Cycle through the color palette
          borderColor: colorPalette[(Object.keys(datasetMap).length) % colorPalette.length] // Same color for border
        };
      }

      const index = places.indexOf(place);
      datasetMap[name].data[index] = (datasetMap[name].data[index] || 0) + value;
    });

    return Object.values(datasetMap);
  }

 

  return (
    <canvas ref={chartRef} />
  );
}

export default ObservationsChart;
