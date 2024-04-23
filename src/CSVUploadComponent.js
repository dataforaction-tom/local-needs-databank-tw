import React, { useState } from 'react';
import Papa from 'papaparse';
import TablePreview from './TablePreview';
import supabase from './supabaseClient';  
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';



const CSVUploadComponent = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [showFields, setShowFields] = useState(false); 
  const [headerMappings, setHeaderMappings] = useState([]);
  const [additionalFields, setAdditionalFields] = useState({
    name: '',
    place: '',
    date: '',
    period: ''
  });
  const [datasetFields, setDatasetFields] = useState({
    title: '',
    license: '',
    originalURL: '',
    publishedDate: '',
    owner: '',
    description: ''
  });
    // Options for the License select field
    const licenseOptions = [
      { value: 'CC BY', label: 'CC BY' },
      { value: 'CC BY-SA', label: 'CC BY-SA' },
      { value: 'CC0', label: 'CC0' }
    ];
  
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
    e.preventDefault(); 
    e.stopPropagation(); 
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Ensure the event does not propagate.
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileDrop(e.dataTransfer.files[0]);
    }
  };

   // Handler for changes in the select field
   const handleSelectChange = (selectedOption) => {
    setDatasetFields({...datasetFields, license: selectedOption.value});
  };

  const handleFileDrop = (file) => {
    // Check if the file type is CSV
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      setMessage('Error: The file must be a CSV file.');
      toast.error('The file must be a CSV file.');
      return;
    }

    Papa.parse(file, {
      complete: (results) => {
        if (results.errors.length > 0) {
          setMessage('Error parsing CSV: ' + results.errors.map(e => e.message).join(', '));
          toast.error('Error parsing CSV: ' + results.errors.map(e => e.message).join(', '));
          return;
        }

        if (Array.isArray(results.data) && results.data.length > 0) {
          // Check for headers
          if (!results.meta.fields || results.meta.fields.length === 0) {
            setMessage('Error: CSV does not contain headers.');
            toast.error('CSV does not contain headers.');
            return;
          }

          const headers = results.meta.fields;
          setData(results.data);
          setColumns(headers);
          const initialMappings = headers.map(header => ({ value: 'Ignore', label: 'Ignore' }));
          setHeaderMappings(initialMappings);
        } else {
          setMessage('Error in CSV format: No data or incorrect format.');
          toast.error('Error in CSV format: No data or incorrect format.');
        }
      },
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });
  };

  

  const validateMappings = (mappings) => {
    const requiredFields = ['Value', 'Place', 'Date', ];
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
  
  const convertDateToISO = (dateString) => {
    // Check if the date is already in ISO format (YYYY-MM-DD)
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  
    if (isoRegex.test(dateString)) {
      console.log("Date is already in ISO format:", dateString);
      return dateString; // Return the date as is since it's already in the expected format
    }
  
    // If the date is in UK format (DD/MM/YYYY), convert it to ISO format (YYYY-MM-DD)
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
  
    console.error("Invalid date format:", dateString);
    return '';  // Return an empty string or handle this case as needed
  };
  

  const handleSubmission = async () => {
    setLoading(true);
    setMessage('');
    setErrorRows([]);

    
  
    console.log("Attempting to create dataset with fields:", datasetFields);

    
  // Only attempt to convert if 'publishedDate' is not empty
  const formattedPublishedDate = datasetFields.publishedDate ? convertDateToISO(datasetFields.publishedDate) : null;

  if (!formattedPublishedDate) {
    setMessage('Invalid date format. Please ensure the date is in DD/MM/YYYY format.');
    setLoading(false);
    return; // Exit the function if the date is invalid
  }
  
    
    const { data: datasetData, error: datasetError } = await supabase
      .from('datasets')
      .insert({
        title: datasetFields.title,
        license: datasetFields.license,
        original_url: datasetFields.originalURL,
        published_date: formattedPublishedDate,
        owner: datasetFields.owner,
        dataset_description: datasetFields.description
      })
      .select();
  
    console.log("Dataset creation response data:", datasetData);
    console.log("Dataset creation error:", datasetError);
  
    if (datasetError) {
      console.error("Failed to create dataset record:", datasetError);
      setMessage(`Failed to create dataset record: ${datasetError.message}`);
      setLoading(false);
      return;
    }
  
    if (datasetData && datasetData.length > 0) {
      const datasetId = datasetData[0].id;  
      const formattedAdditionalFields = {
      ...additionalFields,
      date: additionalFields.date ? convertDateToISO(additionalFields.date) : null
    };

    // Call submitData with formatted additionalFields
    const result = await submitData(data, headerMappings, formattedAdditionalFields, datasetId);
    setLoading(false);
  
      if (!result.success) {
        setErrorRows(result.errorRows);
        setMessage(result.message);
      } else {
        setMessage('Data and dataset uploaded successfully.');
      }
    } else {
      setMessage("No dataset was created, unable to upload observations.");
      setLoading(false);
    }
  };
  
  
  const submitData = async (data, mappings, additionalFields, datasetId) => {
    const headers = Object.keys(data[0]);
    const errors = [];
    const errorRows = [];
    const processedData = [];
  
    data.forEach((row, rowIndex) => {
      let rowHasError = false;
      const entry = { dataset_id: datasetId };
  
      mappings.forEach((mapping, idx) => {
        if (mapping.value !== 'Ignore') {
          const header = headers[idx];
          let value = row[header];
  
          // Convert date fields if designated as a 'date' type in the mappings
          if (mapping.value.toLowerCase() === 'date') {
            value = convertDateToISO(value);
            if (value === '') {  
              errors.push(`Row ${rowIndex + 1}: Invalid date format in '${header}'.`);
              errorRows.push(rowIndex);
              rowHasError = true;
              return;  // Skip further processing of this row due to error
            }
          }
  
          if (!rowHasError) {
            // Process as a numeric value if the mapping label is 'Value'
            if (mapping.label === 'Value') {
              value = parseFloat(value);
              if (isNaN(value)) {
                errors.push(`Row ${rowIndex + 1}: '${value}' is not a valid number.`);
                errorRows.push(rowIndex);
                rowHasError = true;
                return;  // Skip further processing of this row due to error
              } else {
                entry['name'] = header;  // Use the column header as the 'name'
                entry['value'] = value;  // Store the number as 'value'
              }
            } else {
              entry[mapping.value.toLowerCase()] = value;  // Set other types of mapped data
            }
          }
        }
      });
  
      // Add additional fields with default values if not already present
      if (!rowHasError) {
        Object.entries(additionalFields).forEach(([key, val]) => {
          if (val && !entry[key.toLowerCase()]) {
            entry[key.toLowerCase()] = val;
          }
        });
  
        processedData.push(entry);  
      }
    });
  
    if (errors.length > 0) {
      return { success: false, message: `Data validation failed:\n${errors.join('\n')}`, errorRows };
    }
  
    // Batch insert data to Supabase
    const { error } = await supabase.from('observations').insert(processedData);
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
    <div>
      <ToastContainer />
    <div className='p-4'>
      <div
        className='border-dashed border-4 border-gray-400 bg-purple-100 py-12 flex justify-center items-center cursor-pointer my-10'
        style={{ position: 'relative' }} 
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

      {/* Display error or success messages */}
      {message && <p className='font-semibold text-xl text-red-500'>{message}</p>}

      <div className='flex flex-col space-y-4 font-semibold text-black mb-4'>
        <input type="text" placeholder="Dataset Title" value={datasetFields.title} onChange={(e) => setDatasetFields({...datasetFields, title: e.target.value})} className="p-2 border placeholder-black placeholder-italic" />
         <Select
        value={licenseOptions.find(option => option.value === datasetFields.license)}
        onChange={handleSelectChange}
        options={licenseOptions}
        className="basic-single"
        classNamePrefix="select"
      />
        <input type="text" placeholder="Original URL" value={datasetFields.originalURL} onChange={(e) => setDatasetFields({...datasetFields, originalURL: e.target.value})} className="p-2 border placeholder-black placeholder-italic" />
        <input type="date" placeholder="Published Date" value={datasetFields.publishedDate} onChange={(e) => setDatasetFields({...datasetFields, publishedDate: e.target.value})} className="p-2 border placeholder-black placeholder-italic" />
        <input type="text" placeholder="Owner" value={datasetFields.owner} onChange={(e) => setDatasetFields({...datasetFields, owner: e.target.value})} className="p-2 border placeholder-black placeholder-italic" />
        <input type="text" placeholder="Dataset Description" value={datasetFields.description} onChange={(e) => setDatasetFields({...datasetFields, description: e.target.value})} className="p-2 border placeholder-black placeholder-italic" />
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
          
          <input type="text" placeholder="Place" value={additionalFields.place} onChange={(e) => handleFieldChange('place', e.target.value)} className="p-2 border placeholder-black placeholder-italic" />
          <input type="date" placeholder="Date" value={additionalFields.date} onChange={(e) => handleFieldChange('date', e.target.value)} className="p-2 border placeholder-black placeholder-italic" />
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
    </div>
  );
};

export default CSVUploadComponent;
