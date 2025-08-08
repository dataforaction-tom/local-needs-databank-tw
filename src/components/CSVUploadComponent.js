import React, { useState } from 'react';
import Papa from 'papaparse';
import TablePreview from './TablePreview';
import supabase from '../supabaseClient';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import { parse, isValid, formatISO } from 'date-fns';



const CSVUploadComponent = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [showFields, setShowFields] = useState(false); // State to control the visibility of input fields
  const [headerMappings, setHeaderMappings] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);

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
    description: '',
    geographic_level: '',
      });
    // Options for the License select field
    const licenseOptions = [
      { value: 'CC BY', label: 'CC BY' },
      { value: 'CC BY-SA', label: 'CC BY-SA' },
      { value: 'CC0', label: 'CC0' },
      { value: 'Creative Commons Attribution 4.0 International License', label: 'Creative Commons Attribution 4.0 International License'},
      { value: 'with permission', label: 'with permission'},
      { value: 'Open Government Licence v3.0', label: 'Open Government Licence v3.0'}
    ];

    const geographicLevelOptions = [

      { value: 'single LA', label: 'single LA'},
      { value: 'multiple LA', label: 'multiple LA'},
      { value: 'region', label: 'region'},
      { value: 'England only partial', label: 'England only partial'},
      { value: 'Wales only partial', label: 'Wales only partial'},
      { value: 'Scotland only partial', label: 'Scotland only partial'},
      { value: 'NI only partial', label: 'NI only partial'},
      { value: 'England only full', label: 'England only full'},
      { value: 'Wales only full', label: 'Wales only full'},
      { value: 'Scotland only full', label: 'Scotland only full'},
      { value: 'NI only full', label: 'NI only full'},
      { value: 'England & Wales', label: 'England & Wales'},
      { value: 'GB', label: 'GB'},
      { value: 'UK', label: 'UK'},

    ];
  
  const [errorRows, setErrorRows] = useState([]);
  const [cellErrors, setCellErrors] = useState({}); // { [rowIndex]: { [columnName]: [errorType,...] } }
  const [validationSummary, setValidationSummary] = useState({}); // { errorType: count }
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [lastDeleteBackup, setLastDeleteBackup] = useState(null); // { data, cellErrors, errorRows }
  const [completionStatus, setCompletionStatus] = useState({
    value: false,
    place: false,
    date: false,
    name: false
  });

  // Simple schema rules per logical field
  const [schemaRules, setSchemaRules] = useState({
    Place: { required: true, type: 'string', unique: false, enum: '' },
    Date: { required: true, type: 'date', unique: false, enum: '' },
    Value: { required: true, type: 'number', unique: false, enum: '', min: '', max: '' },
    Period: { required: false, type: 'string', unique: false, enum: '' },
  });
  
  const toggleFields = () => {
    setShowFields(!showFields); // Toggle the state to show or hide fields
  };

  function parseDate(input) {
    // Handle Date instances directly
    if (input instanceof Date) {
      if (isValid(input)) return formatISO(input, { representation: 'date' });
      return null;
    }

    const src = input == null ? '' : String(input).trim();
    if (!src) return null;

    const formats = [
      'dd/MM/yyyy', // UK date format
      'MM/dd/yyyy', // US date format
      'yyyy-MM-dd', // ISO format
    ];
  
    console.log(`Parsing date: ${src}`);
  
    for (let format of formats) {
      const parsedDate = parse(src, format, new Date());
      console.log(`Trying format ${format}:`, parsedDate);
      if (isValid(parsedDate)) {
        return formatISO(parsedDate, { representation: 'date' });
      }
    }

    // Best effort: plain 4-digit year
    if (/^\d{4}$/.test(src)) {
      const yearNum = Number(src);
      if (yearNum >= 1900 && yearNum <= 2100) {
        const isoDate = `${src}-01-01`;
        console.log(`Best-effort year-only date -> ${isoDate}`);
        return isoDate;
      }
    }
  
    console.log('No valid date format found, returning null.');
    return null;
  }
  

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

   // Handler for changes in the select field
   const handleLicenseChange = (selectedOption) => {
    setDatasetFields({...datasetFields, license: selectedOption.value});
    
  };

    // Handler for changes in the geographic level select field
    const handleGeographicLevelChange = (selectedOption) => {
      setDatasetFields({ ...datasetFields, geographic_level: selectedOption.value });
    };

  const handleFileDrop = (file) => {
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      setMessage('Error: The file must be a CSV file.');
      toast.error('The file must be a CSV file.');
      return;
    }
  
    Papa.parse(file, {
      complete: async (results) => {
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
          // Post-process numeric strings (remove thousands separators) now that worker mode is enabled
          const normalizedRows = results.data.map((row) => {
            const newRow = { ...row };
            headers.forEach((h) => {
              const v = newRow[h];
              if (typeof v === 'string' && v.includes(',')) {
                const cleanedValue = parseFloat(v.replace(/,/g, ''));
                if (!isNaN(cleanedValue)) newRow[h] = cleanedValue;
              }
            });
            return newRow;
          });
          setData(normalizedRows);
          setColumns(headers);
          const initialMappings = headers.map(header => ({ value: 'Ignore', label: 'Ignore' }));
          setHeaderMappings(initialMappings);
  
          // Normalize any mapped Date columns
          const dataWithDatesProcessed = normalizedRows; // will adjust post-mapping as well
          setData(dataWithDatesProcessed);
          // Run validations using a raw parse without headers for structural checks
          await runValidations(file, headers, dataWithDatesProcessed);
          // Apply schema-driven validations
          applySchemaValidation(dataWithDatesProcessed, headers, initialMappings);
        } else {
          setMessage('Error in CSV format: No data or incorrect format.');
          toast.error('Error in CSV format: No data or incorrect format.');
        }
      },
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      worker: true,
      // Note: transform is not supported with worker:true (cannot clone functions). We normalize values after parse.
    });
  };

  // Infer and validate using raw rows
  const runValidations = (file, headers, dataWithDatesProcessed) => {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: false,
        dynamicTyping: false,
        skipEmptyLines: false,
        complete: ({ data: rawRows }) => {
          try {
            const summary = {};
            const addSummary = (type, inc = 1) => { summary[type] = (summary[type] || 0) + inc; };

            if (!rawRows || rawRows.length === 0) {
              setCellErrors({});
              setErrorRows([]);
              setValidationSummary(summary);
              resolve();
              return;
            }

            // Header checks
            const headerRow = rawRows[0] || [];
            const isHeaderMissing = headerRow.length === 0 || headerRow.every(cell => String(cell || '').trim() === '');
            if (isHeaderMissing) addSummary('Header missing', 1);

            // Column names
            const columnNames = headers && headers.length ? headers : headerRow.map((h, idx) => (String(h || '').trim() || `Column ${idx + 1}`));
            const missingNameIndexes = columnNames.map((h, i) => ({ h, i })).filter(x => String(x.h || '').trim() === '').map(x => x.i);
            if (missingNameIndexes.length > 0) addSummary('Column name missing', missingNameIndexes.length);
            const nameCounts = columnNames.reduce((acc, n) => { const k = n || ''; acc[k] = (acc[k] || 0) + 1; return acc; }, {});
            const duplicateNames = Object.entries(nameCounts).filter(([, c]) => c > 1);
            if (duplicateNames.length > 0) addSummary('Duplicate column name', duplicateNames.length);

            // Row structure checks
            const headerLen = columnNames.length;
            const rowErrorsSet = new Set();
            const perCellErrors = {};

            for (let r = 1; r < rawRows.length; r += 1) {
              const row = rawRows[r];
              const isCompletelyEmpty = !row || row.every(cell => String(cell || '').trim() === '');
              if (isCompletelyEmpty) {
                addSummary('Empty row', 1);
                rowErrorsSet.add(r - 1); // align to data index (exclude header)
                continue;
              }
              const len = row ? row.length : 0;
              if (len < headerLen) { addSummary('Missing cell', 1); rowErrorsSet.add(r - 1); }
              if (len > headerLen) { addSummary('Extra cell', 1); rowErrorsSet.add(r - 1); }
            }

            // Type inference: determine numeric columns and flag non-numeric values
            const dataRows = rawRows.slice(1);
            const numericLikely = columnNames.map((_, colIdx) => {
              const values = dataRows.map(row => row?.[colIdx]).filter(v => String(v ?? '').trim() !== '');
              if (values.length === 0) return false;
              const numCount = values.filter(v => !isNaN(Number(String(v).replace(/,/g, '')))).length;
              return (numCount / values.length) >= 0.7; // threshold
            });

            dataRows.forEach((row, rIdx) => {
              if (!row) return;
              row.forEach((cell, cIdx) => {
                const rowIndex = rIdx; // already aligned to data index
                const colName = columnNames[cIdx] || `Column ${cIdx + 1}`;
                if (numericLikely[cIdx]) {
                  const isNum = !isNaN(Number(String(cell).replace(/,/g, '')));
                  if (String(cell).trim() !== '' && !isNum) {
                    perCellErrors[rowIndex] = perCellErrors[rowIndex] || {};
                    perCellErrors[rowIndex][colName] = perCellErrors[rowIndex][colName] || [];
                    perCellErrors[rowIndex][colName].push('Wrong data type (expected number)');
                    addSummary('Wrong data type', 1);
                    rowErrorsSet.add(rowIndex);
                  }
                }
              });
            });

            setCellErrors(perCellErrors);
            setErrorRows(Array.from(rowErrorsSet));
            setValidationSummary(summary);
            resolve();
          } catch (e) {
            console.error('Validation failed', e);
            resolve();
          }
        }
      });
    });
  };

  // Helper to get mapping from logical field name to column index
  const getLogicalFieldToIndex = (headers, mappings) => {
    const map = {};
    mappings.forEach((m, idx) => {
      if (m && m.value && m.value !== 'Ignore') {
        map[m.value] = idx;
      }
    });
    return map;
  };

  const applySchemaValidation = (rows, headers, mappings) => {
    const fieldToIndex = getLogicalFieldToIndex(headers, mappings);
    const newCellErrors = { ...cellErrors };
    const newRowErrors = new Set(errorRows);
    const newSummary = { ...validationSummary };

    const addSummary = (type) => { newSummary[type] = (newSummary[type] || 0) + 1; };

    // Unique trackers per logical field
    const seenValues = {};
    Object.keys(schemaRules).forEach((field) => { if (schemaRules[field].unique) seenValues[field] = new Set(); });

    rows.forEach((row, rIdx) => {
      Object.entries(fieldToIndex).forEach(([field, cIdx]) => {
        const rules = schemaRules[field];
        if (!rules) return;
        const colName = headers[cIdx];
        const rawVal = row[colName];
        const valStr = rawVal == null ? '' : String(rawVal).trim();
        const errors = [];

        // Required
        if (rules.required && (valStr === '')) {
          errors.push('Required value missing');
          addSummary('Required value missing');
        }

        // Type
        if (valStr !== '') {
          if (rules.type === 'number') {
            const isNum = typeof rawVal === 'number' || !isNaN(Number(String(rawVal).replace(/,/g, '')));
            if (!isNum) { errors.push('Wrong data type (expected number)'); addSummary('Wrong data type'); }
            // Min/Max
            const num = Number(String(rawVal).replace(/,/g, ''));
            if (rules.min !== '' && !isNaN(Number(rules.min)) && num < Number(rules.min)) { errors.push(`Below minimum (${rules.min})`); addSummary('Below minimum'); }
            if (rules.max !== '' && !isNaN(Number(rules.max)) && num > Number(rules.max)) { errors.push(`Above maximum (${rules.max})`); addSummary('Above maximum'); }
          } else if (rules.type === 'date') {
            const parsed = parseDate(valStr);
            if (!parsed || parsed === 'Invalid date') { errors.push('Wrong data type (expected date)'); addSummary('Wrong data type'); }
          } else {
            // string: no-op
          }
        }

        // Enum
        if (rules.enum && rules.enum.trim() !== '' && valStr !== '') {
          const set = new Set(rules.enum.split(',').map(s => s.trim()).filter(Boolean));
          if (!set.has(valStr)) { errors.push('Value not in allowed set'); addSummary('Value not in allowed set'); }
        }

        // Unique (non-empty values)
        if (rules.unique && valStr !== '') {
          const seen = seenValues[field];
          if (seen) {
            const key = valStr.toLowerCase();
            if (seen.has(key)) { errors.push('Duplicate value (should be unique)'); addSummary('Duplicate value'); }
            else { seen.add(key); }
          }
        }

        if (errors.length > 0) {
          newCellErrors[rIdx] = newCellErrors[rIdx] || {};
          newCellErrors[rIdx][colName] = [...(newCellErrors[rIdx][colName] || []), ...errors];
          newRowErrors.add(rIdx);
        }
      });
    });

    setCellErrors(newCellErrors);
    setErrorRows(Array.from(newRowErrors));
    setValidationSummary(newSummary);
  };

  // Normalize date columns based on current mappings (any column mapped to 'Date')
  const normalizeDatesByMapping = (rows, headers, mappings) => {
    const fieldToIndex = getLogicalFieldToIndex(headers, mappings);
    const dateIndex = fieldToIndex['Date'];
    if (dateIndex === undefined) return rows;
    const dateHeader = headers[dateIndex];
    return rows.map((row) => {
      const cloned = { ...row };
      const v = cloned[dateHeader];
      const parsed = parseDate(v);
      if (parsed) cloned[dateHeader] = parsed;
      return cloned;
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
    setIsFormValid(Object.values(newCompletionStatus).every(status => status)); // All fields must be complete
  };
  

  const handleMappingChange = (index, option) => {
    const newMappings = [...headerMappings];
    newMappings[index] = option;
    setHeaderMappings(newMappings);
    validateMappings(newMappings); // Validate whenever mappings change
    // Re-apply normalization and validation after mapping changes
    if (data.length > 0 && columns.length > 0) {
      const normalized = normalizeDatesByMapping(data, columns, newMappings);
      setData(normalized);
      applySchemaValidation(normalized, columns, newMappings);
    }
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
  
    console.log("Attempting to create dataset with fields:", datasetFields);
  
    // Including .select() to ensure the inserted data is returned
    const { data: datasetData, error: datasetError } = await supabase
      .from('datasets')
      .insert({
        title: datasetFields.title,
        license: datasetFields.license,
        original_url: datasetFields.originalURL,
        published_date: datasetFields.publishedDate,
        owner: datasetFields.owner,
        dataset_description: datasetFields.description,
        geographic_level: datasetFields.geographic_level

      })
      .select();
  
   
  
    if (datasetError) {
      console.error("Failed to create dataset record:", datasetError);
      setMessage(`Failed to create dataset record: ${datasetError.message}`);
      setLoading(false);
      return;
    }
  
    if (datasetData && datasetData.length > 0) {
      const datasetId = datasetData[0].id;  // Assume 'id' is the primary key
      const result = await submitData(data, headerMappings, additionalFields, datasetId);
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

  const exportErrors = () => {
    const rows = [];
    Object.entries(cellErrors).forEach(([rowIndex, cols]) => {
      Object.entries(cols).forEach(([colName, errs]) => {
        rows.push({ row: Number(rowIndex) + 2, column: colName, errors: errs.join('; ') }); // +2 to account for header and 0-index
      });
    });
    const csvHeader = 'row,column,errors\n';
    const csvBody = rows.map(r => `${r.row},"${r.column}","${r.errors}"`).join('\n');
    const blob = new Blob([csvHeader + csvBody], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'validation-errors.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Fix suggestions: auto-trim, normalize case, remove thousands separators, best-effort date parsing
  const applyFixSuggestions = () => {
    if (data.length === 0) return;
    let fixed = data.map((row) => {
      const newRow = { ...row };
      Object.keys(newRow).forEach((key) => {
        let v = newRow[key];
        if (typeof v === 'string') {
          // Trim and collapse whitespace
          v = v.trim().replace(/\s+/g, ' ');
          // Remove thousands separators if numeric-like
          if (/^-?[\d,.]+$/.test(v)) {
            const num = Number(v.replace(/,/g, ''));
            if (!isNaN(num)) v = num;
          }
          // Best-effort date normalization where header exactly 'Date'
          if (key === 'Date') {
            const parsed = parseDate(v);
            if (parsed && parsed !== 'Invalid date') v = parsed;
          }
        }
        newRow[key] = v;
      });
      return newRow;
    });
    // Also normalize based on mapping in case the Date column is not literally named 'Date'
    fixed = normalizeDatesByMapping(fixed, columns, headerMappings);
    setData(fixed);
    // Re-validate with current mappings and schema
    applySchemaValidation(fixed, columns, headerMappings);
    toast.success('Applied fix suggestions and re-validated');
  };
  
  
const submitData = async (data, mappings, additionalFields, datasetId) => {
  
  const headers = Object.keys(data[0]);
  const errors = [];
  const errorRows = [];
  const processedData = [];
  const rowHasError = [];

  // Determine name column and count of value columns
  const nameColIndex = mappings.findIndex(m => m && m.value === 'Name');
  const valueColIndices = mappings.map((m, i) => (m && m.value === 'Value') ? i : -1).filter(i => i >= 0);

  data.forEach((row, rowIndex) => {
    // For each row, create an entry for each "value" column selected
    mappings.forEach((mapping, idx) => {
      if (mapping.value === 'Date'){
        const formattedDate = parseDate(row[headers[idx]]);
        if (formattedDate) {
          row[headers[idx]] = formattedDate;  // Ensure dates are reformatted
        } else {
          console.error(`Invalid date at row ${rowIndex + 1}: ${row[headers[idx]]}`);
          errors.push(`Row ${rowIndex + 1}: Invalid date format '${row[headers[idx]]}'.`);
          rowHasError = true;
        }
      
      }
      if (mapping.value !== 'Ignore' && mapping.label === 'Value') {
        const entry = { dataset_id: datasetId }; 
        let rowHasError = false;

        // Store the header as 'name' in Supabase and the column value as 'value'
        const value = parseFloat(row[headers[idx]]);
        if (isNaN(value)) {
          errors.push(`Row ${rowIndex + 1}: '${row[headers[idx]]}' is not a valid number.`);
          if (!rowHasError) {
            errorRows.push(rowIndex);
            rowHasError = true;
          }
        } else {
          // Resolve the name: prefer mapped Name column if provided
          if (nameColIndex !== -1) {
            const baseName = row[headers[nameColIndex]];
            const headerName = headers[idx];
            if (valueColIndices.length > 1 && baseName != null && String(baseName).trim() !== '') {
              entry['name'] = `${String(baseName).trim()} - ${headerName}`;
            } else if (baseName != null && String(baseName).trim() !== '') {
              entry['name'] = String(baseName).trim();
            } else {
              entry['name'] = headerName;
            }
          } else {
            entry['name'] = headers[idx];  // Fallback to value column header
          }
          entry['value'] = value;  // Store the number as 'value'

          // Include other mapped fields
          mappings.forEach((m, i) => {
            if (m.value !== 'Ignore' && m.value !== 'Value' && m.value !== 'Name') {
              if (m.value === 'Place') {
                entry['place_upload'] = row[headers[i]];
              }
              else {
              entry[m.value.toLowerCase()] = row[headers[i]];
              }
            }
          });

          // Add additional fields with default values if not already present
          Object.entries(additionalFields).forEach(([key, value]) => {
            if (value && !entry[key.toLowerCase()]) {
              entry[key.toLowerCase()] = value;
            }
          });

          processedData.push(entry);
        }
      }
    });
  });

  if (errors.length > 0) {
    return { success: false, message: `Data validation failed:\n${errors.join('\n')}`, errorRows };
  }

  // Batch insert data to Supabase
  const { data: error } = await supabase.from('observations').insert(processedData);
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
    const totalFields = 3; // Total number of required fields
    const filledFields = Object.values(completionStatus).filter(status => status).length;
    return (filledFields / totalFields) * 100;
  };

  return (
    <div>
      <ToastContainer />
      <div className="grid grid-cols-3 gap-4 items-center bg-slate-50">
      
        <div className="col-span-1 justify-center">
        
            <p className='text-xl font-bold'>To get started read our guidance or drop in a csv to the right</p>
        </div>
        <div className="col-span-2 space-y-4">
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
      </div>

      {/* Display error or success messages */}
      {message && <p className='font-semibold text-xl text-red-500'>{message}</p>}

      <div className='flex flex-col space-y-4 font-semibold text-black mb-4  p-6 rounded-lg'>
      {data.length > 0 && (
        <>
        <h2 className='font-bold text-2xl'> Please enter the Metadata for your dataset here</h2>
        <p className=''>By this we mean any information about your dataset, like a name, where you might be able to find the original data, when it was published etc. You don't have to give this information, but it will help us other users.</p>
    <input 
        type="text" 
        placeholder="Dataset Title" 
        value={datasetFields.title} 
        onChange={(e) => setDatasetFields({...datasetFields, title: e.target.value})} 
        className="p-3 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <Select
        value={geographicLevelOptions.find(option => option.value === datasetFields.geographic_level)}
        placeholder="Geographic level" 
        onChange={handleGeographicLevelChange}
        options={geographicLevelOptions}
        className="basic-single"
        classNamePrefix="select"
        styles={{
            control: (provided) => ({
                ...provided,
                minHeight: '44px',
                boxShadow: 'none',
                borderColor: '#d1d5db',
                '&:hover': {
                    borderColor: '#bbc1e1'
                },
                '&:focus': {
                    borderColor: '#2563eb'
                }
            }),
            option: (provided, state) => ({
                ...provided,
                color: state.isSelected ? 'white' : 'gray',
                backgroundColor: state.isSelected ? '#2563eb' : 'white',
                '&:hover': {
                    backgroundColor: '#ebf4ff'
                }
            }),
        }}
    />
    <Select
        value={licenseOptions.find(option => option.value === datasetFields.license)}
        placeholder="License" 
        onChange={handleLicenseChange}
        options={licenseOptions}
        className="basic-single"
        classNamePrefix="select"
        styles={{
            control: (provided) => ({
                ...provided,
                minHeight: '44px',
                boxShadow: 'none',
                borderColor: '#d1d5db',
                '&:hover': {
                    borderColor: '#bbc1e1'
                },
                '&:focus': {
                    borderColor: '#2563eb'
                }
            }),
            option: (provided, state) => ({
                ...provided,
                color: state.isSelected ? 'white' : 'gray',
                backgroundColor: state.isSelected ? '#2563eb' : 'white',
                '&:hover': {
                    backgroundColor: '#ebf4ff'
                }
            }),
        }}
    />
    <input 
        type="text" 
        placeholder="Original URL" 
        value={datasetFields.originalURL} 
        onChange={(e) => setDatasetFields({...datasetFields, originalURL: e.target.value})} 
        className="p-3 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <input 
        type="date" 
        placeholder="Published Date" 
        value={datasetFields.publishedDate} 
        onChange={(e) => setDatasetFields({...datasetFields, publishedDate: e.target.value})} 
        className="p-3 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <input 
        type="text" 
        placeholder="Owner" 
        value={datasetFields.owner} 
        onChange={(e) => setDatasetFields({...datasetFields, owner: e.target.value})} 
        className="p-3 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <input 
        type="text" 
        placeholder="Dataset Description - please include as much information about who or what the dataset relates to or excludes, i.e. females only" 
        value={datasetFields.description} 
        onChange={(e) => setDatasetFields({...datasetFields, description: e.target.value})} 
        className="p-3 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    
    />
     </>
      )}
</div>


{data.length > 0 && (
  <div className='flex flex-col space-y-4 font-semibold text-black mb-4 bg-slate-100 p-6 rounded-lg'>
      <p>Important - If you do not have a particular column in your data, you can use the input fields below to add to your data. PLEASE BE AWARE This will add the value you enter to EVERY row of your data.</p>
      <p>For example, if you add Newcastle in the Place field, every row in your data will show as having been in Newcastle.</p>
      <p>Click below to show these fields</p>
      <div className='flex items-center justify-center'>
        <button onClick={toggleFields} className="bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300 w-1/3 my-1">
          {showFields ? 'Hide Additional Fields' : 'Show Additional Fields'}
        </button>
      </div>
      {showFields && (
        <div className='flex flex-col space-y-4'>
          <input type="text" placeholder="Place" value={additionalFields.place} onChange={(e) => handleFieldChange('place', e.target.value)} className="p-2 border placeholder-black placeholder-italic" />
          <input type="date" placeholder="Date" value={additionalFields.date} onChange={(e) => handleFieldChange('date', e.target.value)} className="p-2 border placeholder-black placeholder-italic" />
          <input type="text" placeholder="Period" value={additionalFields.period} onChange={(e) => handleFieldChange('period', e.target.value)} className="p-2 border placeholder-black placeholder-italic" />
        </div>
      )}
  </div>
)}
      </div>
      <div className='my-5 bg-slate-100'>
      {data.length > 0 && (
        <div className='p-4 text-sm bg-purple-50 border border-purple-200 rounded mb-3'>
          <div className='font-semibold mb-2'>How to map your columns</div>
          <ul className='list-disc list-inside space-y-1'>
            <li>
              <span className='font-semibold'>Multiple Value columns</span>: map each numeric column to <span className='font-semibold'>Value</span>. The column header becomes the observation <span className='font-semibold'>Name</span>.
            </li>
            <li>
              <span className='font-semibold'>Single Value + Name column</span>: map the text column to <span className='font-semibold'>Name</span> and the numeric column to <span className='font-semibold'>Value</span>.
            </li>
          </ul>
          <div className='mt-2 text-slate-700'>If both a Name column and multiple Value columns are provided, the saved name becomes “Name - ValueHeader”.</div>
        </div>
      )}
      {data.length > 0 && columns.length > 0 && (
        <TablePreview
          data={data}
          columns={columns}
          mappings={headerMappings}
          onMappingChange={handleMappingChange}
          errorRows={errorRows}
          cellErrors={cellErrors}
          validationSummary={validationSummary}
        />
      )}
      
      
      </div>
      {data.length > 0 && columns.length > 0 && (
        <>
      <div className='bg-slate-100 p-4 rounded mb-4'>
        <h3 className='font-bold mb-2'>Validation rules</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {Object.entries(schemaRules).map(([field, rules]) => (
            <div key={field} className='border rounded p-3'>
              <div className='font-semibold mb-2'>{field}</div>
              <div className='flex items-center gap-2 mb-2'>
                <label className='text-sm w-24'>Required</label>
                <input type='checkbox' checked={rules.required} onChange={(e) => setSchemaRules(prev => ({ ...prev, [field]: { ...prev[field], required: e.target.checked } }))} />
              </div>
              <div className='flex items-center gap-2 mb-2'>
                <label className='text-sm w-24'>Type</label>
                <select className='border p-1 rounded text-sm' value={rules.type} onChange={(e) => setSchemaRules(prev => ({ ...prev, [field]: { ...prev[field], type: e.target.value } }))}>
                  <option value='string'>string</option>
                  <option value='number'>number</option>
                  <option value='date'>date</option>
                </select>
              </div>
              <div className='flex items-center gap-2 mb-2'>
                <label className='text-sm w-24'>Unique</label>
                <input type='checkbox' checked={rules.unique} onChange={(e) => setSchemaRules(prev => ({ ...prev, [field]: { ...prev[field], unique: e.target.checked } }))} />
              </div>
              {field === 'Value' && (
                <div className='flex items-center gap-2 mb-2'>
                  <label className='text-sm w-24'>Min</label>
                  <input className='border p-1 rounded text-sm w-24' type='number' value={rules.min} onChange={(e) => setSchemaRules(prev => ({ ...prev, [field]: { ...prev[field], min: e.target.value } }))} />
                  <label className='text-sm w-12'>Max</label>
                  <input className='border p-1 rounded text-sm w-24' type='number' value={rules.max} onChange={(e) => setSchemaRules(prev => ({ ...prev, [field]: { ...prev[field], max: e.target.value } }))} />
                </div>
              )}
              <div className='flex items-center gap-2 mb-2'>
                <label className='text-sm w-24'>Enum</label>
                <input className='border p-1 rounded text-sm flex-1' placeholder='Comma-separated allowed values' value={rules.enum} onChange={(e) => setSchemaRules(prev => ({ ...prev, [field]: { ...prev[field], enum: e.target.value } }))} />
              </div>
            </div>
          ))}
        </div>
        <div className='mt-2 flex flex-col md:flex-row gap-2 items-start md:items-center justify-between'>
          <div className='flex gap-2'>
            <button
              onClick={() => {
                const errorRowSet = new Set(Object.keys(cellErrors).map(k => Number(k)));
                if (errorRowSet.size === 0) {
                  toast.info('No error rows to delete');
                  return;
                }
                const confirmed = window.confirm(`Delete ${errorRowSet.size} row(s) with errors? This can be undone.`);
                if (!confirmed) return;
                setLastDeleteBackup({ data: [...data], cellErrors: { ...cellErrors }, errorRows: [...errorRows] });
                const filtered = data.filter((_, idx) => !errorRowSet.has(idx));
                setData(filtered);
                setCellErrors({});
                setErrorRows([]);
                toast.success('Removed rows with errors');
              }}
              className='bg-red-100 text-red-800 font-medium py-2 px-4 rounded-md hover:bg-red-200 transition-colors duration-300'
            >
              Delete rows with errors
            </button>
            {lastDeleteBackup && (
              <button
                onClick={() => {
                  setData(lastDeleteBackup.data);
                  setCellErrors(lastDeleteBackup.cellErrors);
                  setErrorRows(lastDeleteBackup.errorRows);
                  setLastDeleteBackup(null);
                  toast.success('Undo successful');
                }}
                className='bg-white border text-slate-800 font-medium py-2 px-4 rounded-md hover:bg-slate-50 transition-colors duration-300'
              >
                Undo
              </button>
            )}
          </div>
          <div className='flex gap-2'>
            <button onClick={() => applySchemaValidation(data, columns, headerMappings)} className='bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300'>Re-validate</button>
            <button onClick={applyFixSuggestions} className='bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-md hover:bg-slate-300 transition-colors duration-300'>Apply fix suggestions</button>
          </div>
        </div>
      </div>
      <p className='my-5 text-lg font-bold'>All submissions require a Place, Date and Value. You can view which of these you have provided or indicated below. At 100% you have all the required fields</p>
      <div className="w-full bg-gray-300">
      <div className="bg-[#662583] text-xs font-medium text-blue-100 text-center p-0.5 leading-none" style={{ width: `${calculateCompletionPercentage()}%` }}> {calculateCompletionPercentage()}% Complete</div>
      </div>
      <div className='mt-4'>
      {Object.keys(completionStatus).map(key => (
        <RequirementFeedback key={key} isComplete={completionStatus[key]} field={key.charAt(0).toUpperCase() + key.slice(1)} />
      ))}
      </div>
      <div className='mt-3'>
        <button onClick={exportErrors} className='bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300'>Download error report</button>
        {/* Hidden anchor to support header link on Contribute page */}
        <a id='download-error-report' href='#' onClick={(e) => { e.preventDefault(); exportErrors(); }} style={{ display: 'none' }}>download</a>
      </div>
      </>
      )}
        
      
      <div className='flex flex-row gap-4'>
      {isFormValid && !loading && (
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