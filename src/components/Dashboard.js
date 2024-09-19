import React, { useState, useEffect, lazy, Suspense } from 'react';
import ObservationsChart from './ObservationsChart';
import supabase from '../supabaseClient';
import MultiObservationsChart from './MultiObservationsChart';
import { Oval } from 'react-loader-spinner'; // Import spinner
import { openDB } from 'idb'; // Importing IndexedDB helper
import LocalAuthorityMap23 from './Map23';

const ObservationsTable = React.lazy(() => import('./ObservationsTable'));



function Dashboard({ dashboardId, defaultChartType, startColor, endColor, globalbackgroundColor, passDatasetMetadata }) {
    const [datasets, setDatasets] = useState([]);
    const [observations, setObservations] = useState([]);
    const [filteredObservations, setFilteredObservations] = useState([]);
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('All');
    const [selectedDataset, setSelectedDataset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTableVisible, setIsTableVisible] = useState(true);
    const [metadataPassed, setMetadataPassed] = useState(false); 
    const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

    // Initialise IndexedDB
    async function initDB() {
        return openDB('dashboard-cache', 1, {
            upgrade(db) {
                db.createObjectStore('observations');
            },
        });
    }

    // Save observations to IndexedDB
    async function saveToCache(key, data) {
        const db = await initDB();
        const tx = db.transaction('observations', 'readwrite');
        tx.store.put({ data, timestamp: Date.now() }, key);
        await tx.done;
    }

    // Get data from IndexedDB
    async function getFromCache(key) {
        const db = await initDB();
        const tx = db.transaction('observations');
        const cached = await tx.store.get(key);
        if (cached && (Date.now() - cached.timestamp < CACHE_EXPIRY)) {
            return cached.data;
        } else {
            return null; // Expired or not found
        }
    }

    // Manual cache refresh
    const refreshCache = () => {
        initDB().then(db => {
            const tx = db.transaction('observations', 'readwrite');
            tx.store.clear();
            tx.done.then(() => {
                window.location.reload(); // Refresh the page after clearing cache
            });
        });
    };

    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            // Check cache for datasets
            let datasetsData = await getFromCache(`datasets-${dashboardId}`);
            if (!datasetsData) {
                const { data, error } = await supabase
                    .from('dashboard_datasets')
                    .select('dashboard_id, datasets:dataset_id (id, title, original_url, published_date, owner, dataset_description, license)')
                    .eq('dashboard_id', dashboardId);
                datasetsData = data;
                if (!error) saveToCache(`datasets-${dashboardId}`, datasetsData);
            }

            if (datasetsData) {
                const options = datasetsData.map(dd => ({
                    value: dd.datasets.id,
                    label: dd.datasets.title,
                    original_url: dd.datasets.original_url,
                    dataset_description: dd.datasets.dataset_description,
                    license: dd.datasets.license,
                    published_date: dd.datasets.published_date,
                    owner: dd.datasets.owner,
                }));

                setDatasets(options);

                // Pass dataset metadata to parent if not passed yet
                if (!metadataPassed && passDatasetMetadata) {
                    passDatasetMetadata(options);
                    setMetadataPassed(true);
                }

                if (options.length > 0) {
                    setSelectedDataset(options[0]);
                    fetchObservations(options[0].value);
                }
            }

            // Check cache for regions
            let regionsData = await getFromCache('regions');
            if (!regionsData) {
                const { data, error } = await supabase
                    .from('observations')
                    .select('region', { distinct: true });
                regionsData = data;
                if (!error) saveToCache('regions', regionsData);
            }

            if (regionsData) {
                setRegions(['All', ...new Set(regionsData.map(r => r.region))]);
            }

            setLoading(false);
        }

        // Fetch data only on the first load
        if (!metadataPassed) {
            fetchData();
        }
    }, [dashboardId, metadataPassed, passDatasetMetadata]);

    const fetchObservations = async (datasetId) => {
        if (!datasetId) return;

        // Check cache for observations
        let cachedObservations = await getFromCache(`observations-${datasetId}-${selectedRegion}`);
        if (!cachedObservations) {
            let query = supabase.from('observations').select('*').eq('dataset_id', datasetId);
            if (selectedRegion !== 'All') {
                query = query.eq('region', selectedRegion);
            }

            const { data, error } = await query;
            cachedObservations = data;
            if (!error) saveToCache(`observations-${datasetId}-${selectedRegion}`, cachedObservations);
        }

        setObservations(cachedObservations);
        setFilteredObservations(cachedObservations);
    };

    const handleDatasetChange = (selectedOption) => {
        setSelectedDataset(selectedOption);
        if (selectedOption) {
            fetchObservations(selectedOption.value);
        } else {
            setObservations([]);
            setFilteredObservations([]);
        }
    };

    const handleRegionChange = (e) => {
        setSelectedRegion(e.target.value);
    };

    const toggleTableVisibility = () => {
        setIsTableVisible(!isTableVisible);
    };

    function hasMultipleUniqueNames(observations) {
        const uniqueNames = new Set(observations.map(obs => obs.name));
        return uniqueNames.size > 1;
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="bg-slate-50 p-3 md:p-5 m-3 md:m-5">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex-grow md:flex md:flex-grow"></div>
                    <button
                        onClick={toggleTableVisibility}
                        className="w-full md:w-auto bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300 mt-2 md:mt-0"
                    >
                        {isTableVisible ? 'Hide Table' : 'Show Table'}
                    </button>
                    <button
                        onClick={refreshCache}
                        className="w-full md:w-auto bg-[#662583] text-white font-medium py-2 px-4 rounded-md hover:bg-[#C7215D] transition-colors duration-300 mt-2 md:mt-0"
                    >
                        Refresh Data
                    </button>
                </div>
                {loading ? (
                    <div className="loader-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                        <Oval color="#00BFFF" height={80} width={80} />
                        <p>Loading data...</p>
                    </div>
                ) : (
                    <>
                        {isTableVisible && (
                            <ObservationsTable
                                title={selectedDataset ? selectedDataset.label : ''}
                                observations={observations}
                                setFilteredObservations={setFilteredObservations}
                                license={selectedDataset ? selectedDataset.license : ''}
                                original_url={selectedDataset ? selectedDataset.original_url : ''}
                                published_date={selectedDataset ? selectedDataset.published_date : ''}
                                dataset_description={selectedDataset ? selectedDataset.dataset_description : ''}
                                owner={selectedDataset ? selectedDataset.owner : ''}
                                globalbackgroundColor={globalbackgroundColor}
                            />
                        )}

                        <ObservationsChart
                            observations={filteredObservations}
                            title={selectedDataset ? selectedDataset.label : ''}
                            license={selectedDataset ? selectedDataset.license : ''}
                            original_url={selectedDataset ? selectedDataset.original_url : ''}
                            published_date={selectedDataset ? selectedDataset.published_date : ''}
                            dataset_description={selectedDataset ? selectedDataset.dataset_description : ''}
                            owner={selectedDataset ? selectedDataset.owner : ''}
                            globalbackgroundColor={globalbackgroundColor}
                        />

                        <LocalAuthorityMap23
                            selectedDataset={selectedDataset}
                            filteredObservations={filteredObservations}
                            title={selectedDataset ? selectedDataset.label : ''}
                            license={selectedDataset ? selectedDataset.license : ''}
                            original_url={selectedDataset ? selectedDataset.original_url : ''}
                            published_date={selectedDataset ? selectedDataset.published_date : ''}
                            dataset_description={selectedDataset ? selectedDataset.dataset_description : ''}
                            owner={selectedDataset ? selectedDataset.owner : ''}
                            startColor={startColor}
                            endColor={endColor}
                            globalbackgroundColor={globalbackgroundColor}
                        />

                        {hasMultipleUniqueNames(filteredObservations) && (
                            <MultiObservationsChart
                                observations={filteredObservations}
                                title={selectedDataset ? selectedDataset.label : ''}
                                license={selectedDataset ? selectedDataset.license : ''}
                                original_url={selectedDataset ? selectedDataset.original_url : ''}
                                published_date={selectedDataset ? selectedDataset.published_date : ''}
                                dataset_description={selectedDataset ? selectedDataset.dataset_description : ''}
                                owner={selectedDataset ? selectedDataset.owner : ''}
                                defaultChartType={defaultChartType}
                                globalbackgroundColor={globalbackgroundColor}
                            />
                        )}
                    </>
                )}
            </div>
        </Suspense>
    );
}

export default Dashboard;
