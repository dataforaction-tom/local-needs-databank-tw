import React, { useEffect, useRef, useState, useMemo } from 'react';
import Chart from 'chart.js/auto';

const useResponsiveChart = (chartRef) => {
  useEffect(() => {
    const handleResize = () => {
      chartRef.current.style.height = window.innerWidth < 768 ? '400px' : '600px';
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize the size on component mount
    return () => window.removeEventListener('resize', handleResize);
  }, [chartRef]);
};

function TimeObservationsChart({ observations, title, defaultChartType='line' }) {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  const [chartType, setChartType] = useState(defaultChartType);
  const [indexAxis, setIndexAxis] = useState('x');

  const colorPalette = useMemo(() => ['#662583', '#C7215D', '#881866', '#dd35a5', '#F26F21', '#EE4023'], []);
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
    const mostRecentYear = years[0]; // Most recent year
  
    // Clear previous chart instance if it exists
    if (chartInstance) {
      
      chartInstance.destroy();
    }
  
    
   
  const datasets = createDatasets(observations, years, computedColorMapping, mostRecentYear, chartType);
  const labels = chartType === 'pie' ? datasets[0].labels : years;
    const newChartInstance = new Chart(chartContext, {
      type: chartType,
      data: {
        labels: labels,
        datasets: datasets
      },
      options: getChartOptions(chartType, indexAxis)
    });
    setChartInstance(newChartInstance);
  
    return () => {
      
      newChartInstance.destroy();
    };
  }, [observations, chartType, computedColorMapping, indexAxis]);
  

  function createDatasets(data, years, colorMapping, mostRecentYear, type) {
    const datasetMap = {};
    data.forEach(obs => {
      const name = obs.name;
      const value = parseFloat(obs.value, 10);
      const year = new Date(obs.date).getFullYear();
  
      if (!datasetMap[name]) {
        datasetMap[name] = {
          label: name,
          data: type === 'pie' ? [0] : Array(years.length).fill(0),
          backgroundColor: colorMapping[name],
          borderColor: colorMapping[name]
        };
      }
  
      const yearIndex = years.indexOf(year);
      if (yearIndex !== -1) {
        if (type === 'pie' && year === mostRecentYear) {
          datasetMap[name].data[0] += value;  // Aggregate values for the most recent year
        } else if (type !== 'pie') {
          datasetMap[name].data[yearIndex] = value;
        }
      }
    });
  
    let datasets = Object.values(datasetMap);
    if (type === 'pie') {
      return [{
        data: datasets.map(ds => ds.data[0]),
        backgroundColor: datasets.map(ds => ds.backgroundColor),
        borderColor: datasets.map(ds => ds.borderColor),
        labels: datasets.map(ds => ds.label)  // Labels for each pie segment
      }];
    } else {
      return datasets;
    }
  }
  
  
  

  function getChartOptions(type, axis) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: type === 'bar' ? axis : undefined,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        x: {
          display: type !== 'pie',
          stacked: type === 'bar'
        },
        y: {
          display: type !== 'pie',
          stacked: type === 'bar',
          beginAtZero: false,
        }
      }
    };
  }

  const toggleChartType = () => {
    const types = ['bar', 'line', 'pie'];
    setChartType(prevType => {
      const nextIndex = (types.indexOf(prevType) + 1) % types.length;
      return types[nextIndex];
    });
    setIndexAxis(prevAxis => prevAxis === 'x' ? 'y' : 'x');
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
      
    }
  };

  return (
    <div className='relative p-5 m-5 flex flex-col'>
      <h2 className='text-xl font-bold'>{title || 'Filtered Observations Table'}</h2>
      <div style={{ position: 'relative', width: '100%', height: '400px' }}>
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
