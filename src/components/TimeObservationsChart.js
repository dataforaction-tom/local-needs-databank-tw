import React, { useEffect, useRef, useState, useMemo } from 'react';
import Chart from 'chart.js/auto';

// Custom hook to adjust chart height dynamically based on window width
const useResponsiveChart = (chartRef) => {
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) { // Adjust breakpoint as needed
        chartRef.current.style.height = '400px'; // Set a more suitable height for mobile
      } else {
        chartRef.current.style.height = '600px'; // Default height for larger screens
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize the size on component mount

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [chartRef]);
};

function TimeObservationsChart({ observations, title }) {
  const chartRef = useRef(null);
  useResponsiveChart(chartRef); // Apply the responsive hook to adjust chart height

  
  const [chartType, setChartType] = useState('bar');
  const [indexAxis, setIndexAxis] = useState('x');

  const colorPalette = useMemo(() => {
    return ['#662583', '#C7215D', '#881866', '#dd35a5'];
  }, []); // Empty dependency array means this runs only once when the component mounts

  const computedColorMapping = useMemo(() => {
    const newColorMapping = {};
    observations.forEach((obs, index) => {
      if (!newColorMapping[obs.name]) {
        newColorMapping[obs.name] = colorPalette[index % colorPalette.length];
      }
    });
    return newColorMapping;
  }, [observations, colorPalette]); 
  

  useEffect(() => {
    const chartContext = chartRef.current.getContext('2d');
    const years = [...new Set(observations.map(obs => new Date(obs.date).getFullYear()))].sort();

    if (window.TimeObservationsChart) {
      window.TimeObservationsChart.destroy();
    }

    const datasets = createDatasets(observations, years, computedColorMapping);

    window.TimeObservationsChart = new Chart(chartContext, {
      type: chartType,
      data: {
        labels: years,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: chartType === 'bar' ? indexAxis : undefined,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          x: {
            display: chartType !== 'pie',
            stacked: chartType === 'bar'
          },
          y: {
            display: chartType !== 'pie',
            stacked: chartType === 'bar',
            beginAtZero: true
          }
        }
      }
    });

    return () => {
      if (window.TimeObservationsChart) {
        window.TimeObservationsChart.destroy();
      }
    };
  }, [observations, chartType, computedColorMapping, indexAxis]);

  function createDatasets(data, years, colorMapping) {
    const datasetMap = {};

    data.forEach(obs => {
      const name = obs.name;
      const value = parseInt(obs.value, 10);
      const year = new Date(obs.date).getFullYear();

      if (!datasetMap[name]) {
        datasetMap[name] = {
          label: name,
          data: Array(years.length).fill(0),
          backgroundColor: colorMapping[name],
          borderColor: colorMapping[name]
        };
      }
      const yearIndex = years.indexOf(year);
      if (yearIndex !== -1) {
        datasetMap[name].data[yearIndex] = value;
      }
    });

    return Object.values(datasetMap);
  }

  const toggleChartType = () => {
    const types = ['bar', 'line'];
    setChartType(prevType => {
      const nextIndex = (types.indexOf(prevType) + 1) % types.length;
      return types[nextIndex];
    });
    if (chartType === 'bar') {
      setIndexAxis(indexAxis === 'x' ? 'y' : 'x');
    }
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
    <div className='relative p-5 m-5 flex flex-col'>
      <h2 className='text-xl font-bold'>{title || 'Filtered Observations Table'}</h2>
      
        
        <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
          <canvas ref={chartRef} />
        </div>
        <div className='flex flex-col md:flex-row justify-end mt-4 space-y-2 md:space-y-0 md:space-x-2'>
        <button 
              className='bg-[#662583] text-white font-medium py-2 px-4 rounded hover:bg-[#C7215D] transition-colors duration-300 text-sm'
              onClick={toggleChartType}>
            Toggle Chart Type
          </button>
          <button 
              className='bg-[#662583] text-white font-medium py-2 px-4 rounded hover:bg-[#C7215D] transition-colors duration-300 text-sm'
              onClick={downloadImage}>
            Download Chart
          </button>
        </div>
      </div>
    
  );
}

export default TimeObservationsChart;
