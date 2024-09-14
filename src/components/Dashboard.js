import React, { useState, useEffect, lazy, Suspense } from 'react';
import ObservationsChart from './ObservationsChart';
import supabase from '../supabaseClient';
import MultiObservationsChart from './MultiObservationsChart';

const ObservationsTable = React.lazy(() => import('./ObservationsTable'));
const LocalAuthorityMap = React.lazy(() => import('./Map'));
const LocalAuthorityMap23 = React.lazy(() => import('./Map23'));

function Dashboard({ dashboardId, defaultChartType, startColor, endColor, globalbackgroundColor }) {
    const [datasets, setDatasets] = useState([]);
    const [observations, setObservations] = useState([]);
    const [filteredObservations, setFilteredObservations] = useState([]);
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('All');
    const [selectedDataset, setSelectedDataset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTableVisible, setIsTableVisible] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            // Fetch datasets directly from Supabase
            const { data: datasetsData, error: datasetsError } = await supabase
                .from('dashboard_datasets')
                .select('dashboard_id, datasets:dataset_id (id, title, original_url, published_date, owner, dataset_description, license )')
                .eq('dashboard_id', dashboardId);

            if (datasetsError) {
                setLoading(false);
                return;
            }

            const options = datasetsData.map(dd => ({
                value: dd.datasets.id,
                label: dd.datasets.title,
                original_url: dd.datasets.original_url,
                dataset_description: dd.datasets.dataset_description,
                license: dd.datasets.license,
                published_date: dd.datasets.published_date,
                owner: dd.datasets.owner
            }));

            setDatasets(options);

            if (options.length > 0) {
                setSelectedDataset(options[0]);
                fetchObservations(options[0].value);
            }

            // Fetch regions from Supabase
            const { data: regionsData, error: regionsError } = await supabase
                .from('observations')
                .select('region', { distinct: true });

            if (!regionsError) {
                setRegions(['All', ...new Set(regionsData.map(r => r.region))]);
            }

            setLoading(false);
        }

        fetchData();
    }, [dashboardId]);

    const fetchObservations = async (datasetId) => {
        if (!datasetId) return;

        // Fetch observations directly from Supabase
        let query = supabase.from('observations').select('*').eq('dataset_id', datasetId);
        if (selectedRegion !== 'All') {
            query = query.eq('region', selectedRegion);
        }

        const { data, error } = await query;

        if (error) {
            return;
        }

        setObservations(data);
        setFilteredObservations(data);
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
        if (typeof setIsTableVisible !== 'function') return;
        if (typeof isTableVisible !== 'boolean') return;
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
                </div>
                {loading ? <p className="text-center">Loading...</p> : (
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
