import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    color: 'black',
    zIndex: 9999,
  }),
  control: styles => ({ ...styles, backgroundColor: 'white' }),
  singleValue: (provided, state) => {
    return { ...provided, color: 'black' };
  },
  multiValue: (provided, state) => ({
    ...provided,
    backgroundColor: '#662583',
  }),
  multiValueLabel: (provided, state) => ({
    ...provided,
    color: 'white',
  }),
  multiValueRemove: (provided, state) => ({
    ...provided,
    color: 'white',
    ':hover': {
      backgroundColor: '#C7215D',
      color: 'white',
    },
  }),
  menu: base => ({ ...base, zIndex: 9999, minWidth: 260, width: 260 }),
  menuPortal: base => ({ ...base, zIndex: 9999 }),
};

const TablePreview = ({ data, columns, mappings, onMappingChange, errorRows, cellErrors, validationSummary }) => {
  const columnsValid = columns && columns.length > 0 && columns.every(column => column);
  const dataValid = data && data.length > 0;
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);
  const [activeErrorColumnId, setActiveErrorColumnId] = useState('');
  const containerRef = useRef(null);
  const rowRefs = useRef({});
  const headerRefs = useRef({});

  useEffect(() => {
    if (!columnsValid && data.length > 0) {
      toast.error("CSV does not contain headers. Headers are required.");
    }
  }, [columnsValid, data.length]);

  const mappingOptions = useMemo(() => ([
    { value: 'Place', label: 'Place' },
    { value: 'Date', label: 'Date' },
    { value: 'Period', label: 'Period' },
    { value: 'Name', label: 'Name' },
    { value: 'Value', label: 'Value' },
    { value: 'Ignore', label: 'Ignore' },
  ]), []);

  const columnDefs = useMemo(() => {
    if (!columnsValid) return [];
    return columns.map((colName, idx) => ({
      id: String(colName),
      accessorKey: colName,
      minSize: 240,
      size: 260,
      header: () => (
        <div>
          <div className='mb-1 min-w-[220px] w-[260px]'>
            <Select
              options={mappingOptions}
              value={mappings[idx]}
              onChange={option => onMappingChange(idx, option)}
              styles={customStyles}
              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
              menuPosition="fixed"
              menuPlacement="bottom"
            />
          </div>
          <div className='opacity-80'>{colName}</div>
        </div>
      ),
      cell: info => info.getValue(),
    }));
  }, [columns, columnsValid, mappings, onMappingChange, customStyles, mappingOptions]);

  const table = useReactTable({
    data: dataValid ? data : [],
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
  });

  // Build sets for fast checks
  const errorRowSet = useMemo(() => new Set(errorRows || []), [errorRows]);
  const hasCellError = (rowIndex) => !!cellErrors && !!cellErrors[rowIndex] && Object.keys(cellErrors[rowIndex]).length > 0;

  // Compute rows to show
  const allRows = table.getRowModel().rows;
  const filteredRows = useMemo(() => {
    if (!showErrorsOnly) return allRows;
    if (activeErrorColumnId) {
      return allRows.filter(r => !!cellErrors?.[r.index]?.[activeErrorColumnId]);
    }
    return allRows.filter(r => errorRowSet.has(r.index) || hasCellError(r.index));
  }, [allRows, showErrorsOnly, errorRowSet, cellErrors, activeErrorColumnId]);

  const limitedRows = filteredRows.slice(0, 100);

  // Error navigation
  const visibleErrorRowIndexes = useMemo(() => limitedRows.filter(r => errorRowSet.has(r.index) || hasCellError(r.index)).map(r => r.index), [limitedRows, errorRowSet, cellErrors]);
  const [errorCursor, setErrorCursor] = useState(0);

  const scrollToErrorAt = (cursor) => {
    const clamped = Math.max(0, Math.min(cursor, visibleErrorRowIndexes.length - 1));
    const rowIndex = visibleErrorRowIndexes[clamped];
    const ref = rowRefs.current[rowIndex];
    if (ref && ref.scrollIntoView) ref.scrollIntoView({ block: 'nearest' });
    setErrorCursor(clamped);
  };

  // Column error counts
  const columnErrorCounts = useMemo(() => {
    const counts = {};
    if (cellErrors) {
      Object.values(cellErrors).forEach((cols) => {
        Object.entries(cols).forEach(([colName, errs]) => {
          counts[colName] = (counts[colName] || 0) + (errs?.length || 0);
        });
      });
    }
    return counts;
  }, [cellErrors]);

  const scrollToColumn = (colId) => {
    const el = headerRefs.current[colId];
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  };

  if (!dataValid || !columnsValid) {
    return (
      <div>
        <ToastContainer />
        <div className="font-bold text-red-500 text-xl">No valid CSV data or columns to display. Please check your have headers in your csv and data is not corrupted</div>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <ToastContainer />
      <div className='flex flex-col md:flex-row md:items-center gap-3 mb-3'>
        <div className='flex items-center gap-2'>
          <button
            className='bg-[#662583] text-white text-sm py-1 px-3 rounded-md hover:bg-[#C7215D]'
            onClick={() => setShowErrorsOnly(prev => !prev)}
          >
            {showErrorsOnly ? 'Show all rows' : 'Show only errors'}
          </button>
          {visibleErrorRowIndexes.length > 0 && (
            <>
              <button
                className='bg-slate-200 text-slate-900 text-sm py-1 px-3 rounded-md'
                onClick={() => scrollToErrorAt(errorCursor - 1)}
              >Prev error</button>
              <button
                className='bg-slate-200 text-slate-900 text-sm py-1 px-3 rounded-md'
                onClick={() => scrollToErrorAt(errorCursor + 1)}
              >Next error</button>
              <span className='text-xs text-slate-600'>Error {Math.min(errorCursor + 1, visibleErrorRowIndexes.length)} of {visibleErrorRowIndexes.length}</span>
            </>
          )}
        </div>
        {Object.keys(columnErrorCounts).length > 0 && (
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-xs text-slate-700'>Columns with errors:</span>
            {Object.entries(columnErrorCounts).map(([colId, count]) => (
              <button
                key={colId}
                className={`text-xs py-1 px-2 rounded border ${activeErrorColumnId === colId ? 'bg-[#662583] text-white border-[#662583]' : 'bg-white text-slate-800'}`}
                onClick={() => {
                  const next = activeErrorColumnId === colId ? '' : colId;
                  setActiveErrorColumnId(next);
                  scrollToColumn(colId);
                }}
                title={`Jump to ${colId}`}
              >
                {colId} ({count})
              </button>
            ))}
            {activeErrorColumnId && (
              <button className='text-xs underline text-slate-600' onClick={() => setActiveErrorColumnId('')}>Clear column filter</button>
            )}
          </div>
        )}
      </div>
      {validationSummary && Object.keys(validationSummary).length > 0 && (
        <div className='mb-3 text-sm'>
          <div className='font-semibold mb-1'>Validation summary</div>
          <ul className='list-disc list-inside'>
            {Object.entries(validationSummary).map(([type, count]) => (
              <li key={type}>{type}: {count}</li>
            ))}
          </ul>
        </div>
      )}
      <div ref={containerRef} style={{ maxHeight: '60vh', overflow: 'auto' }}>
        <table className='min-w-full table-fixed divide-y divide-gray-200'>
          <thead className='bg-gray-50 sticky top-0'>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    ref={el => { if (el) headerRefs.current[header.column.id] = el; }}
                    className={`px-3 md:px-4 py-2 text-left text-[10px] md:text-xs font-medium uppercase tracking-wider ${activeErrorColumnId === header.column.id ? 'bg-[#C7215D] text-white' : 'bg-[#662583] text-white'}`}
                    style={{ width: header.getSize ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {limitedRows.map(row => (
              <tr key={row.id} ref={el => { if (el) rowRefs.current[row.index] = el; }} style={{ backgroundColor: errorRows.includes(row.index) ? '#f8d7da' : '' }}>
                {row.getVisibleCells().map(cell => {
                  const colName = cell.column.id;
                  const errors = cellErrors?.[row.index]?.[colName];
                  return (
                    <td key={cell.id} className={`px-3 md:px-4 py-2 text-[11px] md:text-sm font-semibold border ${errors ? 'bg-red-50 text-red-700' : 'text-gray-900'} ${activeErrorColumnId === colName ? 'ring-2 ring-[#C7215D]' : ''}`} title={errors ? errors.join('\n') : ''} style={{ width: cell.column.getSize ? cell.column.getSize() : undefined }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablePreview;
