import React, { useState, useEffect } from 'react';
import ObservationsTable from './ObservationsTable';

import supabase from '../supabaseClient';


import TimeObservationsChart from './TimeObservationsChart';

function TimeSeriesDashboard({ dashboardId, defaultChartType, globalbackgroundColor, passDatasetMetadata }) {
    const [datasets, setDatasets] = useState([]);
    const [observations, setObservations] = useState([]);
    const [filteredObservations, setFilteredObservations] = useState([]);
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('All');
    const [selectedDataset, setSelectedDataset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTableVisible, setIsTableVisible] = useState(true);
    const [metadataPassed, setMetadataPassed] = useState(false);


    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            const { data: datasetsData, error: datasetsError } = await supabase
                .from('dashboard_datasets')
                .select('dashboard_id, datasets:dataset_id (id, title, original_url, published_date, owner, dataset_description, license)')
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
                owner: dd.datasets.owner,
            }));
            

            setDatasets(options);

            if (!metadataPassed && passDatasetMetadata) {
                passDatasetMetadata(options);
                setMetadataPassed(true); // Ensure we only pass metadata once
            }

            if (options.length > 0) {
                setSelectedDataset(options[0]); 
                fetchObservations(options[0].value);
            }

            const { data: regionsData, error: regionsError } = await supabase
                .from('observations')
                .select('region', { distinct: true });

            if (regionsError) {
                
            } else {
                setRegions(['All', ...new Set(regionsData.map(r => r.region))]);
            }

            setLoading(false);
        }


 if (!metadataPassed) {
            fetchData();
        }
    }, [dashboardId, metadataPassed, passDatasetMetadata]);

    // Function to fetch observations based on the dataset ID
const fetchObservations = async (datasetId) => {
  if (!datasetId) return; // Check to ensure a dataset ID is provided

  
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
        if (typeof setIsTableVisible !== 'function') {
          
          return;
        }
      
        if (typeof isTableVisible !== 'boolean') {
          
          return;
        }
      
        setIsTableVisible(!isTableVisible);
      };
      
    

      return (
        <div className="bg-slate-50 p-3 md:p-5 m-3 md:m-5">
           
            <div className="flex justify-end items-center md:mb-4">
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
                </>
            )}
            <TimeObservationsChart
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
        </div>
    );
    
  
}

export default TimeSeriesDashboard;
