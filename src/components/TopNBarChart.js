import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function TopNBarChart({ title, items, subtitle, barColor = '#662583' }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current?.getContext('2d');
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const filtered = (items || []).filter((i) => {
      if (!i || !i.label) return false;
      const raw = i.value;
      if (raw === null || raw === undefined) return false;
      if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) return false;
        const lower = trimmed.toLowerCase();
        if (['na', 'n/a', 'none', 'null', '-', '--', '.', '..', 'suppressed'].includes(lower)) return false;
        const cleaned = trimmed.replace(/[,%£$]/g, '');
        const num = Number(cleaned);
        return Number.isFinite(num) && num !== 0;
      }
      const num = Number(raw);
      return Number.isFinite(num) && num !== 0;
    });
    const labels = filtered.map((i) => i.label);
    const dataValues = filtered.map((i) => Number(i.value));

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: title,
            data: dataValues,
            backgroundColor: barColor,
            borderColor: barColor,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            ticks: {
              callback: (value) =>
                new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(value),
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) =>
                new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(context.parsed.x),
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [items, title]);

  return (
    <div className="p-4 bg-white shadow rounded w-full" style={{ minHeight: 380 }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle ? <p className="text-sm text-slate-600 mb-3">{subtitle}</p> : <div className="h-3" />}
        </div>
        <button
          type="button"
          onClick={() => {
            const canvas = chartRef.current;
            if (!canvas) return;
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = url;
            const safeTitle = (title || 'chart').replace(/[^a-z0-9-_]+/gi, '_');
            link.download = `${safeTitle}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="bg-[#662583] text-white text-sm font-medium px-3 py-2 rounded hover:bg-[#C7215D]"
        >
          Download
        </button>
      </div>
      <div style={{ position: 'relative', width: '100%', height: 300 }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
}

export default TopNBarChart;


