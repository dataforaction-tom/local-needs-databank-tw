import React, { useState } from 'react';
import Papa from 'papaparse';
import TablePreview from './TablePreview';
import supabase from './supabaseClient';  

const CSVUploadComponent = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [showFields, setShowFields] = useState(false); // State to control the visibility of input fields
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
  const [completionStatus, setCompletionStatus] = useState({
    value: false,
    place: false,
    date: false,
    name: false
  });
  
  const toggleFields = () => {
    setShowFields(!showFields); // Toggle the state to show or hide fields
  };

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
          const initialMappings = headers.map(header => ({ value: 'Ignore', label: 'Ignore' }));
          setHeaderMappings(initialMappings);
          validateMappings(initialMappings); // Validate initial mappings
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
    const requiredFields = ['Value', 'Place', 'Date', 'Name'];
    const mappedFields = mappings.filter(mapping => mapping.value !== 'Ignore').map(mapping => mapping.value);
    const newCompletionStatus = {};
  
    requiredFields.forEach(field => {
      newCompletionStatus[field.toLowerCase()] = mappedFields.includes(field) || (additionalFields[field.toLowerCase()] && additionalFields[field.toLowerCase()].trim() !== '');
    });
  
    setCompletionStatus(newCompletionStatus);
    setIsValid(Object.values(newCompletionStatus).every(status => status)); // All fields must be complete
  };
  

  const handleMappingChange = (index, option) => {
    const newMappings = [...headerMappings];
    newMappings[index] = option;
    setHeaderMappings(newMappings);
    validateMappings(newMappings); // Validate whenever mappings change
  };
  

  const handleFieldChange = (field, value) => {
    const newFields = { ...additionalFields, [field]: value };
    setAdditionalFields(newFields);
    validateMappings(headerMappings); // Re-validate with updated additional fields
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

  const RequirementFeedback = ({ isComplete, field }) => {
    return (
      <div className="flex items-center text-lg my-1">
        
        <span className={`flex items-center ${isComplete ? 'text-green-500' : 'text-red-500'}`}>
          <svg className={`w-4 h-4 mr-2 fill-current ${isComplete ? 'text-green-500' : 'text-red-500'}`} viewBox="0 0 20 20">
            {isComplete ? (
              // Green check icon
              <path d="M7.629 14.571L3.146 10.088a.999.999 0 1 1 1.414-1.414l2.757 2.757 6.065-6.065a.999.999 0 1 1 1.414 1.414l-7.167 7.167a.997.997 0 0 1-1.414 0z"/>
            ) : (
              // Red cross icon
              <path d="M10.707 9.293l6-6a1 1 0 0 0-1.414-1.414L9.293 7.879 3.707 2.293A1 1 0 0 0 2.293 3.707l5.586 5.586L2.293 14.879a1 1 0 1 0 1.414 1.414L9.293 10.707l5.586 5.586a1 1 0 0 0 1.414-1.414l-6-6z"/>
            )}
          </svg>
          {field} {isComplete ? 'completed' : 'required'}
        </span>
      </div>
    );
  };
  
  
  const calculateCompletionPercentage = () => {
    const totalFields = 4; // Total number of required fields
    const filledFields = Object.values(completionStatus).filter(status => status).length;
    return (filledFields / totalFields) * 100;
  };

  return (
    <div className='p-4'>
      <div
        className='border-dashed border-4 border-gray-400 bg-purple-100 py-12 flex justify-center items-center cursor-pointer my-10'
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

      <div className='flex flex-col space-y-4 font-semibold text-black'>
      <p>If you do not have a particular column in your data, you can use the input fields below to add to your data. PLEASE BE AWARE This will add the value you enter to EVERY row of your data.</p>
      <p>For example, if you add Newcastle in the Place field, every row in your data will show as having been in Newcastle.</p>
      <p>Click below to show these fields</p>
      <div className='flex items-center justify-center'>
        <button onClick={toggleFields} className="bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300 w-1/3 my-1">
        {showFields ? 'Hide Additional Fields' : 'Show Additional Fields'}
      </button>
      </div>

      {showFields && (
        <div className='flex flex-col space-y-4 font-semibold text-black mb-4'>
          
          <input type="text" placeholder="Description" value={additionalFields.name} onChange={(e) => handleFieldChange('name', e.target.value)} className="p-2 border placeholder-black placeholder-italic" />
          <input type="text" placeholder="Place" value={additionalFields.place} onChange={(e) => handleFieldChange('place', e.target.value)} className="p-2 border placeholder-black placeholder-italic" />
          <input type="text" placeholder="Date" value={additionalFields.date} onChange={(e) => handleFieldChange('date', e.target.value)} className="p-2 border placeholder-black placeholder-italic" />
          <input type="text" placeholder="Period" value={additionalFields.period} onChange={(e) => handleFieldChange('period', e.target.value)} className="p-2 border placeholder-black placeholder-italic" />
        </div>
      )}
      </div>
      <div className='my-5'>
      {data.length > 0 && columns.length > 0 && (
        <TablePreview
          data={data}
          columns={columns}
          mappings={headerMappings}
          onMappingChange={handleMappingChange}
          errorRows={errorRows}
        />
      )}
      </div>
      <p className='my-5 text-lg font-bold'>All submissions require Name, Place, Date and Value. You can view which of these you have provided or indicated below. At 100% you have all the required fields</p>
      <div className="w-full bg-gray-300">
      <div className="bg-[#662583] text-xs font-medium text-blue-100 text-center p-0.5 leading-none" style={{ width: `${calculateCompletionPercentage()}%` }}> {calculateCompletionPercentage()}% Complete</div>
      </div>
      <div className='mt-4'>
      {Object.keys(completionStatus).map(key => (
        <RequirementFeedback key={key} isComplete={completionStatus[key]} field={key.charAt(0).toUpperCase() + key.slice(1)} />
      ))}
        
      </div>
      <div className='flex flex-row gap-4'>
      {isValid && !loading && (
        <button className='bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300' onClick={handleSubmission}>
          Submit Data
        </button>
      )}
      {message && <p className='font-semibold text-xl text-red-500'>{message}</p>}
      </div>
      {loading && <p>Submitting data...</p>}
      
    </div>
  );
};

export default CSVUploadComponent;
