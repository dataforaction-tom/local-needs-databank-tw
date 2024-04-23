import React, { useEffect, useState, useMemo } from 'react';
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
  const [initialSetDone, setInitialSetDone] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  // Memoize options to ensure it only recalculates when filterOptions changes
  const options = useMemo(() => Array.isArray(filterOptions) ? filterOptions : [], [filterOptions]);
  
  const multiSelectColumns = ['place', 'name', 'region'];

  useEffect(() => {
    if (id === 'region' && options.length > 0 && !userHasInteracted && !initialSetDone) {
      const timer = setTimeout(() => {
        if (!userHasInteracted) { // Double check user interaction before setting
          const initialOption = [options[0].value];
          setFilter(initialOption);
          if (onFilterChange) {
            onFilterChange(id, initialOption);
          }
          setInitialSetDone(true);
        }
      }, 500); // Delay to account for data load
      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [id, options, onFilterChange, userHasInteracted, initialSetDone, setFilter]);

  const handleChange = (value) => {
    setUserHasInteracted(true);
    const valueArray = value ? value.map(item => item.value) : [];
    setFilter(valueArray);
    if (onFilterChange) {
      onFilterChange(id, valueArray);
    }
  };

  const selectedValues = options.filter(option => filterValue.includes(option.value));

  if (multiSelectColumns.includes(id)) {
    return (
      <Select
        isMulti
        value={selectedValues}
        onChange={handleChange}
        options={options}
        className="text-sm w-full"
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
            setUserHasInteracted(true);
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
