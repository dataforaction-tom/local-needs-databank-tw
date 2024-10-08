import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import supabase from './supabaseClient'; // Ensure the correct path
import AllDashboard from './components/AllDashboard';
import ObservationsTable from './components/ObservationsTable';
import ObservationsChart from './components/ObservationsChart';
import LocalAuthorityMap from './components/Map';
import LocalAuthorityMap23 from './components/Map23';
import { FaChartBar } from 'react-icons/fa';
import RadarChart from './components/RadarChart';

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
        
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-sm font-bold text-gray-800 mt-2 mb-3 flex items-end flex justify-end mr-5 mt-5">
                <FaChartBar className="text-[#662583] mr-2" size="2em" />
                Data Explorer Dashboard
            </div>
            
            <div className="w-9/10 mx-auto bg-gray-100 p-6">
            <div className='text-2xl font-bold my-2'>
            <h2>Local Needs Databank Explorer</h2>

            </div>
    <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 text-pretty">
            <p>Here you can explore the data within the Local Needs Databank in your own way. Selecting datasets from the select keys to the right will render charts based on that dataset for you.</p>
            <br></br>
            <p>Each of the select boxes will allow you to create a dashboard based on the dataset you select. Some of these are <b>'Place'</b> datasets, meaning they have geographic data, so will create charts and a map with location details</p>
            <br></br>
            <p>The <b>'Time'</b> select box allows your to look at datasets that have a time element, so you can look at trends over time</p>
            <br></br>
            <p>The <b>'Local Authority'</b> select box allows you to explore EVERY observation related to one or more Local Authorities. From there you can <b>filter</b> in the table the observations you actually want</p>
        </div>
        <div className="col-span-2 space-y-4">
            <Select
                options={placeDatasets}
                onChange={setSelectedPlace}
                value={selectedPlace}
                placeholder="Select a Place Dataset"
                isClearable={true}
                styles={customStyles}
            />
            <Select
                options={timeDatasets}
                onChange={setSelectedTime}
                value={selectedTime}
                placeholder="Select a Time Dataset"
                isClearable={true}
                styles={customStyles}
            />
           
             <div className="col-span-2 space-y-4">
                    <Select
                options={localAuthorities}
                onChange={setSelectedLAs}
                value={selectedLAs}
                placeholder="Select Local Authorities"
                isClearable={true}
                isMulti={true}  // Enable multi-selection
                styles={customStyles}
                />
        </div>
        </div>
    </div>
    <div className="mt-6 grid grid-cols-3 gap-4 b">
        <div className="col-span-1">
            <p>You only need to use one select field, though you can potentially use all 4 and create your own dashboard for exploration, using datasets from across the databank</p>
            <br></br>
            <p>For more details on how you could use the Data Explorer page, please see the <b>help video</b></p>
        </div>
       
    </div>
</div>


{loading ? (
        <p>Loading observations...</p>
    ) : selectedLAs.length > 0 && (  // Render components only when selectedLA is truthy
        <>
            <ObservationsTable
                observations={observations}
                setFilteredObservations={setFilteredObservations}
                title={selectedPlace?.title || ''}
            originalUrl={selectedPlace?.originalUrl || ''}
            owner={selectedPlace?.owner || ''}
            datasetDescription={selectedPlace?.description || ''}
            license={selectedPlace?.license || ''}
                
                
            />
            <ObservationsChart
                observations={filteredObservations}
                title="Detailed Observations"
            />
            <RadarChart
                        observations={filteredObservations}
                        title="Detailed Observations Radar Chart"
                    />
            
        </>
    )}
            {selectedPlace && <AllDashboard 
            placeDataset={selectedPlace} title={selectedPlace.title} 
            originalUrl={selectedPlace.originalUrl} 
            owner={selectedPlace.owner} 
            datasetDescription={selectedPlace.description} 
            license={selectedPlace.license} />}
            {selectedTime && <AllDashboard timeDataset={selectedTime} />}
            {selectedSingle && <AllDashboard singleDataset={selectedSingle} />}
        </div>
    );
};

export default Explore;

