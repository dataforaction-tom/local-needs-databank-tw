import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import supabase from './supabaseClient'; // Ensure the correct path
import AllDashboard from './components/AllDashboard';
import ObservationsTable from './components/ObservationsTable';
import ObservationsChart from './components/ObservationsChart';
import { FaRegHospital, FaHandsHelping, FaBookOpen, FaChartBar, FaPlusCircle } from 'react-icons/fa';

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
                const observations = await Promise.all(localAuthorities.map(la =>
                    supabase.rpc('get_observations_by_place', { place_name: la.value })
                ));
        
                // Flatten the array of arrays into a single array of observations
                const mergedObservations = observations.reduce((acc, current) => acc.concat(current.data), []);
                setObservations(mergedObservations);
            } catch (error) {
                console.error('Error fetching observations for places', error);
            }
            setLoading(false);
        }
        
        // Update effect to trigger on selectedLAs changes
        useEffect(() => {
            if (selectedLAs.length > 0) {
                fetchObservationsForLAs(selectedLAs);
            } else {
                setObservations([]);
            }
        }, [selectedLAs]);
        
    
       
        

    // Helper function to map dataset properties
    const mapDatasets = (datasets) => datasets.map(ds => ({
        value: ds.id,
        label: ds.title,
        originalUrl: ds.original_url,
        publishedDate: ds.published_date,
        owner: ds.owner,
        description: ds.dataset_description,
        license: ds.license
    }));

    return (
        
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-sm font-bold text-gray-800 mt-2 mb-3 flex items-end flex justify-end mr-5">
                <FaChartBar className="text-[#662583] mr-2" size="2em" />
                Data Explorer Dashboard
            </div>
            
            <div className="w-9/10 mx-auto bg-gray-100 p-6">
            <div className='text-2xl font-bold my-2'>
            <h2>Local Needs Databank Explorer</h2>

            </div>
    <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
            <p>Here you can explore the data within the Local Needs Databank in your own way. Selecting datasets from the select keys to the right with render charts based on that dataset for you.</p>
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
            <Select
                options={singleDatasets}
                onChange={setSelectedSingle}
                value={selectedSingle}
                placeholder="Select a Single/General Dataset"
                isClearable={true}
                styles={customStyles}
            />
        </div>
    </div>
    <div className="mt-6 grid grid-cols-3 gap-4 b">
        <div className="col-span-1">
            <p>Here you can get all data in the Local Needs Databank related to a particular local authority area. Some charts may render also, but please be aware that the data may be at different scales. However you can still use the table to filter out any observations you don't want in your chart or data</p>
        </div>
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


{loading ? (
        <p>Loading observations...</p>
    ) : selectedLAs && (  // Render components only when selectedLA is truthy
        <>
            <ObservationsTable
                observations={observations}
                setFilteredObservations={setFilteredObservations}
                title={`Observations for ${selectedLAs.map(la => la.label).join(", ")}`}
            />
            <ObservationsChart
                observations={filteredObservations}
                title="Detailed Observations"
            />
        </>
    )}
            {selectedPlace && <AllDashboard placeDataset={selectedPlace} />}
            {selectedTime && <AllDashboard timeDataset={selectedTime} />}
            {selectedSingle && <AllDashboard singleDataset={selectedSingle} />}
        </div>
    );
};

export default Explore;

