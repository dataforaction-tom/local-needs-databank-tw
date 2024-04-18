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
        <tbody {...getTableBodyProps()} className='bg-white divide-y divide-gray-200'>
          {rows.map((row, index) => {
            prepareRow(row);
            const rowError = errorRows.includes(index + 1); // Adjust index to account for header
            return (
              <tr {...row.getRowProps()} className={rowError ? 'bg-red-100' : ''} id={`row-${index + 1}`}>
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

