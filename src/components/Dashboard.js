import React, { useState, useEffect, lazy, Suspense } from 'react';


import ObservationsChart from './ObservationsChart';
import supabase from '../supabaseClient';

import MultiObservationsChart from './MultiObservationsChart';
import localForage from 'localforage';

const ObservationsTable = React.lazy(() =>import('./ObservationsTable'));
const LocalAuthorityMap = React.lazy(() =>import('./Map'));

localForage.config({
    name: 'localneedsdatabank',
    storeName: 'dashboardData',
    description: 'Used to cache dashboard data and observations locally'
});

function Dashboard({ dashboardId, defaultChartType }) {
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
    
            // Attempt to load datasets from cache
            const cachedDatasets = await localForage.getItem(`datasets-${dashboardId}`);
            if (cachedDatasets) {
                setDatasets(cachedDatasets);
                if (cachedDatasets.length > 0) {
                    setSelectedDataset(cachedDatasets[0]);  // Set react-select option
                    fetchObservations(cachedDatasets[0].value);
                }
            } else {
                // Fetch datasets from Supabase if not in cache
                const { data: datasetsData, error: datasetsError } = await supabase
                    .from('dashboard_datasets')
                    .select('dashboard_id, datasets:dataset_id (id, title, original_url, published_date, owner, dataset_description, license )')
                    .eq('dashboard_id', dashboardId);
    
                if (datasetsError) {
                    console.error('Error fetching datasets', datasetsError);
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
                localForage.setItem(`datasets-${dashboardId}`, options);  // Cache the data
    
                if (options.length > 0) {
                    setSelectedDataset(options[0]);  // Set react-select option
                    fetchObservations(options[0].value);
                }
            }
    
            // Regions may not need caching if they don't change often, but you can cache them similarly if needed
            const { data: regionsData, error: regionsError } = await supabase
                .from('observations')
                .select('region', { distinct: true });
    
            if (regionsError) {
                console.error('Error fetching regions', regionsError);
            } else {
                setRegions(['All', ...new Set(regionsData.map(r => r.region))]);
            }
    
            setLoading(false);
        }
    
        fetchData();
    }, [dashboardId]);
    

    const fetchObservations = async (datasetId) => {
        if (!datasetId) return;
    
        const cachedObservations = await localForage.getItem(`observations-${datasetId}`);
        if (cachedObservations) {
            setObservations(cachedObservations);
            setFilteredObservations(cachedObservations);
        } else {
            // Fetch observations from Supabase if not in cache
            let query = supabase.from('observations').select('*').eq('dataset_id', datasetId);
            if (selectedRegion !== 'All') {
                query = query.eq('region', selectedRegion);
            }
    
            const { data, error } = await query;
    
            if (error) {
                console.error('Error fetching observations', error);
                return;
            }
    
            setObservations(data);
            setFilteredObservations(data);
            localForage.setItem(`observations-${datasetId}`, data);  // Cache the data
        }
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
        if (typeof setIsTableVisible !== 'function') {
          console.error("setState function 'setIsTableVisible' is not available.");
          return;
        }
      
        if (typeof isTableVisible !== 'boolean') {
          console.error("Invalid state: 'isTableVisible' is not a boolean.");
          return;
        }
      
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
                <div className="flex-grow md:flex md:flex-grow">
                    
                </div>
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
                  />
                  
              </>
          )}
          <LocalAuthorityMap
                        selectedDataset={selectedDataset}
                        filteredObservations={filteredObservations}
                        title={selectedDataset ? selectedDataset.label : ''}
                        license={selectedDataset ? selectedDataset.license : ''}
                          original_url={selectedDataset ? selectedDataset.original_url : ''}
                          published_date={selectedDataset ? selectedDataset.published_date : ''}
                          dataset_description={selectedDataset ? selectedDataset.dataset_description : ''}
                          owner={selectedDataset ? selectedDataset.owner : ''}
                    />
            {
          hasMultipleUniqueNames(filteredObservations) && (
            <MultiObservationsChart
              observations={filteredObservations}
              title={selectedDataset ? selectedDataset.label : ''}
              license={selectedDataset ? selectedDataset.license : ''}
              original_url={selectedDataset ? selectedDataset.original_url : ''}
              published_date={selectedDataset ? selectedDataset.published_date : ''}
              dataset_description={selectedDataset ? selectedDataset.dataset_description : ''}
              owner={selectedDataset ? selectedDataset.owner : ''}
              defaultChartType={defaultChartType}
            />
          )
        }
            
      </div>
      </Suspense>
  );
  
}

export default Dashboard;
