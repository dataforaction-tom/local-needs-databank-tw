import React, { useRef, useEffect, useState } from 'react';
import Chart from 'chart.js/auto';

function SingleObservationChart({ data, name, title, startColorIndex, colorPalette, defaultChartType = 'bar' }) {
  const chartRef = useRef(null);

  const [chartType, setChartType] = useState(defaultChartType);
  const [indexAxis, setIndexAxis] = useState('x');

  useEffect(() => {
    const handleResize = () => {
      // Force the chart to resize on window resize
      if (window[`chart_${name}`]) {
        window[`chart_${name}`].resize();
      }
    };

    window.addEventListener('resize', handleResize);

    const chartContext = chartRef.current.getContext('2d');
    if (window[`chart_${name}`]) {
      window[`chart_${name}`].destroy();
    }

    const places = [...new Set(data.map(d => d.place))].sort();
    const dataByYear = data.reduce((acc, d) => {
      const year = new Date(d.date).getFullYear();
      acc[year] = acc[year] || {};
      acc[year][d.place] = (acc[year][d.place] || 0) + parseFloat(d.value);
      return acc;
    }, {});

    const datasets = Object.keys(dataByYear).map((year, index) => ({
      label: `${name} ${year}`,
      data: places.map(place => dataByYear[year][place] || 0),
      backgroundColor: chartType === 'pie' ? places.map((_, placeIndex) => colorPalette[(startColorIndex + placeIndex) % colorPalette.length]) : colorPalette[(startColorIndex + index) % colorPalette.length],
      borderColor: chartType === 'pie' ? places.map((_, placeIndex) => colorPalette[(startColorIndex + placeIndex) % colorPalette.length]) : colorPalette[(startColorIndex + index) % colorPalette.length]
    }));

    window[`chart_${name}`] = new Chart(chartContext, {
      type: chartType,
      data: {
        labels: places,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: chartType === 'bar' ? indexAxis : undefined,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(tooltipItem) {
                let label = tooltipItem.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
                const currentValue = tooltipItem.raw;
                const percentage = ((currentValue / total) * 100).toFixed(2) + '%';
                label += currentValue + ' (' + percentage + ')';
                return label;
              }
            }
          },
          legend: {
            display: true
          }
        },
        scales: {
          x: {
            display: chartType !== 'pie',
            stacked: chartType !== 'line'
          },
          y: {
            display: chartType !== 'pie',
            stacked: chartType !== 'line',
            beginAtZero: true
          }
        }
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window[`chart_${name}`]) {
        window[`chart_${name}`].destroy();
      }
    };
  }, [data, chartType, indexAxis, startColorIndex, colorPalette, name]);

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
      link.download = `${name}_chart.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={`relative p-5 m-5 flex flex-col ${chartType === 'pie' ? 'w-full h-full' : 'w-full'}`}>
      <h2 className='text-xl font-bold'>{title || `${name} Chart`}</h2>
      <div style={{ position: 'relative', width: '100%', minHeight: '400px' }}>
        <canvas ref={chartRef} />
      </div>
      <div className='flex flex-col md:flex-row justify-end mt-4 space-y-2 md:space-y-0 md:space-x-2'>
        <button 
          className='bg-[#662583] text-white font-medium py-2 px-4 rounded hover:bg-[#C7215D] transition-colors duration-300 text-sm'
          onClick={toggleChartType}
        >
          Toggle Chart Type
        </button>
        {chartType === 'bar' && (
          <button 
            className='bg-[#662583] text-white font-medium py-2 px-4 rounded hover:bg-[#C7215D] transition-colors duration-300 text-sm'
            onClick={toggleAxis}
          >
            Toggle Axis
          </button>
        )}
        <button 
          className='bg-[#662583] text-white font-medium py-2 px-4 rounded hover:bg-[#C7215D] transition-colors duration-300 text-sm'
          onClick={downloadChart}
        >
          Download Chart
        </button>
      </div>
    </div>
  );
}
export default SingleObservationChart;

