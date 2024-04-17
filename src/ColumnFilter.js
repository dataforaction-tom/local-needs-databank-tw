// ColumnFilter.js
function ColumnFilter({ column }) {
    const { filterValue, setFilter } = column;
    return (
      <span>
        Search: {' '}
        <input
          value={filterValue || ''}
          onChange={e => setFilter(e.target.value || undefined)} // Set undefined to remove the filter entirely
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
  
  export default ColumnFilter;
  