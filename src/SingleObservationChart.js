import React, { useRef, useEffect, useState } from 'react';
import Chart from 'chart.js/auto';

function SingleObservationChart({ data, name, title }) {
  const chartRef = useRef(null);
  const colorPalette = ['#662583', '#C7215D', '#881866', '#dd35a5'];
  const [chartType, setChartType] = useState('bar');
  const [indexAxis, setIndexAxis] = useState('x');

  useEffect(() => {
    const chartContext = chartRef.current.getContext('2d');
    if (window[`chart_${name}`]) {
      window[`chart_${name}`].destroy();
    }

    const places = [...new Set(data.map(d => d.place))].sort();
    const dataByYear = data.reduce((acc, d) => {
      const year = new Date(d.date).getFullYear();
      acc[year] = acc[year] || {};
      acc[year][d.place] = (acc[year][d.place] || 0) + parseInt(d.value, 10);
      return acc;
    }, {});

    const datasets = Object.keys(dataByYear).map((year, index) => ({
      label: `${name} ${year}`,
      data: places.map(place => dataByYear[year][place] || 0),
      backgroundColor: chartType === 'pie' ? places.map((_, placeIndex) => colorPalette[placeIndex % colorPalette.length]) : colorPalette[index % colorPalette.length],
      borderColor: chartType === 'pie' ? places.map((_, placeIndex) => colorPalette[placeIndex % colorPalette.length]) : colorPalette[index % colorPalette.length]
    }));

    

    window[`chart_${name}`] = new Chart(chartContext, {
      type: chartType,
      data: {
        labels: places,
        datasets: datasets
      },
      options: {
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
      window[`chart_${name}`].destroy();
    };
  }, [data, chartType, indexAxis]);

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
    <div className={`relative p-5 m-5 flex flex-col ${chartType === 'pie' ? 'w-1/2 h-1/2' : 'w-full h-auto'}`}>
      <h2 className='text-xl font-bold'>{title || `${name} Chart`}</h2>
      <canvas ref={chartRef} />
      <div className='flex justify-end mt-4'>
        <button 
          className='bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300'
          onClick={toggleChartType}
        >
          Toggle Chart Type
        </button>
        {chartType === 'bar' && (
          <button 
            className='ml-2 bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300'
            onClick={toggleAxis}
          >
            Toggle Axis
          </button>
        )}
        <button 
          className='ml-2 bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300'
          onClick={downloadChart}
        >
          Download Chart
        </button>
      </div>
    </div>
  );
}

export default SingleObservationChart;
