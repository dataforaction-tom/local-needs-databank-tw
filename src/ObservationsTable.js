import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useTable, useFilters, useGlobalFilter, useSortBy, usePagination } from 'react-table';
import ColumnFilter from './ColumnFilter'; // Ensure this component is correctly imported
import { CSVLink } from 'react-csv'; // Import CSVLink
import {
  ChevronDoubleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/solid';

const columnStyles = {
  name: { width: '30%' },
  date: { width: '5%' },
  period: { width: '5%' },
  value: { width: '10%' },
  place: { width: '30%' },
  region: { width: '20%' }
};


function ObservationsTable({ observations, setFilteredObservations, title }) {
  // Debug: Log the observations to check incoming data
  console.log("Observations data:", observations);

  const [allFilters, setAllFilters] = useState([]); // State to control filters

  const placeOptions = useMemo(() => {
    // Create unique options from the 'place' data field
    const places = new Set(observations.map(obs => obs.place));
    return Array.from(places).map(place => ({ value: place, label: place }));
  }, [observations]);
  

  const nameOptions = useMemo(() => {
    // Create unique options from the 'name' data field
    const names = new Set(observations.map(obs => obs.name));
    return Array.from(names).map(name => ({ value: name, label: name }));
}, [observations]);

const regionOptions = useMemo(() => {
  // Create unique options from the 'name' data field
  const regions = new Set(observations.map(obs => obs.region));
  return Array.from(regions).map(region => ({ value: region, label: region }));
}, [observations]);

// Set the initial region filter when options are ready and no filter is set
useEffect(() => {
  if (regionOptions.length > 0 && allFilters.length === 0) {
    setAllFilters([{ id: 'region', value: regionOptions[0].value }]);
  }
}, [regionOptions]);


  const columns = useMemo(() => [
    {
      Header: 'Name',
      accessor: 'name', // accessor is the "key" in the data
      Filter: ColumnFilter,
      filter: 'multiSelect', // Assuming your ColumnFilter can handle this type of filtering
      filterOptions: nameOptions // Pass the name options to the filter
    },
    {
      Header: 'Place',
      accessor: 'place',
      Filter: ColumnFilter,
      filter: 'multiSelect', // Correct property for setting filter type in React Table v7
      filterOptions: placeOptions
    },
    {
      Header: 'Region',
      accessor: 'region',
      Filter: ColumnFilter,
      filter: 'multiSelect', // Correct property for setting filter type in React Table v7
      filterOptions: regionOptions
    },
    {
      Header: 'Value',
      accessor: 'value',
      Filter: ColumnFilter
    },
    {
      Header: 'Date',
      accessor: 'date',
      Filter: ColumnFilter
    },
    
   
    
    
    
  ], [placeOptions, nameOptions, regionOptions]);

  const filterTypes = useMemo(() => ({
    multiSelect: (rows, columnId, filterValues) => {
      console.log(`Filtering ${rows.length} rows on ${columnId} with values:`, filterValues);
      if (filterValues.length === 0) return rows;
      const filteredRows = rows.filter(row => filterValues.includes(row.values[columnId]));
      console.log(`Filtered down to ${filteredRows.length} rows`);
      return filteredRows;
    }
  }), []);
  

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page, // Use 'page' instead of 'rows' for pagination
    rows,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    prepareRow,
    state,
    setPageSize,
    pageCount,
    gotoPage
  } = useTable(
    { 
      columns, 
      data: observations,
      initialState: { pageIndex: 0 },
      state: {filters: allFilters},
      filterTypes,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  


   // Effect to update filtered observations
   useEffect(() => {
    setFilteredObservations(rows.map(row => row.original));
    console.log("Filtered Observations:", rows.map(row => row.original));
  }, [rows, setFilteredObservations]);

  // CSV Data should be the current filtered and paged rows
  const csvData = rows.map(row => row.original);


  
   // Define the scrolling container style
   const scrollContainerStyle = { maxHeight: '400px', overflowY: 'auto' };


   return (
    <div className='p-5 my-5'>
      <div className='flex justify-between'>
      <h2 className='text-xl font-bold'>{title || 'Filtered Observations Table'}</h2>
      <p className='text-lg font-semibold text-slate-800'>Note - Using the filters in the table will also filter the charts and maps below</p>

      </div>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-[#662583] text-white">
                    {column.render('Header')}
                    <span>
                      {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                    </span>
                    {column.canFilter && column.id !== 'value' && column.id !== 'date' ? column.render('Filter') : null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
            {page.map((row, index) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold border">
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center mt-4">
      <div className="flex space-x-2">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="p-2">
          <ChevronDoubleLeftIcon className="h-5 w-5 text-gray-700" />
        </button>
        <button onClick={() => previousPage()} disabled={!canPreviousPage} className="p-2">
          <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
        </button>
        <button onClick={() => nextPage()} disabled={!canNextPage} className="p-2">
          <ChevronRightIcon className="h-5 w-5 text-gray-700" />
        </button>
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} className="p-2">
          <ChevronDoubleRightIcon className="h-5 w-5 text-gray-700" />
        </button>
        <span>
          Page{' '}
          <strong>
            {state.pageIndex + 1} of {pageCount}
          </strong>
        </span>
        <select
          value={state.pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
          className="border rounded-md text-gray-700 p-2 ml-2"
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <CSVLink
        data={csvData}
        filename="filtered-observations.csv"
        className="bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300"
        target="_blank"
      >
        Download CSV
      </CSVLink>
    </div>
  </div>
);
}

export default ObservationsTable;