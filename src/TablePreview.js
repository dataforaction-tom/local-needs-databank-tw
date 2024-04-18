import React, { useMemo } from 'react';
import { useTable } from 'react-table';
import Select from 'react-select';

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    color: 'black',  // Ensures dropdown text is black
  }),
  control: styles => ({ ...styles, backgroundColor: 'white' }),
  singleValue: (provided, state) => {
    return { ...provided, color: 'black' };
  },
  multiValue: (provided, state) => ({
    ...provided,
    backgroundColor: '#662583',  // Purple background for selected options
  }),
  multiValueLabel: (provided, state) => ({
    ...provided,
    color: 'white',  // White text for selected options
  }),
  multiValueRemove: (provided, state) => ({
    ...provided,
    color: 'white',  // White text for the remove icon in selected options
    ':hover': {
      backgroundColor: '#C7215D',  // Darker purple background on hover in selected options
      color: 'white',
    },
  }),
};


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
            styles={customStyles}
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
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps(getRowProps(row)) }>
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
  );
};

export default TablePreview;

