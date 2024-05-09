import React, { useState, useEffect } from 'react';
import ObservationsTable from './ObservationsTable';
import ObservationsChart from './ObservationsChart';
import supabase from '../supabaseClient';
import Select from 'react-select';
import LocalAuthorityMap from './Map'; // Ensure you import your map component
import MultiObservationsChart from './MultiObservationsChart';
import TimeObservationsChart from './TimeObservationsChart';
import CategoryObservationChart from './CategoryChart';

function CategoryChartDashboard({ dashboardId }) {
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
                owner: dd.datasets.owner,
               

            }));

            setDatasets(options);

            if (options.length > 0) {
                setSelectedDataset(options[0]);  // Set react-select option
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

  // Start building the query
  let query = supabase.from('observations').select('*').eq('dataset_id', datasetId);
  

  // If a specific region is selected, add that to the query
  if (selectedRegion !== 'All') {
      query = query.eq('region', selectedRegion);
  }

  // Execute the query and handle the response
  const { data, error } = await query;
  

  // Handle any errors during the fetch operation
  if (error) {
      console.error('Error fetching observations', error);
      return;
  }

  // Update state with the fetched data
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
            
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex-grow md:flex md:flex-grow">
                    {/* Placeholder for additional content or spacing */}
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
                  
                  <CategoryObservationChart
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
          

            
      </div>
  );
  
}

export default CategoryChartDashboard;
