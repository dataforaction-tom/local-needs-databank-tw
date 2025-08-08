import React, { useEffect, useRef, useState, useMemo } from 'react';
import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register the annotation plugin
Chart.register(annotationPlugin);

const useResponsiveChart = (chartRef) => {
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        chartRef.current.style.height = '400px';
      } else {
        chartRef.current.style.height = '600px';
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size on load

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [chartRef]);
};

const ObservationsChart = React.memo(function ObservationsChart({ observations, title, baseline, baselineLabel }) {
  console.log(baseline, baselineLabel);
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  useResponsiveChart(chartRef); 
  const [indexAxis, setIndexAxis] = useState('x');

  // Base brand colours
  const baseColors = useMemo(() => ['#662583', '#C7215D', '#881866', '#dd35a5', '#EE4023'], []); 

  // Memoise computedColorMapping to avoid recalculating every render
  const computedColorMapping = useMemo(() => {
    const newColorMapping = {};
    observations.forEach((obs, index) => {
      const color = baseColors[index % baseColors.length];
      const datasetKey = `${obs.name} (${obs.year})`;

      if (!newColorMapping[datasetKey]) {
        newColorMapping[datasetKey] = color;
      }
    });
    return newColorMapping;
  }, [observations, baseColors]);

  useEffect(() => {
    if (!chartRef.current) return;
  
    const chartContext = chartRef.current.getContext('2d');
    const places = [...new Set(observations.map(obs => obs.place))].sort();
  
    // Destroy existing chart before creating a new one
    if (chartInstance) {
      chartInstance.destroy();
    }
  
  // Create datasets for observations
  const datasets = createDatasets(observations, places, computedColorMapping);

  // Conditionally add the baseline dataset if baseline and baselineLabel are defined
  if (baseline && baselineLabel) {
    datasets.push({
      label: `${baselineLabel}: ${baseline}`, // This appears in the legend
      data: Array(places.length).fill(null), // Empty data, won't plot anything
      borderColor: 'rgba(75, 192, 192, 0.8)', // Match the annotation color
      backgroundColor: 'transparent', // Prevent bars from being drawn
      borderWidth: 2,
      type: 'line' // Makes it look like a line in the legend
    });
  }

  // Define the baseline annotation if the `baseline` prop is passed
  const baselineAnnotation = baseline ? {
    type: 'line',
    yMin: baseline, // Set baseline value on the y-axis
    yMax: baseline,
    borderColor: 'rgba(75, 192, 192, 0.8)',
    borderWidth: 2,
    borderDash: [6, 6], 
    label: {
      enabled: true,
      content: baselineLabel ? baselineLabel : `Baseline: ${baseline}`, // Use label if available
      position: 'end',
      backgroundColor: 'rgba(75, 192, 192, 0.8)',
      color: '#fff',
      padding: 10,
      font: {
        style: 'bold',
        size: 15
      }
    }
  } : null;
  
    const formatNumber = (num) => new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(num);

    const newChartInstance = new Chart(chartContext, {
      type: 'bar',
      data: { labels: places, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis,
        normalized: true,
        animation: false,
        scales: {
          x: { barPercentage: 1, categoryPercentage: 0.6 },
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) => formatNumber(value)
            }
          }
        },
        plugins: {
          legend: { display: true },
          annotation: {
            annotations: baselineAnnotation ? { line1: baselineAnnotation } : {}
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed?.y ?? context.parsed;
                return `${label}: ${formatNumber(value)}`;
              }
            }
          }
        }
      }
    });
  
    setChartInstance(newChartInstance);
  
    // Cleanup to avoid memory leaks
    return () => {
      newChartInstance.destroy();
    };
  }, [chartRef, observations, computedColorMapping, indexAxis, baseline, baselineLabel]);

  function createDatasets(data, places, colorMapping) {
    const datasetMap = {};

    data.forEach(obs => {
      const name = obs.name;
      const year = obs.year;
      const value = parseFloat(obs.value);

      const datasetKey = `${name} (${year})`;

      if (!datasetMap[datasetKey]) {
        datasetMap[datasetKey] = {
          label: datasetKey,
          data: Array(places.length).fill(0),
          backgroundColor: colorMapping[datasetKey],
          borderColor: colorMapping[datasetKey]
        };
      }

      const placeIndex = places.indexOf(obs.place);
      if (placeIndex !== -1) {
        datasetMap[datasetKey].data[placeIndex] = value;
      }
    });

    return Object.values(datasetMap);
  }

  const toggleChartAxisNew = () => {
    setIndexAxis(indexAxis === 'x' ? 'y' : 'x');
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
      <h2 className='text-xl font-bold'>{title || 'Filtered Observations Chart'}</h2>

      <div style={{ position: 'relative', width: '100%', height: '400px' }}>
        <canvas ref={chartRef} />
      </div>
      <div className='flex flex-col md:flex-row justify-end mt-4 space-y-2 md:space-y-0 md:space-x-2'>
        <button
          className='bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300'
          onClick={toggleChartAxisNew}
        >
          Toggle Chart Orientation
        </button>
        <button
          className='bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300'
          onClick={downloadImage}
        >
          Download Chart
        </button>
      </div>
    </div>
  );
});

export default ObservationsChart;
