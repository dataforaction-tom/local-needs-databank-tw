import React, { useState, useEffect } from 'react';
import ObservationsTable from './ObservationsTable';
import ObservationsChart from './ObservationsChart';
import LocalAuthorityMap from './Map'; // Ensure correct path

import TimeObservationsChart from './TimeObservationsChart';
import Select from 'react-select';
import supabase from '../supabaseClient'; // Ensure correct path
import LocalAuthorityMap23 from './Map23';

function AllDashboard({ placeDataset, timeDataset, singleDataset }) {
    const [observations, setObservations] = useState([]);
    const [filteredObservations, setFilteredObservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTableVisible, setIsTableVisible] = useState(true);

    // Determine active dataset based on what is passed
    const activeDataset = placeDataset || timeDataset || singleDataset;

    useEffect(() => {
        if (!activeDataset) return;
        fetchObservations(activeDataset.value);
    }, [activeDataset]);

    const fetchObservations = async (datasetId) => {
        setLoading(true);
        const { data, error } = await supabase.from('observations').select('*').eq('dataset_id', datasetId);
        if (error) {
            console.error('Error fetching observations', error);
            setLoading(false);
            return;
        }
        setObservations(data);
        setFilteredObservations(data);  // Initialize with all data
        setLoading(false);
    };

    const toggleTableVisibility = () => {
        setIsTableVisible(!isTableVisible);
    };

    if (!activeDataset) {
        return <p>No dataset selected.</p>;
    }

    return (
        <div className="bg-slate-50 p-3 md:p-5 m-3 md:m-5">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <button
                    onClick={toggleTableVisibility}
                    className="bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300 mt-2 md:mt-0"
                >
                    {isTableVisible ? 'Hide Table' : 'Show Table'}
                </button>
            </div>

            {loading ? <p className="text-center">Loading...</p> : (
                <>
                    {isTableVisible && (
                        <ObservationsTable
                            observations={observations}
                            setFilteredObservations={setFilteredObservations}
                            title={activeDataset.label}
                            license={activeDataset.license}
                            originalUrl={activeDataset.originalUrl}
                            publishedDate={activeDataset.publishedDate}
                            description={activeDataset.description}
                            owner={activeDataset.owner}
                        />
                    )}


                    {placeDataset && (
                        <>
                            <ObservationsChart observations={filteredObservations} title={placeDataset.label} />
                            <LocalAuthorityMap23 selectedDataset={placeDataset} filteredObservations={filteredObservations} title={placeDataset.label} />
                        </>
                    )}

                    {timeDataset && (
                        <TimeObservationsChart observations={filteredObservations} title={timeDataset.label} />
                    )}
                </>
            )}
        </div>
    );
}

export default AllDashboard;

