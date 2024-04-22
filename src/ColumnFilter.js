import React, { useEffect } from 'react';
import Select from 'react-select';

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

function ColumnFilter({ column, onFilterChange }) {
  const { filterValue = [], setFilter, filterOptions = [], id } = column;

  const options = Array.isArray(filterOptions) ? filterOptions : [];
  const multiSelectColumns = ['place', 'name', 'region'];

  // Set the default filter value for the 'region' column when the component mounts
  useEffect(() => {
    if (id === 'region' && options.length > 0 && filterValue.length === 0) {
      const firstOption = [{ value: options[0].value, label: options[0].label }];
      setFilter(firstOption.map(item => item.value));
      if (onFilterChange) {
        onFilterChange(id, firstOption.map(item => item.value));
      }
    }
  }, [filterValue, id, onFilterChange, options, setFilter]);

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
    className="text-sm w-full"
    styles={{
      ...customStyles,
      control: (provided) => ({
        ...provided,
        minHeight: '48px', // Larger touch area
        fontSize: '16px'  // Larger font for mobile readability
      }),
      menu: (provided) => ({
        ...provided,
        width: '100%'  // Ensures menu uses full width on mobile
      }),
    }} 
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
