import React, { useState, useEffect } from 'react';
import ObservationsTable from './ObservationsTable';
import ObservationsChart from './ObservationsChart';
import supabase from './supabaseClient';

function Dashboard({ dashboardId }) {
    const [datasets, setDatasets] = useState([]);
    const [observations, setObservations] = useState([]);
    const [filteredObservations, setFilteredObservations] = useState([]);
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('All');
    const [selectedDatasetId, setSelectedDatasetId] = useState('');
    const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch datasets associated with the dashboard
      const { data: datasetsData, error: datasetsError } = await supabase
        .from('dashboard_datasets')
        .select(`
          dashboard_id,
          datasets:dataset_id (id, title)
        `)
        .eq('dashboard_id', dashboardId);
        console.log(datasetsData);

      if (datasetsError) {
        console.error('Error fetching datasets', datasetsError);
        setLoading(false);
        return;
      }

      setDatasets(datasetsData.map(dd => dd.datasets));
      setSelectedDatasetId(datasetsData[0]?.dataset?.id);  // Automatically select the first dataset

           // Fetch unique regions
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

     useEffect(() => {
        fetchObservations(selectedDatasetId);
      }, [selectedDatasetId, selectedRegion]);

      const fetchObservations = async (datasetId) => {
        if (!datasetId) return;
    
        let query = supabase.from('observations').select('*').eq('dataset_id', datasetId);
        if (selectedRegion !== 'All') {
          query = query.eq('region', selectedRegion);
        }
        console.log(query);
        const { data, error } = await query;
        console.log('observation data',data);
        if (error) {
          console.error('Error fetching observations', error);
        } else {
          setObservations(data);
          setFilteredObservations(data); // Initially set filtered data as all data
        }
      };
    
      const handleDatasetChange = (e) => {
        setSelectedDatasetId(e.target.value);
      };
    
      const handleRegionChange = (e) => {
        setSelectedRegion(e.target.value);
      };

  return (
    <div className="dashboard">
      <h1>Dashboard Overview</h1>
      <select value={selectedRegion} onChange={handleRegionChange}>
        {regions.map(region => (
          <option key={region} value={region}>{region}</option>
        ))}
      </select>
      <select value={selectedDatasetId || ''} onChange={handleDatasetChange}>
        <option value="">Select a Dataset</option>
        {datasets.map(dataset => (
          <option key={dataset.id} value={dataset.id}>{dataset.title}</option>
        ))}
      </select>
      {loading ? <p>Loading...</p> : (
        <>
          <ObservationsTable
            observations={observations}
            setFilteredObservations={setFilteredObservations}
          />
          <ObservationsChart observations={filteredObservations} />
        </>
      )}
    </div>
  );
}

export default Dashboard;
