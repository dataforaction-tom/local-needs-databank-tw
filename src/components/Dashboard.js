import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';

import supabase from '../supabaseClient';

import { Oval } from 'react-loader-spinner'; // Import spinner
import { openDB } from 'idb'; // Importing IndexedDB helper
import Select from 'react-select';
const LocalAuthorityMap23 = React.lazy(() => import('./Map23'));
const MultiObservationsChart = React.lazy(() => import('./MultiObservationsChart'));
const ObservationsChart = React.lazy(() => import('./ObservationsChart'));

const ObservationsTable = React.lazy(() => import('./ObservationsTable'));



function Dashboard({ dashboardId, defaultChartType, startColor, endColor, globalbackgroundColor, passDatasetMetadata, baseline, baselineLabel }) {
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
                    // If URL contains datasetId, use it; otherwise default to first
                    const params = new URLSearchParams(window.location.search);
                    const datasetIdParam = params.get('datasetId');
                    const regionParam = params.get('region');
                    const matched = datasetIdParam ? options.find(o => String(o.value) === String(datasetIdParam)) : null;
                    const initialDataset = matched || options[0];
                    setSelectedDataset(initialDataset);
                    if (regionParam) {
                        setSelectedRegion(regionParam);
                    }
                    fetchObservations(initialDataset.value);
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
    }, [dashboardId, metadataPassed, passDatasetMetadata, baseline, baselineLabel]);

    // Refetch when region changes
    useEffect(() => {
        if (selectedDataset?.value) {
            fetchObservations(selectedDataset.value);
        }
    }, [selectedRegion]);

    // Keep URL in sync with selections
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (selectedDataset?.value) params.set('datasetId', String(selectedDataset.value));
        if (selectedRegion) params.set('region', selectedRegion);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState(null, '', newUrl);
    }, [selectedDataset, selectedRegion]);

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

    const handleRegionChange = (option) => {
        setSelectedRegion(option?.value || 'All');
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
                <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                    {/* Dataset selector */}
                    <div className="w-full md:w-1/2">
                        <Select
                            value={selectedDataset}
                            onChange={handleDatasetChange}
                            options={datasets}
                            placeholder="Select dataset..."
                            classNamePrefix="select"
                        />
                    </div>
                    {/* Region selector */}
                    <div className="w-full md:w-1/4">
                        <Select
                            value={{ value: selectedRegion, label: selectedRegion }}
                            onChange={handleRegionChange}
                            options={useMemo(() => (regions || []).map(r => ({ value: r, label: r })), [regions])}
                            placeholder="Region"
                            classNamePrefix="select"
                        />
                    </div>
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

                        <Suspense fallback={<div className="my-10 flex justify-center"><Oval color="#00BFFF" height={50} width={50} /></div>}>
                            <ObservationsChart
                                observations={filteredObservations}
                                title={selectedDataset ? selectedDataset.label : ''}
                                license={selectedDataset ? selectedDataset.license : ''}
                                original_url={selectedDataset ? selectedDataset.original_url : ''}
                                published_date={selectedDataset ? selectedDataset.published_date : ''}
                                dataset_description={selectedDataset ? selectedDataset.dataset_description : ''}
                                owner={selectedDataset ? selectedDataset.owner : ''}
                                globalbackgroundColor={globalbackgroundColor}
                                baselineLabel={baselineLabel}
                            />
                        </Suspense>

                        <Suspense fallback={<div className="my-10 flex justify-center"><Oval color="#00BFFF" height={50} width={50} /></div>}>
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
                        </Suspense>

                        {hasMultipleUniqueNames(filteredObservations) && (
                            <Suspense fallback={<div className="my-10 flex justify-center"><Oval color="#00BFFF" height={50} width={50} /></div>}>
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
                            </Suspense>
                        )}
                    </>
                )}
            </div>
        </Suspense>
    );
}

export default Dashboard;
