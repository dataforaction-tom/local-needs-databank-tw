import React, { useMemo, useState, useEffect } from 'react';
import { useTable, useFilters, useGlobalFilter } from 'react-table';
import supabase from './supabaseClient';
import ColumnFilter from './ColumnFilter'; // Import the column filter component

function App() {
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchObservations = async () => {
      const { data, error } = await supabase
        .from('observations')
        .select('*');
      if (error) {
        console.error('error fetching observations', error);
      } else {
        setObservations(data);
        setLoading(false);
      }
    };

    fetchObservations();
  }, []);

  const columns = useMemo(
    () => [
      { Header: 'Name', accessor: 'name', Filter: ColumnFilter },
      { Header: 'Date', accessor: 'date', Filter: ColumnFilter },
      { Header: 'Period', accessor: 'period', Filter: ColumnFilter },
      { Header: 'Value', accessor: 'value', Filter: ColumnFilter },
      { Header: 'Place', accessor: 'place', Filter: ColumnFilter },
      { Header: 'Region', accessor: 'region', Filter: ColumnFilter },
      { Header: 'Nation', accessor: 'nation', Filter: ColumnFilter },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    setGlobalFilter,
  } = useTable(
    { columns, data: observations, initialState: { globalFilter: '' } },
    useFilters, // useFilters hook applies the filter functionality
    useGlobalFilter // This is for the global filter
  );

  return (
    <div className="App">
      <h1>Observations</h1>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>
                  {column.render('Header')}
                  <div>{column.canFilter ? column.render('Filter') : null}</div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {loading && <div>Loading data...</div>}
    </div>
  );
}

export default App;
