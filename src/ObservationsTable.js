import React, { useMemo, useEffect } from 'react';
import { useTable, useFilters, useGlobalFilter } from 'react-table';
import ColumnFilter from './ColumnFilter'; // Ensure this component is correctly imported

function ObservationsTable({ observations, setFilteredObservations }) {
  const columns = useMemo(() => [
    {
      Header: 'Name',
      accessor: 'name', // accessor is the "key" in the data
      Filter: ColumnFilter
    },
    {
      Header: 'Date',
      accessor: 'date',
      Filter: ColumnFilter
    },
    {
      Header: 'Period',
      accessor: 'period',
      Filter: ColumnFilter
    },
    {
      Header: 'Value',
      accessor: 'value',
      Filter: ColumnFilter
    },
    {
      Header: 'Place',
      accessor: 'place',
      Filter: ColumnFilter
    },
    {
      Header: 'Region',
      accessor: 'region',
      Filter: ColumnFilter
    },
    {
      Header: 'Nation',
      accessor: 'nation',
      Filter: ColumnFilter
    }
  ], []);

  const tableInstance = useTable(
    { 
      columns, 
      data: observations,
      initialState: { 
        globalFilter: '' 
      } 
    },
    useFilters, // useFilters hook applies the filter functionality
    useGlobalFilter // This is for the global filter
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state
  } = tableInstance;

  // Update filtered observations when rows data changes
  useEffect(() => {
    setFilteredObservations(rows.map(row => row.original));
  }, [rows, setFilteredObservations]);

  return (
    <div>
      <h2>Filtered Observations Table</h2>
      <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column.render('Header')}
                  {/* Render the column filter UI */}
                  <div>{column.canFilter ? column.render('Filter') : null}</div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
          {rows.map(row => {
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
  );
}

export default ObservationsTable;
