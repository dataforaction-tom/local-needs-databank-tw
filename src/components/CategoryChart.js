import React, { useRef, useEffect, useState } from 'react';
import Chart from 'chart.js/auto';




function CategoryObservationChart({ observations, title, colorPalette, name }) {
  
  const chartRef = useRef(null);
  const [chartType, setChartType] = useState('bar'); // Default to 'bar' chart type
  const [indexAxis, setIndexAxis] = useState('y'); // Default to 'x' as the index axis
  

  

  useEffect(() => {
    const handleResize = () => {
      if (window[`chart_${title}`]) {
        window[`chart_${title}`].resize();
      }
    };

    window.addEventListener('resize', handleResize);

    const chartContext = chartRef.current.getContext('2d');
    if (window[`chart_${title}`]) {
      window[`chart_${title}`].destroy();
    }

    const labels = [...new Set(observations.map(d => d.name))].sort(); // Use 'name' as labels for the x-axis
    const singleColor = '#662583'; // Hardcoded single color for all items

    const datasets = [{
      label: title,
      data: labels.map(label => {
        const total = observations.filter(d => d.name === label).reduce((sum, item) => sum + parseInt(item.value, 10), 0);
        return total;
      }),
      backgroundColor: singleColor,
      borderColor: singleColor
    }];

    window[`chart_${title}`] = new Chart(chartContext, {
      type: chartType,
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis,
        plugins: {
          legend: {
            display: true
          },
          datalabels: {
            display: true,  // Enable datalabels only for this chart
            anchor: 'center',
            align: 'center',
            formatter: (value, ctx) => {
              return value;
            },
            color: '#fff',  // Sets the text color of datalabels
            font: {
              weight: 'bold'
            }
          }
        },
        scales: {
          x: {
            display: true,
            stacked: chartType === 'bar'
          },
          y: {
            display: true,
            stacked: chartType === 'bar',
            beginAtZero: true
          }
        }
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window[`chart_${title}`]) {
        window[`chart_${title}`].destroy();
      }
    };
  }, [observations, chartType, indexAxis, colorPalette, title]); // Dependencies on data, chartType, indexAxis, colorPalette, and title

  const toggleChartType = () => {
    const types = ['bar', 'line', 'pie'];
    setChartType(prevType => {
      const nextIndex = (types.indexOf(prevType) + 1) % types.length;
      return types[nextIndex];
    });
  };

  const toggleAxis = () => {
    setIndexAxis(prevAxis => (prevAxis === 'x' ? 'y' : 'x'));
  };

  const downloadChart = () => {
    if (chartRef.current) {
      const url = chartRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '_')}_chart.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={`relative p-5 m-5 flex flex-col ${chartType === 'pie' ? 'w-full h-full' : 'w-full'}`}>
      <h2 className='text-xl font-bold'>{title || 'Chart'}</h2>
      <div style={{ position: 'relative', width: '100%', minHeight: '400px' }}>
        <canvas ref={chartRef} />
      </div>
      <div className='flex flex-col md:flex-row justify-end mt-4 space-y-2 md:space-y-0 md:space-x-2'>
        <button 
          className='bg-[#662583] text-white font-medium py-2 px-4 rounded hover:bg-[#C7215D] transition-colors duration-300 text-sm'
          onClick={toggleChartType}>
          Toggle Chart Type
        </button>
        {chartType === 'bar' && (
          <button 
            className='bg-[#662583] text-white font-medium py-2 px-4 rounded hover:bg-[#C7215D] transition-colors duration-300 text-sm'
            onClick={toggleAxis}>
            Toggle Axis
          </button>
        )}
        <button 
          className='bg-[#662583] text-white font-medium py-2 px-4 rounded hover:bg-[#C7215D] transition-colors duration-300 text-sm'
          onClick={downloadChart}>
          Download Chart
        </button>
      </div>
    </div>
  );
}
export default CategoryObservationChart;
