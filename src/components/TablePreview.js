import React, { useEffect, useMemo } from 'react';
import { useTable } from 'react-table';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    color: 'black',
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
};

const TablePreview = ({ data, columns, mappings, onMappingChange, errorRows }) => {
  const columnsValid = columns && columns.length > 0 && columns.every(column => column);
  const dataValid = data && data.length > 0;

  useEffect(() => {
    if (!columnsValid && data.length > 0) {
      toast.error("CSV does not contain headers. Headers are required.");
    }
  }, [columnsValid, data.length]);

  const dataColumns = useMemo(() => {
    if (!columnsValid) return [];

    return columns.map((column, idx) => ({
      Header: () => (
        <div>
          <Select
            options={[
              { value: 'Place', label: 'Place' },
              { value: 'Date', label: 'Date' },
              { value: 'Period', label: 'Period' },
              { value: 'Value', label: 'Value' },
              { value: 'Name', label: 'Name' },
              { value: 'Ignore', label: 'Ignore' }
            ]}
            value={mappings[idx]}
            onChange={option => onMappingChange(idx, option)}
            className='mb-2'
            styles={customStyles}
          />
          {column}
        </div>
      ),
      accessor: column
    }));
  }, [columns, mappings, onMappingChange]);

  const tableInstance = useTable({
    columns: dataColumns,
    data: dataValid ? data : []
  });

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  // Only take the first 100 rows
  const limitedRows = rows.slice(0, 100);

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
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table {...getTableProps()} className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50 sticky top-0'>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()} className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-[#662583] text-white'>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {limitedRows.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps({
                  style: {
                    backgroundColor: errorRows.includes(row.index) ? '#f8d7da' : '' // Light red background for error rows
                  }
                })}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()} className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold border'>
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablePreview;
