import React, { useEffect, useRef, useState, useMemo } from 'react';
import Chart from 'chart.js/auto';

function ObservationsChart({ observations, title }) {
  const chartRef = useRef(null);
  const colorPalette = ['#662583', '#C7215D', '#881866', '#dd35a5'];
  const [chartType, setChartType] = useState('bar'); // Start with vertical bar chart
  const [indexAxis, setIndexAxis] = useState('x'); // Default to vertical bars
  const [colorMapping, setColorMapping] = useState({});

  // Compute color mapping to ensure consistency
  const computedColorMapping = useMemo(() => {
    const newColorMapping = {};
    observations.forEach((obs, index) => {
      if (!newColorMapping[obs.name]) {
        newColorMapping[obs.name] = colorPalette[index % colorPalette.length]; // Assign colors in a loop
      }
    });
    return newColorMapping;
  }, [observations]);

  useEffect(() => {
    const chartContext = chartRef.current.getContext('2d');
    const places = [...new Set(observations.map(obs => obs.place))].sort();

    if (window.myBarChart) {
      window.myBarChart.destroy();
    }

    const datasets = createDatasets(observations, places, computedColorMapping);

    window.myBarChart = new Chart(chartContext, {
      type: chartType,
      data: {
        labels: places,
        datasets: datasets
      },
      options: {
        indexAxis: indexAxis, // 'x' for vertical, 'y' for horizontal
        scales: {
          x: {
            barPercentage: 1,
            categoryPercentage: 0.6
          },
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

  }, [observations, chartType, computedColorMapping, indexAxis]);

  function createDatasets(data, places, colorMapping) {
    const datasetMap = {};

    data.forEach(obs => {
      const name = obs.name;
      const value = parseInt(obs.value, 10);

      if (!datasetMap[name]) {
        datasetMap[name] = {
          label: name,
          data: Array(places.length).fill(0),
          backgroundColor: colorMapping[name],
          borderColor: colorMapping[name]
        };
      }
      const placeIndex = places.indexOf(obs.place);
      if (placeIndex !== -1) {
        datasetMap[name].data[placeIndex] = value;
      }
    });

    return Object.values(datasetMap);
  }

  const toggleChartType = () => {
    setIndexAxis(indexAxis === 'x' ? 'y' : 'x'); // Toggle index axis to switch chart orientation
  };

  const downloadImage = () => {
    if (chartRef.current) {
      const url = chartRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'chart'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error('Error: Chart reference is not available.');
    }
  };

  return (
    <div className='relative p-5 m-5'>
      <h2 className='text-xl font-bold'>{title || 'Filtered Observations Table'}</h2>
      <div className='flex flex-col'>
        <div className='flex justify-end mt-4'>
          <button 
              className='bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300'
              onClick={toggleChartType}>
            Toggle Chart Orientation
          </button>
        </div>
        <canvas ref={chartRef} />
        <div className='flex justify-end mt-4'>
          <button 
              className='bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300'
              onClick={downloadImage}>
            Download Chart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ObservationsChart;
