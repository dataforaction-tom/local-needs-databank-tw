import React, { useEffect, useState, useMemo } from 'react';
import Select from 'react-select';

function ColumnFilter({ column, globalbackgroundColor }) {
  const id = column.id;
  const [initialSetDone, setInitialSetDone] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  const options = useMemo(() => {
    const opts = column.columnDef?.meta?.filterOptions || [];
    return Array.isArray(opts) ? opts : [];
  }, [column.columnDef]);

  const filterValue = (() => {
    const v = column.getFilterValue();
    return Array.isArray(v) ? v : [];
  })();

  // Dynamic styles based on globalbackgroundColor
  const customStyles = useMemo(() => ({
    option: (provided) => ({
      ...provided,
      color: 'black',
      zIndex: 9999,
    }),
    control: styles => ({ ...styles, backgroundColor: 'white' }),
    singleValue: (provided) => ({ ...provided, color: 'black' }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: globalbackgroundColor,
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'white',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'white',
      ':hover': {
        backgroundColor: '#C7215D',
        color: 'white',
      },
    }),
    menuPortal: base => ({ ...base, zIndex: 9999 }),
  }), [globalbackgroundColor]);

  useEffect(() => {
    if (id === 'region' && !initialSetDone && !userHasInteracted) {
      const nonNullOptions = options.filter(option => option.value != null);
      if (nonNullOptions.length > 0) {
        const values = [nonNullOptions[0].value];
        column.setFilterValue(values);
        setInitialSetDone(true);
      }
    }
  }, [id, options, initialSetDone, userHasInteracted, column]);

  const handleChange = (value) => {
    setUserHasInteracted(true);
    const valueArray = value ? value.map(item => item.value) : [];
    column.setFilterValue(valueArray);
  };

  const selectedValues = options.filter(option => filterValue.includes(option.value));

  return (
    <div className="min-w-[200px] md:min-w-[260px] w-[260px]">
      <Select
        isMulti
        value={selectedValues}
        onChange={handleChange}
        options={options}
        className="text-[11px] md:text-sm"
        styles={customStyles}
        isDisabled={options.length === 0}
        placeholder={options.length > 0 ? "Filter..." : "No options"}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
      />
      {filterValue.length > 0 && (
        <button
          type="button"
          className="mt-1 text-[10px] text-white/90 bg-[#C7215D] px-2 py-0.5 rounded"
          onClick={() => column.setFilterValue([])}
        >
          Clear
        </button>
      )}
    </div>
  );
}

export default ColumnFilter;
