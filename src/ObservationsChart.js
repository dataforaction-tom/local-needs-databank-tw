import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

function ObservationsChart({ observations, title }) {
  const chartRef = useRef(null);
  const colorPalette = ['#662583', '#C7215D', '#881866', '#dd35a5'];
  const [chartType, setChartType] = useState('bar'); // State to toggle between 'bar' and 'line'
  const chartTypes = ['bar', 'line', 'pie',];

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
      type: chartType,
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

  }, [observations, chartType]);

  function createDatasets(data, places, type) {
    const datasetMap = {};
  
    data.forEach(obs => {
      const name = obs.name;
      const value = parseInt(obs.value, 10);
  
      if (!datasetMap[name]) {
        datasetMap[name] = {
          label: name,
          data: [], // Initially empty, will aggregate differently based on chart type
          backgroundColor: [], // Colors will be added during aggregation
        };
      }
  
      datasetMap[name].data.push(value);
      datasetMap[name].backgroundColor.push(colorPalette[(Object.keys(datasetMap).length) % colorPalette.length]);
    });
  
    if (type === 'pie') {
      // For pie charts, we sum all values under each dataset name
      const pieData = Object.keys(datasetMap).map(key => {
        return {
          label: key,
          data: [datasetMap[key].data.reduce((acc, val) => acc + val, 0)], // Sum all values for pie chart
          backgroundColor: datasetMap[key].backgroundColor[0], // Just use the first color
        };
      });
      return pieData;
    }
  
    // For bar and line charts, data remains split by place
    return Object.values(datasetMap).map(dataset => ({
      ...dataset,
      data: places.map(place => dataset.data[places.indexOf(place)] || 0), // Assign 0 where no data
    }));
  }
  

  const toggleChartType = () => {
    const currentTypeIndex = chartTypes.indexOf(chartType);
    const nextTypeIndex = (currentTypeIndex + 1) % chartTypes.length;
    setChartType(chartTypes[nextTypeIndex]);
  };


  const downloadImage = () => {
    // Ensure the chart is rendered by checking if the canvas context is available
    if (chartRef.current) {
      // Create a Canvas element and convert it to a data URL image
      const url = chartRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      // You can set the filename you want here
      link.download = `${title || 'chart'}.png`;
      // Append the link to the body, click it, and then remove it
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
      <div className='flex justify-end mt-4'> {/* This div will push the button to the right */}
        <button 
            className='bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300'
            type='button'
            onClick={toggleChartType}
          >
            Toggle Chart Type
          </button>
          </div>
        <canvas ref={chartRef} />
        <div className='flex justify-end mt-4'> {/* This div will push the button to the right */}
       
          <button 
            className='bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300'
            type='button'
            onClick={downloadImage}
          >
            Download Chart
          </button>
        </div>
      </div>
      </div>
    
  );
  
}

export default ObservationsChart;
