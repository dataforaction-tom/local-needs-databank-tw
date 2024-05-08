import React, { useEffect, useRef, useState, useMemo } from 'react';
import Chart from 'chart.js/auto';

// Custom hook to adjust chart height dynamically based on window width
const useResponsiveChart = (chartRef) => {
  useEffect(() => {
    const handleResize = () => {
      // Adjust height when width is below a breakpoint
      if (window.innerWidth < 768) {
        chartRef.current.style.height = '400px'; // Set a more suitable height for mobile
      } else {
        chartRef.current.style.height = '600px'; // Use default height for non-mobile devices
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size on load

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [chartRef]);
};

function ObservationsChart({ observations, title }) {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null); // State to hold the chart instance
  useResponsiveChart(chartRef); // Apply the responsive hook
  const [indexAxis, setIndexAxis] = useState('x');

 const colorPalette = useMemo(() => {
  return ['#662583', '#C7215D', '#881866', '#dd35a5', '#EE4023'];
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
  const places = [...new Set(observations.map(obs => obs.place))].sort();

  chartInstance && chartInstance.destroy(); // Destroy existing chart before creating a new one

  const datasets = createDatasets(observations, places, computedColorMapping);
  const newChartInstance = new Chart(chartContext, {
    type: 'bar',
    data: { labels: places, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis,
      scales: {
        x: { barPercentage: 1, categoryPercentage: 0.6 },
        y: { beginAtZero: false }
      },
      plugins: { legend: { display: true } }
    }
  });

  setChartInstance(newChartInstance); // Save the new chart instance
  return () => newChartInstance.destroy(); // Cleanup on component unmount
}, [observations, computedColorMapping, indexAxis]);

  function createDatasets(data, places, colorMapping) {
    const datasetMap = {};

    data.forEach(obs => {
      const name = obs.name;
      const value = parseFloat(obs.value);

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

  const toggleChartAxisNew = () => {
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
      
      <div style={{ position: 'relative', width: '100%', Height: '400px' }}>
          <canvas ref={chartRef} />
        </div>
        <div className='flex flex-col md:flex-row justify-end mt-4 space-y-2 md:space-y-0 md:space-x-2'>
        <button 
              className='bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300'
              onClick={toggleChartAxisNew}>
            Toggle Chart Orientation
          </button>
          <button 
              className='bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300'
              onClick={downloadImage}>
            Download Chart
          </button>
        </div>
      </div>
    
  );
}

export default ObservationsChart;
