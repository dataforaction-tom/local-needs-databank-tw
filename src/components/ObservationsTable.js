import React, { useMemo, useEffect, useState } from 'react';
import { useTable, useFilters, useGlobalFilter, useSortBy } from 'react-table';
import ColumnFilter from './ColumnFilter'; // Import your custom ColumnFilter
import { CSVLink } from 'react-csv';

function ObservationsTable({ observations, setFilteredObservations, title, license, owner, dataset_description, original_url, published_date, globalbackgroundColor }) {

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

  const columns = useMemo(() => {
    const showDatasetColumn = observations.some(obs => obs.datasetTitle);

    const baseColumns = [
      {
        Header: 'Observation',
        accessor: 'name',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            globalbackgroundColor={globalbackgroundColor} // Pass the global background color
          />
        ),
        filter: 'multiSelect',
        filterOptions: nameOptions
      },
      {
        Header: 'Place',
        accessor: 'place',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            globalbackgroundColor={globalbackgroundColor} // Pass the global background color
          />
        ),
        filter: 'multiSelect',
        filterOptions: placeOptions
      },
      {
        Header: 'Region',
        accessor: 'region',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            globalbackgroundColor={globalbackgroundColor} // Pass the global background color
          />
        ),
        filter: 'multiSelect',
        filterOptions: regionOptions
      },
      {
        Header: 'Value',
        accessor: 'value',
        Filter: ColumnFilter // No need for filters in 'value'
      },
      {
        Header: 'Year',
        accessor: 'year',
        Filter: ({ column }) => (
          <ColumnFilter
            column={column}
            globalbackgroundColor={globalbackgroundColor} // Pass the global background color
          />
        ),
        filterOptions: yearOptions
      }
    ];

    if (showDatasetColumn) {
      baseColumns.push({
        Header: 'DataSet',
        accessor: 'datasetTitle',
        id: 'title',
        disableFilters: true
      });
    }

    return baseColumns;
  }, [observations, placeOptions, nameOptions, regionOptions, yearOptions, globalbackgroundColor]);

  const filterTypes = useMemo(() => ({
    multiSelect: (rows, columnId, filterValues) => {
      if (filterValues.length === 0) return rows;
      return rows.filter(row => filterValues.includes(row.values[columnId]));
    }
  }), []);

  useEffect(() => {
    const newFilters = [
      ...allFilters,
      { id: 'region', value: selectedRegion }
    ];
    setAllFilters(newFilters);
  }, [selectedRegion]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setSortBy,
    state: { sortBy }
  } = useTable(
    {
      columns,
      data: observations,
      initialState: {
        pageIndex: 0,
        sortBy: [
          {
            id: 'place', // Sort by the 'place' field
            desc: false  // Ascending order (alphabetical)
          }
        ]
      },
      state: { filters: allFilters },
      filterTypes
    },
    useFilters,
    useGlobalFilter,
    useSortBy
  );
  
  useEffect(() => {
    // Reset the sorting by 'place' alphabetically every time a filter changes
    if (sortBy.length === 0 || sortBy[0].id !== 'place') {
      setSortBy([
        {
          id: 'place',  // Reset sorting by 'place'
          desc: false   // Ensure alphabetical order
        }
      ]);
    }
  }, [allFilters, setSortBy, sortBy]); // Watch for filter changes and current sorting state
  

  useEffect(() => {
    setFilteredObservations(rows.map(row => row.original));
  }, [rows, setFilteredObservations]);

  // Function to generate CSV data
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
      {}, // Empty row to separate data from metadata
      ...metadataEntries.map(entry => ({ "Metadata": entry }))
    ];

    return dataWithMeta;
  };

  // Generate csvData based on current rows and columns
  const csvData = useMemo(() => getCsvData(rows.map(row => row.original), columns, {
    dataset_description,
    license,
    owner,
    published_date,
    original_url
  }), [rows, columns, dataset_description, license, owner, published_date, original_url]);

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
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                    style={{ backgroundColor: globalbackgroundColor }} // Use global background color for header
                  >
                    {column.render('Header')}
                    {column.canFilter && column.id !== 'value' && column.id !== 'date' ? column.render('Filter') : null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
            {rows.map((row, index) => {
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
