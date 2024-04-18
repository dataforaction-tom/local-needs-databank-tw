import React, { useState } from 'react';
import Papa from 'papaparse';
import TablePreview from './TablePreview';
import supabase from './supabaseClient';  

const CSVUploadComponent = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [headerMappings, setHeaderMappings] = useState([]);
  const [additionalFields, setAdditionalFields] = useState({
    name: '',
    place: '',
    date: '',
    period: ''
  });
  const [errorRows, setErrorRows] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault(); // Prevent default behavior (Prevent file from being opened)
    e.stopPropagation(); // Stop propagation to prevent affecting other elements.
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Ensure the event does not propagate.
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileDrop(e.dataTransfer.files[0]);
    }
  };

  const handleFileDrop = (file) => {
    Papa.parse(file, {
      complete: (results) => {
        if (Array.isArray(results.data) && results.data.length > 0) {
          const headers = Object.keys(results.data[0]);
          setData(results.data);
          setColumns(headers);
          setHeaderMappings(headers.map(() => ({ value: 'Ignore', label: 'Ignore' })));
          validateMappings(headers.map(() => ({ value: 'Ignore', label: 'Ignore' })));
        } else {
          console.error('Parsed data is not in expected format:', results.data);
          setMessage('Error in CSV format: No data or incorrect format.');
        }
      },
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });
  };

  const validateMappings = (mappings) => {
    const hasValueColumn = mappings.some(mapping => mapping.value === 'Value');
    setIsValid(hasValueColumn);
  };

  const handleMappingChange = (index, option) => {
    const newMappings = [...headerMappings];
    newMappings[index] = option;
    setHeaderMappings(newMappings);
    validateMappings(newMappings);
  };

  const handleFieldChange = (field, value) => {
    const newFields = { ...additionalFields, [field]: value };
    setAdditionalFields(newFields);
    validateMappings(headerMappings);  // Re-check validation status with updated fields
  };

  const handleSubmission = async () => {
    setLoading(true);
    setMessage('');
    setErrorRows([]);
    const result = await submitData(data, headerMappings, additionalFields);
    setLoading(false);

    if (!result.success) {
        setErrorRows(result.errorRows);  // Update state to mark error rows
        setMessage(result.message);  // Display the error messages to the user
    } else {
        setMessage('Data uploaded successfully.');
    }
};
  const submitData = async (data, mappings, additionalFields) => {
    const headers = Object.keys(data[0]);
    const errors = [];
    const errorRows = [];
    const processedData = data.map((row, rowIndex) => {
      const entry = {};
      let rowHasError = false;
  
      headers.forEach((header, idx) => {
        const mapping = mappings[idx].value;
        if (mapping !== 'Ignore') {
          if (mapping.toLowerCase() === 'value') {
            // Try converting the 'Value' column to a number
            const numericValue = parseFloat(row[header]);
            if (isNaN(numericValue)) {
              errors.push(`Row ${rowIndex + 1}: Value '${row[header]}' is not a valid number.`);
              if (!rowHasError) {
                errorRows.push(rowIndex);
                rowHasError = true;
              }
            } else {
              entry[mapping.toLowerCase()] = numericValue.toString(); // Store as string for Supabase
            }
          } else {
            entry[mapping.toLowerCase()] = row[header];
          }
        }
      });
  
      // Add additional fields with default values if not already present
      Object.entries(additionalFields).forEach(([key, value]) => {
        if (value && !entry[key.toLowerCase()]) {
          entry[key.toLowerCase()] = value;
        }
      });
  
      return entry;
    });
  
    if (errors.length > 0) {
      return { success: false, message: `Data validation failed:\n${errors.join('\n')}`, errorRows };
    }
  
    const { data: response, error } = await supabase.from('observations').insert(processedData);
    if (error) {
      console.error('Error uploading data: ', error);
      return { success: false, message: 'Failed to upload data.', errorRows };
    }
  
    return { success: true, message: 'Data uploaded successfully.' };
  };

  return (
    <div className='p-4 my-20'>
      <div
        className='border-dashed border-4 border-gray-400 py-12 flex justify-center items-center cursor-pointer'
        style={{ position: 'relative' }} // Ensure this div is positioned relatively
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={(e) => handleFileDrop(e.target.files[0])}
          style={{ width: "100%", height: "100%", opacity: 0, position: "absolute", zIndex: 10 }}
        />
        <p>Drag and drop your CSV file here, or click to select files</p>
      </div>
      {data.length > 0 && columns.length > 0 && (
        <TablePreview
          data={data}
          columns={columns}
          mappings={headerMappings}
          onMappingChange={handleMappingChange}
          errorRows={errorRows}
        />
      )}
      <div className='mt-4'>
        <input type="text" placeholder="Description" value={additionalFields.name} onChange={(e) => handleFieldChange('name', e.target.value)} className="p-2 border" />
        <input type="text" placeholder="Place" value={additionalFields.place} onChange={(e) => handleFieldChange('place', e.target.value)} className="p-2 border" />
        <input type="text" placeholder="Date" value={additionalFields.date} onChange={(e) => handleFieldChange('date', e.target.value)} className="p-2 border" />
        <input type="text" placeholder="Period" value={additionalFields.period} onChange={(e) => handleFieldChange('period', e.target.value)} className="p-2 border" />
      </div>
      {isValid && !loading && (
        <button className='mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={handleSubmission}>
          Submit Data
        </button>
      )}
      {loading && <p>Submitting data...</p>}
      {message && <p>{message}</p>}
    </div>
  );
};

export default CSVUploadComponent;
