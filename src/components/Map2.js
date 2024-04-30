import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import supabase from '../supabaseClient';
import localForage from 'localforage';

const Map2 = ({ selectedDataset, filteredObservations = [] }) => {
    const [geoData, setGeoData] = useState(null);
    const [filteredGeoData, setFilteredGeoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [map, setMap] = useState(null);

    // Function to fetch and cache geo data
    useEffect(() => {
        async function fetchGeoJsonData() {
            const datasetId = selectedDataset && selectedDataset.value;
            if (datasetId) {
                setLoading(true);
                const cacheKey = `geojson-${datasetId}`;

                // Check cache first
                const cachedData = await localForage.getItem(cacheKey);
                if (cachedData) {
                    setGeoData(cachedData);
                    setLoading(false);
                    return;
                }

                try {
                    const { data, error } = await supabase.rpc('get_features_geojson', { p_dataset_id: datasetId });
                    if (error) {
                        console.error('Error fetching geo data:', error);
                        setGeoData([]);
                        setLoading(false);
                        return;
                    }
                    setGeoData(data);
                    
                    // Save to cache
                    await localForage.setItem(cacheKey, data);
                } catch (error) {
                    console.error('Error fetching GeoJSON:', error);
                    setGeoData([]);
                }
                setLoading(false);
            }
        }

        fetchGeoJsonData();
    }, [selectedDataset]);

    // Filter GeoJSON data based on filteredObservations
    useEffect(() => {
        if (geoData && geoData.features && filteredObservations.length > 0) {
            const filteredFeatures = geoData.features.filter(feature =>
                filteredObservations.some(obs => obs.place === feature.properties.lad22nm)
            );
            setFilteredGeoData({ ...geoData, features: filteredFeatures });
        } else {
            setFilteredGeoData(geoData); // Set the unfiltered data if no filter is provided or observations are empty
        }
    }, [geoData, filteredObservations]);

    // Function to handle layer settings
    const onEachFeature = (feature, layer) => {
        if (feature.properties && feature.properties.observations) {
            let popupContent = `<h3>${feature.properties.lad22nm}</h3>`;
            feature.properties.observations.forEach(obs => {
                if (Array.isArray(filteredObservations) && filteredObservations.includes(obs.place)) {
                    popupContent += `<p>${obs.place}: ${obs.value}</p>`;
                }
            });
            layer.bindPopup(popupContent);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <MapContainer center={[50.85, -0.29]} zoom={12} whenCreated={setMap} style={{ height: '500px', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {filteredGeoData && <GeoJSON data={filteredGeoData} onEachFeature={onEachFeature} />}
        </MapContainer>
    );
};

export default Map2;
