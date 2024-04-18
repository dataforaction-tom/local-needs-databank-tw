import React from 'react';
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

function ColumnFilter({ column, onFilterChange }) {
  const { filterValue, setFilter, filterOptions = [], id } = column;

  const options = Array.isArray(filterOptions) ? filterOptions : [];
  const multiSelectColumns = ['place', 'name', 'region'];

  const handleChange = (value) => {
    const valueArray = value ? value.map(item => item.value) : [];
    setFilter(valueArray);
    if (onFilterChange) {
      onFilterChange(id, valueArray);
    }
  };

  if (multiSelectColumns.includes(id)) {
    const selectedValues = options.filter(option => Array.isArray(filterValue) && filterValue.includes(option.value));

    return (
      <Select
        isMulti
        value={selectedValues}
        onChange={handleChange}
        options={options}
        className="text-sm"
        styles={customStyles} 
      />
    );
  } else {
    return (
      <span>
        Search: {' '}
        <input
          value={filterValue || ''}
          onChange={e => {
            const newVal = e.target.value || undefined;
            setFilter(newVal);
            if (onFilterChange) {
              onFilterChange(id, newVal ? [newVal] : []);
            }
          }}
          placeholder="Filter..."
          style={{ fontSize: '1rem', margin: '0', padding: '3px' }}
        />
      </span>
    );
  }
}

export default ColumnFilter;
