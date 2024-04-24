import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import supabase from './supabaseClient'; // Ensure the correct path
import AllDashboard from './components/AllDashboard';
import ObservationsTable from './components/ObservationsTable';
import ObservationsChart from './components/ObservationsChart';

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
    const [selectedLA, setSelectedLA] = useState(null);
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
    
        async function fetchObservationsForLA(la_name) {
            setLoading(true);
            const { data, error } = await supabase
                .rpc('get_observations_by_place', { place_name: la_name });
            if (error) {
                console.error('Error fetching observations for place', la_name, error);
                setLoading(false);
                return;
            }
            setObservations(data);
            setLoading(false);
        }
        
    
        const handleSelectLA = (selectedOption) => {
            setSelectedLA(selectedOption);
            if (selectedOption) {
                fetchObservationsForLA(selectedOption.value);
            } else {
                setObservations([]);
            }
        };
        

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
            <div className=''>


            </div>
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
            <Select
                options={localAuthorities}
                onChange={handleSelectLA}
                value={selectedLA}
                placeholder="Select a Local Authority"
                isClearable={true}
            />
            {loading ? (
                <p>Loading observations...</p>
            ) : (
                <>
                <ObservationsTable
                    observations={observations}
                    setFilteredObservations={setFilteredObservations}
                    title={selectedLA ? `Observations for ${selectedLA.label}` : 'Select a Local Authority'}
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

