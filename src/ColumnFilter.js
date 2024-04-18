import React from 'react';
import Select from 'react-select';

function ColumnFilter({ column }) {
  const { filterValue, setFilter, filterOptions = [], id } = column;

  // Ensure that filterOptions is always an array
  const options = Array.isArray(filterOptions) ? filterOptions : [];

  const multiSelectColumns = ['place', 'name', 'region'];

  if (multiSelectColumns.includes(id)) {
    const selectedValues = options.filter(option => Array.isArray(filterValue) && filterValue.includes(option.value));

    return (
      <Select
        isMulti
        value={selectedValues}
        onChange={value => {
          setFilter(value ? value.map(item => item.value) : []);
        }}
        options={options}
        className="text-sm"
      />
    );
  } else {
    return (
      <span>
        Search: {' '}
        <input
          value={filterValue || ''}
          onChange={e => setFilter(e.target.value || undefined)}
          placeholder="Filter..."
          style={{
            fontSize: '1rem',
            margin: '0',
            padding: '3px'
          }}
        />
      </span>
    );
  }
}

export default ColumnFilter;
