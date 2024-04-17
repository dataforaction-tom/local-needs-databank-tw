import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function ObservationsChart({ observations }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!observations || observations.length === 0) {
      console.log("No observations data available for chart.");
      return; // Exit if no data is available
    }

    const chartContext = chartRef.current.getContext('2d');
    const filteredObservations = observations.filter(obs => obs && obs.region); // Ensure obs is valid and has a region property
    const groupedData = groupDataByPlaceAndYear(filteredObservations);

    // Make sure groupedData is not empty and is a valid object
    if (!groupedData || Object.keys(groupedData).length === 0) {
      console.log("Grouped data is empty or invalid.");
      return; // Exit if grouped data is invalid
    }

    const chart = new Chart(chartContext, {
      type: 'bar',
      data: {
        labels: Object.keys(groupedData),
        datasets: Object.keys(groupedData[Object.keys(groupedData)[0]]).map(year => ({
          label: year,
          data: Object.values(groupedData).map(placeData => placeData[year] || 0),
          backgroundColor: getRandomColor(),
          stack: 'Stack 0'
        }))
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: true
          }
        }
      }
    });

    return () => chart && chart.destroy();
  }, [observations]);

  function groupDataByPlaceAndYear(data) {
    const grouped = {};
    data.forEach(item => {
      const place = item.place;
      const year = new Date(item.date).getFullYear();
      if (!grouped[place]) {
        grouped[place] = {};
      }
      grouped[place][year] = (grouped[place][year] || 0) + parseInt(item.value, 10);
    });
    return grouped;
  }

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  return (
    <canvas ref={chartRef} />
  );
}

export default ObservationsChart;
