import React, { useMemo, useEffect } from 'react';
import { useTable, useFilters, useGlobalFilter, useSortBy, usePagination } from 'react-table';
import ColumnFilter from './ColumnFilter'; // Ensure this component is correctly imported

const columnStyles = {
  name: { width: '30%' },
  date: { width: '5%' },
  period: { width: '5%' },
  value: { width: '10%' },
  place: { width: '30%' },
  region: { width: '20%' }
};
function ObservationsTable({ observations, setFilteredObservations }) {
  // Debug: Log the observations to check incoming data
  console.log("Observations data:", observations);

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

  useEffect(() => {
    console.log("Table State:", state);
  }, [state]);
  
  useEffect(() => {
    console.log("Current Filters:", state.filters);
  }, [state.filters]);

  useEffect(() => {
    console.log("Sample data:", observations.slice(0, 5));
  }, [observations]);
  
   // Define the scrolling container style
   const scrollContainerStyle = { maxHeight: '400px', overflowY: 'auto' };


   return (
    <div>
      <h2>Filtered Observations Table</h2>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column.render('Header')}
                    <span>
                      {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                    </span>
                    <div>{column.canFilter ? column.render('Filter') : null}</div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
            {page.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>{'<<'}</button>
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>{'<'}</button>
        <button onClick={() => nextPage()} disabled={!canNextPage}>{'>'}</button>
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>{'>>'}</button>
        <span>
          Page{' '}
          <strong>
            {state.pageIndex + 1} of {pageCount}
          </strong>
        </span>
        <select
          value={state.pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    
  );
}

export default ObservationsTable;