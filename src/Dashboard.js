import React, { useState, useEffect } from 'react';
import ObservationsTable from './ObservationsTable';
import ObservationsChart from './ObservationsChart';
import supabase from './supabaseClient';

function Dashboard({ dashboardId }) {
  const [datasets, setDatasets] = useState([]);
  const [observations, setObservations] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [loading, setLoading] = useState(true);
  const [filteredObservations, setFilteredObservations] = useState([]);


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
        return;
      }

      setDatasets(datasetsData.map(dd => dd.datasets));

      // Fetch observations for the first dataset initially or based on user action
      fetchObservations(datasetsData[0]?.dataset?.id);

      setLoading(false);
    }

    fetchData();
  }, [dashboardId]);

  const fetchObservations = async (datasetId) => {
    if (!datasetId) return;

    const { data: observationsData, error: observationsError } = await supabase
      .from('observations')
      .select('*')
      .eq('dataset_id', datasetId);

    if (observationsError) {
      console.error('Error fetching observations', observationsError);
    } else {
      setObservations(observationsData);
    }
  };

  const handleDatasetChange = (e) => {
    const datasetId = e.target.value;
    setSelectedDatasetId(datasetId);
    fetchObservations(datasetId);
  };

  return (
    <div className="dashboard">
      <h1>Dashboard Overview</h1>
      <select value={selectedDatasetId || ''} onChange={handleDatasetChange}>
        <option value="">Select a Dataset</option>
        {datasets.map(dataset => (
          <option key={dataset.id} value={dataset.id}>{dataset.title}</option>
        ))}
      </select>
      {loading ? (
        <p>Loading...</p>
      ) : (
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
