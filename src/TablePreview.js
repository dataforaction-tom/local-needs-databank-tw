import React, { useMemo } from 'react';
import { useTable } from 'react-table';
import Select from 'react-select';

const TablePreview = ({ data, columns, mappings, onMappingChange, errorRows }) => {
  const options = [
    { value: 'Place', label: 'Place' },
    { value: 'Date', label: 'Date' },
    { value: 'Period', label: 'Period' },
    { value: 'Value', label: 'Value' },
    { value: 'Name', label: 'Name' },
    { value: 'Ignore', label: 'Ignore' }
  ];

  const dataColumns = useMemo(() => {
    return columns.map((column, idx) => ({
      Header: () => (
        <div>
          <Select
            options={options}
            value={mappings[idx]}
            onChange={option => onMappingChange(idx, option)}
            className='mb-2'
          />
          {column}
        </div>
      ),
      accessor: column
    }));
  }, [columns, mappings, onMappingChange]);

  const getRowProps = row => ({
    style: {
      backgroundColor: errorRows.includes(row.index + 1) ? '#f8d7da' : '' // Light red background for error rows, adjusting index to match data slice
    }
  });

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns: dataColumns,
    data: data.slice(1) // Exclude the header row for table data
  });

  return (
    <div className='overflow-x-auto'>
      <table {...getTableProps()} className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()} className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps(getRowProps(row))}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()} className='px-6 py-4 whitespace-nowrap'>
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
};

export default TablePreview;

