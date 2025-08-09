import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import supabase from './supabaseClient'; // Ensure the correct path
import AllDashboard from './components/AllDashboard';
import ObservationsTable from './components/ObservationsTable';
import ObservationsChart from './components/ObservationsChart';
import { FaChartBar } from 'react-icons/fa';
import RadarChart from './components/RadarChart';
import { motion } from 'framer-motion';

const customStyles = {
    control: (base, state) => ({
        ...base,
        backgroundColor: 'white',
        borderColor: state.isFocused ? '#C7215D' : '#ccc',
        '&:hover': {
            borderColor: '#C7215D'
        },
        width: '100%',
        maxWidth: '600px', // Max width set for larger screens
    }),
    option: (provided, state) => ({
        ...provided,
        color: '#662583',
        fontWeight: 'bold',
        padding: 10,
    }),
    container: (provided) => ({
        ...provided,
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto', // Center align the select
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#662583',
    }),
};

const Explore = () => {
    const [placeDatasets, setPlaceDatasets] = useState([]);
    const [timeDatasets, setTimeDatasets] = useState([]);
    const [singleDatasets, setSingleDatasets] = useState([]);
    const [localAuthorities, setLocalAuthorities] = useState([]);
    const [selectedLAs, setSelectedLAs] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedSingle, setSelectedSingle] = useState(null);
    const [observations, setObservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filteredObservations, setFilteredObservations] = useState([]);

    useEffect(() => {
        fetchDatasets();
        fetchLocalAuthorities();
    }, []);
    
    
    
        async function fetchDatasets() {
            const { data, error } = await supabase
                .from('datasets')
                .select('id, title, type, original_url, published_date, owner, dataset_description, license');
            if (error) {
                console.error('Error fetching datasets', error);
                return;
            }
            

            // Filter data into separate arrays based on type
            const place = data.filter(ds => ds.type === 'place');
            const time = data.filter(ds => ds.type === 'time');
            const single = data.filter(ds => ds.type === 'single' || ds.type === null);

            // Map each dataset to an object structure expected by Select and later components
            setPlaceDatasets(mapDatasets(place));
            setTimeDatasets(mapDatasets(time));
            setSingleDatasets(mapDatasets(single));
        }
        async function fetchLocalAuthorities() {
            const { data, error } = await supabase
                .from('geography')
                .select('la_name');
            if (error) {
                console.error('Error fetching local authorities', error);
                return;
            }
            setLocalAuthorities(data.map(la => ({ value: la.la_name, label: la.la_name })));
        }
    
        async function fetchObservationsForLAs(localAuthorities) {
            setLoading(true);
            try {
                const observationsResults = await Promise.all(localAuthorities.map(la =>
                    supabase.rpc('get_observations_by_place', { place_name: la.value })
                ));
        
                // Flatten the array of arrays into a single array of observations
                const mergedObservations = observationsResults.reduce((acc, current) => acc.concat(current.data), []);
        
                // Extract unique dataset IDs from these observations
                const datasetIds = [...new Set(mergedObservations.map(obs => obs.dataset_id))];
        
                // Fetch dataset titles for these IDs
                const datasetTitles = await fetchDatasetTitles(datasetIds);
        
                // Enhance observations with dataset titles
                const observationsWithTitles = mergedObservations.map(obs => ({
                    ...obs,
                    datasetTitle: datasetTitles[obs.dataset_id] || "Unknown Dataset"
                }));
        
                setObservations(observationsWithTitles);
                setFilteredObservations(observationsWithTitles);  // Set filtered observations similarly, if needed immediately
            } catch (error) {
                console.error('Error fetching observations for places', error);
            } finally {
                setLoading(false);
            }
        }
        
        async function fetchDatasetTitles(datasetIds) {
            const { data, error } = await supabase
                .from('datasets')
                .select('id, title')
                .in('id', datasetIds);
        
            if (error) {
                console.error('Error fetching dataset titles', error);
                return {};
            }
        
            return data.reduce((acc, dataset) => {
                acc[dataset.id] = dataset.title;
                return acc;
            }, {});
        }
        
        
        // Update effect to trigger on selectedLAs changes
        useEffect(() => {
            if (selectedLAs.length > 0) {
                fetchObservationsForLAs(selectedLAs);
            } else {
                setObservations([]);
            }
        }, [selectedLAs]);
        
    
       
        

        const mapDatasets = (datasets) => datasets.map(ds => {
            const mappedData = {
                value: ds.id,
                label: ds.title,
                originalUrl: ds.original_url,
                publishedDate: ds.published_date,
                owner: ds.owner,
                description: ds.dataset_description,
                license: ds.license,
                title: ds.title
            };
            
            return mappedData;
        });
        
    
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto">
          <header className="mb-6 flex items-center gap-3">
            <FaChartBar className="text-[#662583]" size="1.75em" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Data Explorer</h1>
          </header>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start"
          >
            <div className="md:col-span-1 bg-white rounded-2xl p-6 shadow ring-1 ring-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Explore the databank</h2>
              <p className="mt-2 text-slate-700 text-sm">
                Choose datasets to build your own dashboard. Place datasets include geography (maps), Time datasets include trends, and you can also explore all observations for selected local authorities.
              </p>
              <ul className="mt-3 text-sm text-slate-700 list-disc list-inside">
                <li>Use one or combine multiple controls</li>
                <li>Filter the table to refine the charts</li>
              </ul>
            </div>
            <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow ring-1 ring-slate-200">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="place-datasets" className="block text-sm font-medium text-slate-700 mb-1">Place datasets</label>
                  <Select
                    inputId="place-datasets"
                    options={placeDatasets}
                    onChange={setSelectedPlace}
                    value={selectedPlace}
                    placeholder="Select a Place dataset"
                    isClearable
                    styles={customStyles}
                  />
                </div>
                <div>
                  <label htmlFor="time-datasets" className="block text-sm font-medium text-slate-700 mb-1">Time datasets</label>
                  <Select
                    inputId="time-datasets"
                    options={timeDatasets}
                    onChange={setSelectedTime}
                    value={selectedTime}
                    placeholder="Select a Time dataset"
                    isClearable
                    styles={customStyles}
                  />
                </div>
                <div>
                  <label htmlFor="single-datasets" className="block text-sm font-medium text-slate-700 mb-1">Single datasets</label>
                  <Select
                    inputId="single-datasets"
                    options={singleDatasets}
                    onChange={setSelectedSingle}
                    value={selectedSingle}
                    placeholder="Select a Single dataset"
                    isClearable
                    styles={customStyles}
                  />
                </div>
                <div>
                  <label htmlFor="la-select" className="block text-sm font-medium text-slate-700 mb-1">Local authorities</label>
                  <Select
                    inputId="la-select"
                    options={localAuthorities}
                    onChange={setSelectedLAs}
                    value={selectedLAs}
                    placeholder="Select Local Authorities"
                    isClearable
                    isMulti
                    styles={customStyles}
                  />
                </div>
              </div>
            </div>
          </motion.section>

          <section className="mt-8">
            {loading ? (
              <p className="text-slate-700">Loading observations...</p>
            ) : (
              selectedLAs.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow ring-1 ring-slate-200">
                  <ObservationsTable
                    observations={observations}
                    setFilteredObservations={setFilteredObservations}
                    title={selectedPlace?.title || ''}
                    original_url={selectedPlace?.originalUrl || ''}
                    owner={selectedPlace?.owner || ''}
                    dataset_description={selectedPlace?.description || ''}
                    license={selectedPlace?.license || ''}
                    published_date={selectedPlace?.publishedDate || ''}
                  />
                  <div className="mt-6 grid grid-cols-1 gap-6">
                    <ObservationsChart observations={filteredObservations} title="Detailed Observations" />
                    <RadarChart observations={filteredObservations} title="Detailed Observations Radar Chart" />
                  </div>
                </div>
              )
            )}
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6">
            {selectedPlace && (
              <AllDashboard
                placeDataset={selectedPlace}
                title={selectedPlace.title}
                originalUrl={selectedPlace.originalUrl}
                owner={selectedPlace.owner}
                datasetDescription={selectedPlace.description}
                license={selectedPlace.license}
              />
            )}
            {selectedTime && <AllDashboard timeDataset={selectedTime} />}
            {selectedSingle && <AllDashboard singleDataset={selectedSingle} />}
          </section>
        </div>
      </div>
    );
};

export default Explore;

