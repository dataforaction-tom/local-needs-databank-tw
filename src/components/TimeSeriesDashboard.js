import React, { useState, useEffect } from 'react';
import ObservationsTable from './ObservationsTable';
import ObservationsChart from './ObservationsChart';
import supabase from '../supabaseClient';
import Select from 'react-select';
import LocalAuthorityMap from './Map'; 
import MultiObservationsChart from './MultiObservationsChart';
import TimeObservationsChart from './TimeObservationsChart';

function TimeSeriesDashboard({ dashboardId }) {
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

            const { data: datasetsData, error: datasetsError } = await supabase
                .from('dashboard_datasets')
                .select('dashboard_id, datasets:dataset_id (id, title)')
                .eq('dashboard_id', dashboardId);

            if (datasetsError) {
                console.error('Error fetching datasets', datasetsError);
                setLoading(false);
                return;
            }

            const options = datasetsData.map(dd => ({
                value: dd.datasets.id,
                label: dd.datasets.title
            }));

            setDatasets(options);

            if (options.length > 0) {
                setSelectedDataset(options[0]); 
                fetchObservations(options[0].value);
            }

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

    // Function to fetch observations based on the dataset ID
const fetchObservations = async (datasetId) => {
  if (!datasetId) return; // Check to ensure a dataset ID is provided

  
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
      
    

      return (
        <div className="bg-slate-50 p-3 md:p-5 m-3 md:m-5">
            <h3 className='text-base md:text-lg font-bold px-3 md:px-5'>Select your dataset from here. You can explore this in the table, chart(s) and map below</h3>
            <Select
                value={selectedDataset}
                onChange={handleDatasetChange}
                options={datasets}
                placeholder="Select a Dataset"
                isClearable
                isSearchable
                className='w-full md:w-1/3 px-3 md:px-5 mb-2 md:mb-4'
            />
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
                      />
                  )}
                </>
            )}
            <TimeObservationsChart
                observations={filteredObservations}
                title={selectedDataset ? selectedDataset.label : ''}
            />
        </div>
    );
    
  
}

export default TimeSeriesDashboard;