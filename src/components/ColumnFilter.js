import React, { useEffect, useState, useMemo } from 'react';
import Select from 'react-select';

function ColumnFilter({ column, onFilterChange, globalbackgroundColor }) {
  const { filterValue = [], setFilter, filterOptions = [], id } = column;
  const [initialSetDone, setInitialSetDone] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  const options = useMemo(() => Array.isArray(filterOptions) ? filterOptions : [], [filterOptions]);

  // Dynamic styles based on globalbackgroundColor
  const customStyles = useMemo(() => ({
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
      backgroundColor: globalbackgroundColor, // Use global background color
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
  }), [globalbackgroundColor]); // Rebuild styles when globalbackgroundColor changes

  useEffect(() => {
    if (id === 'region' && !initialSetDone && !userHasInteracted) {
      const nonNullOptions = options.filter(option => option.value != null);
      if (nonNullOptions.length > 0) {
        const values = [nonNullOptions[0].value];
        setFilter(values);
        if (onFilterChange) {
          onFilterChange(id, values);
        }
        setInitialSetDone(true);
      }
    }
  }, [id, options, initialSetDone, userHasInteracted, setFilter, onFilterChange]);

  const handleChange = (value) => {
    setUserHasInteracted(true);
    const valueArray = value ? value.map(item => item.value) : [];
    setFilter(valueArray);
    if (onFilterChange) {
      onFilterChange(id, valueArray);
    }
  };

  const selectedValues = options.filter(option => filterValue.includes(option.value));

  return (
    <Select
      isMulti
      value={selectedValues}
      onChange={handleChange}
      options={options}
      className="text-sm w-full"
      styles={customStyles} // Apply dynamic styles
      isDisabled={options.length === 0}
      placeholder={options.length > 0 ? "Select..." : "No options available"}
    />
  );
}

export default ColumnFilter;
