import React, { useMemo, useEffect, useState } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';
import ColumnFilter from './ColumnFilter'; // Import your custom ColumnFilter
import { CSVLink } from 'react-csv';

function ObservationsTable({ observations, setFilteredObservations, title, license, owner, dataset_description, original_url, published_date, globalbackgroundColor, baseline }) {

  const [selectedRegion, setSelectedRegion] = useState(null);
  const [allFilters, setAllFilters] = useState([]);

  // Function to format the current date
  const getFormattedDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Format: DD-MM-YYYY
  };

  const placeOptions = useMemo(() => {
    const places = new Set(observations.map(obs => obs.place));
    return Array.from(places).map(place => ({ value: place, label: place }));
  }, [observations]);

  const nameOptions = useMemo(() => {
    const names = new Set(observations.map(obs => obs.name));
    return Array.from(names).map(name => ({ value: name, label: name }));
  }, [observations]);

  const regionOptions = useMemo(() => {
    const regions = new Set(observations.map(obs => obs.region));
    return Array.from(regions).map(region => ({ value: region, label: region }));
  }, [observations]);

  const yearOptions = useMemo(() => {
    const years = new Set(observations.map(obs => obs.year));
    return Array.from(years)
      .sort((a, b) => a - b)  // Sort the years in ascending order
      .map(year => ({ value: year, label: year }));
  }, [observations]);
  
  useEffect(() => {
    if (selectedRegion === null) {
      const nonNullRegions = regionOptions.filter(option => option.value !== null);
      if (nonNullRegions.length > 0) {
        setSelectedRegion(nonNullRegions[0].value);
      }
    }
  }, [regionOptions]);

  const showDatasetColumn = useMemo(() => observations.some(obs => obs.datasetTitle), [observations]);

  const columns = useMemo(() => {
    const baseColumns = [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Observation',
        filterFn: 'multiSelect',
        meta: { filterOptions: nameOptions },
      },
      {
        id: 'place',
        accessorKey: 'place',
        header: 'Place',
        filterFn: 'multiSelect',
        meta: { filterOptions: placeOptions },
      },
      {
        id: 'region',
        accessorKey: 'region',
        header: 'Region',
        filterFn: 'multiSelect',
        meta: { filterOptions: regionOptions },
      },
      {
        id: 'value',
        accessorKey: 'value',
        header: 'Value',
        cell: info => {
          const num = info.getValue();
          const formatNumber = (n) => new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(n);
          return <span className="block text-right">{formatNumber(num)}</span>;
        }
      },
      {
        id: 'year',
        accessorKey: 'year',
        header: 'Year',
        filterFn: 'multiSelect',
        meta: { filterOptions: yearOptions },
      }
    ];

    if (showDatasetColumn) {
      baseColumns.push({
        id: 'datasetTitle',
        accessorKey: 'datasetTitle',
        header: 'DataSet',
      });
    }

    return baseColumns;
  }, [showDatasetColumn, nameOptions, placeOptions, regionOptions, yearOptions]);

  const multiSelectFilterFn = (row, columnId, filterValues) => {
    if (!Array.isArray(filterValues) || filterValues.length === 0) return true;
    const cellValue = row.getValue(columnId);
    return filterValues.includes(cellValue);
  };

  useEffect(() => {
    const newFilters = [
      ...allFilters,
      { id: 'region', value: selectedRegion }
    ];
    setAllFilters(newFilters);
  }, [selectedRegion]);

  const [columnFilters, setColumnFilters] = useState([]);

  const table = useReactTable({
    data: observations,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: { multiSelect: multiSelectFilterFn },
  });
  
  // Note: sorting handled via table state; keep simple ascending for place by default via column config if needed
  

  useEffect(() => {
    setFilteredObservations(table.getRowModel().rows.map(row => row.original));
  }, [observations, columnFilters, table, setFilteredObservations]);

  // Function to generate CSV data
  const getCsvData = (rows, headers, metadata) => {
    const dataRows = rows.map(row => {
      const newRow = {};
      headers.forEach(({ label, key }) => {
        newRow[label] = row[key];
      });
      return newRow;
    });

    const metadataEntries = [
      `Dataset Description: ${metadata.dataset_description}`,
      `License: ${metadata.license}`,
      `Owner: ${metadata.owner}`,
      `Published Date: ${metadata.published_date}`,
      `Original URL: ${metadata.original_url}`
    ];

    // Append metadata as single cell entries at the bottom
    const dataWithMeta = [
      ...dataRows,
      {}, // Empty row to separate data from metadata
      ...metadataEntries.map(entry => ({ "Metadata": entry }))
    ];

    return dataWithMeta;
  };

  // Generate csvData based on current rows and columns
  const csvHeaders = useMemo(() => {
    const base = [
      { label: 'Observation', key: 'name' },
      { label: 'Place', key: 'place' },
      { label: 'Region', key: 'region' },
      { label: 'Value', key: 'value' },
      { label: 'Year', key: 'year' },
    ];
    if (showDatasetColumn) base.push({ label: 'DataSet', key: 'datasetTitle' });
    return base;
  }, [showDatasetColumn]);

  const csvData = useMemo(() => getCsvData(table.getRowModel().rows.map(row => row.original), csvHeaders, {
    dataset_description,
    license,
    owner,
    published_date,
    original_url
  }), [table, csvHeaders, dataset_description, license, owner, published_date, original_url]);

  const scrollContainerStyle = { maxHeight: '400px', overflowY: 'auto' };

  return (
    <div className="p-5 my-5">
      <div className="flex flex-col md:flex-row justify-between">
        <h2 className="text-xl font-bold">{title || 'Filtered Observations Table'}</h2>
        <p className="text-sm md:text-lg font-semibold text-slate-800">
          Note - Using the filters in the table will also filter the charts and maps below
        </p>
      </div>

      <div style={scrollContainerStyle}>
        <table className="min-w-full divide-y divide-gray-200">
          <caption className="sr-only">Observations table for {title || 'current dataset'}</caption>
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} scope="col" className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider" style={{ backgroundColor: globalbackgroundColor }}>
                    <div className="flex flex-col gap-1">
                      <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
                      {header.column.getCanFilter() && header.column.columnDef.meta?.filterOptions?.length ? (
                        <ColumnFilter column={header.column} globalbackgroundColor={globalbackgroundColor} />
                      ) : null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map((row, index) => (
              <tr key={row.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold border">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add spacing and alignment for the CSV download button */}
      <div className="mt-4 flex justify-end">
        <CSVLink
          data={csvData}
          filename={`${title || 'filtered-observations'}.csv`}
          className="text-white font-medium py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors duration-300"
          style={{ backgroundColor: globalbackgroundColor }} // Use global background color for CSV button
          target="_blank"
        >
          Download CSV
        </CSVLink>
      </div>

      <div className='mt-2'>
        <p className='text-xs italic'>{dataset_description}</p>
        <p className='text-xs italic'>Data made available under {license}</p>
        <p className='text-xs italic'>Owner: {owner}</p>
        <p className='text-xs italic'>Published {published_date}</p>
        <p className='text-xs italic'>
        Original Data Available at{' '}
        <a href={original_url} target='_blank' rel='noopener noreferrer' className='text-blue-500 underline'>
            {original_url}
        </a>
    </p>
      </div>
    </div>
  );
}

// Set defaultProps for ObservationsTable
ObservationsTable.defaultProps = {
  globalbackgroundColor: '#662583' // Default purple color
};

export default ObservationsTable;
