import React, { useMemo, useState, useEffect } from 'react';
import { useTable, useFilters, useGlobalFilter } from 'react-table';
import supabase from './supabaseClient';
import ColumnFilter from './ColumnFilter'; // Import the column filter component

function App() {
  const [observations, setObservations] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch datasets for the dropdown filter
  useEffect(() => {
    async function fetchDatasets() {
      const { data, error } = await supabase.from('datasets').select('id, title');
      if (error) console.error('Error loading datasets:', error);
      else setDatasets(data);
    }

    fetchDatasets();
  }, []);

  // Fetch observations based on the selected dataset
  useEffect(() => {
    async function fetchObservations() {
      setLoading(true);
      let query = supabase.from('observations').select('*');

      if (selectedDataset) {
        query = query.eq('dataset_id', selectedDataset);
      }

      const { data, error } = await query;
      if (error) console.error('Error fetching observations', error);
      else setObservations(data);
      
      setLoading(false);
    }

    fetchObservations();
  }, [selectedDataset]);

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

  const tableInstance = useTable(
    { columns, data: observations },
    useFilters, // Enables column filtering
    useGlobalFilter // Enables global filtering
  );

  const handleDatasetChange = (e) => {
    setSelectedDataset(e.target.value || undefined);
  };

  return (
    <div className="App">
      <h1 className="text-2xl font-semibold text-gray-800 my-4">Observations</h1>
      <div className="mb-4">
        <select
          value={selectedDataset || ''}
          onChange={handleDatasetChange}
          className="p-2 rounded border border-gray-300 shadow-sm"
        >
          <option value="">All Datasets</option>
          {datasets.map(dataset => (
            <option key={dataset.id} value={dataset.id}>{dataset.title}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table {...tableInstance.getTableProps()} className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            {tableInstance.headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column.render('Header')}
                    <div>{column.canFilter ? column.render('Filter') : null}</div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...tableInstance.getTableBodyProps()} className="bg-white divide-y divide-gray-200">
            {tableInstance.rows.map(row => {
              tableInstance.prepareRow(row);
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
      {loading && <div className="mt-4 text-gray-500">Loading data...</div>}
    </div>
  );
}

export default App;

