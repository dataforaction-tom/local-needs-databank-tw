import React, { useMemo, useEffect, useState,} from 'react';
import { useTable, useFilters, useGlobalFilter, useSortBy, usePagination } from 'react-table';
import ColumnFilter from './ColumnFilter'; // Ensure this component is correctly imported
import { CSVLink } from 'react-csv'; // Import CSVLink




function ObservationsTable({ observations, setFilteredObservations, title, license, owner, dataset_description, original_url, published_date }) {
  // Debug: Log the observations to check incoming data
  console.log("Observations data:", observations);

  const [allFilters] = useState([]); // State to control filters

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

const yearOptions = useMemo(() => {
  // Create unique options from the 'name' data field
  const years = new Set(observations.map(obs => obs.year));
  return Array.from(years).map(year => ({ value: year, label: year }));
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
      Header: 'Year',
      accessor: 'year',
      Filter: ColumnFilter,
      filterOptions: yearOptions
    },
    
   
    
    
    
  ], [placeOptions, nameOptions, regionOptions, yearOptions]);

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
    prepareRow,    
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


  const getCsvData = (rows, columns, metadata) => {
    const dataRows = rows.map(row => {
      const newRow = {};
      columns.forEach(column => {
        newRow[column.Header] = row[column.accessor];
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
      {}, // Optional: empty row for separation
      ...metadataEntries.map(entry => ({ "Metadata": entry }))
    ];
  
    return dataWithMeta;
  };
  


  const csvData = useMemo(() => getCsvData(rows.map(row => row.original), columns, {
    dataset_description,
    license,
    owner,
    published_date,
    original_url
  }), [rows, columns, dataset_description, license, owner, published_date, original_url]);
  



  
   // Define the scrolling container style
   const scrollContainerStyle = { maxHeight: '400px', overflowY: 'auto' };


   return (
    <div className='p-5 my-5'>
      <div className='flex flex-col md:flex-row justify-between'>
        <h2 className='text-xl font-bold'>{title || 'Filtered Observations Table'}</h2>
        
        <p className='text-sm md:text-lg font-semibold text-slate-800'>Note - Using the filters in the table will also filter the charts and maps below</p>
      </div>
      <div style={scrollContainerStyle}>
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-[#662583] text-white">
                    {column.render('Header')}
                    
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
                    <td {...cell.getCellProps()} className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold border">
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-2 md:space-y-0">
        <div className="flex space-x-2">
          {/* Pagination and other controls */}
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
      <p className='text-xs font-italic'>{dataset_description}</p>
      <p className='text-xs font-italic'>Data made available under {license}</p>
      <p className='text-xs font-italic'>Owner: {owner}</p>
      <p className='text-xs font-italic'>Published {published_date}</p>
      <p className='text-xs font-italic'>Original Data Available at{original_url}</p>

    </div>
  );
}

export default ObservationsTable;