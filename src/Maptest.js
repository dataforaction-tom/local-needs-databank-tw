import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import supabase from './supabaseClient';
import L from 'leaflet'; // Make sure Leaflet is imported to use its utilities

function LocalAuthorityMap({ selectedDataset, filteredObservations }) {
    const [geoJsonData, setGeoJsonData] = useState([]);
    const [filteredGeoJsonFeatures, setFilteredGeoJsonFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [map, setMap] = useState(null);  // State to hold the map instance

    // Fetch GeoJSON data once on dataset selection
    useEffect(() => {
        const fetchGeoJsonData = async () => {
            if (selectedDataset && selectedDataset.value) {
                setLoading(true);
                try {
                    console.log("Fetching GeoJSON data for dataset:", selectedDataset.value);
                    const response = await supabase.rpc('get_enriched_geojson_data', { p_dataset_id: parseInt(selectedDataset.value, 10) });
                    if (response.error) {
                        console.error('Error fetching enriched GeoJSON:', response.error.message);
                        setGeoJsonData([]);
                    } else if (response.data) {
                        console.log("Initial GeoJSON data fetched:", response.data);
                        setGeoJsonData(response.data);
                        setFilteredGeoJsonFeatures(response.data);
                    }
                } catch (error) {
                    console.error('Error fetching GeoJSON:', error.message);
                    setGeoJsonData([]);
                }
                setLoading(false);
            }
        };

        fetchGeoJsonData();
    }, [selectedDataset]);

    // Filter GeoJSON features client-side based on filteredObservations
    useEffect(() => {
        console.log("Applying filters with filteredObservations:", filteredObservations);
        if (geoJsonData.length > 0) {
            const features = geoJsonData.filter(feature =>
                filteredObservations.some(obs => obs.place === feature.properties.name)
            );
            console.log("Filtered GeoJSON features:", features);
            setFilteredGeoJsonFeatures(features);
        }
    }, [filteredObservations, geoJsonData]);

   // Use effect to adjust the map bounds based on filtered features
   useEffect(() => {
    if (map && filteredGeoJsonFeatures.length > 0) {
        const geoJsonLayer = L.geoJSON(filteredGeoJsonFeatures, {
            onEachFeature: onEachFeature  // Apply the onEachFeature function
        });
        const bounds = geoJsonLayer.getBounds();
        map.fitBounds(bounds, { padding: [50, 50] }); // Adjust map view to feature bounds
    } else if (map) {
        map.setView([54.5, -2], 6); // Default view if no features
    }
}, [filteredGeoJsonFeatures, map]);

    const onEachFeature = (feature, layer) => {
        if (feature.properties && feature.properties.name) {
            let popupContent = `<div><strong>Name:</strong> ${feature.properties.name}</div>`;
            if (feature.properties.observations && feature.properties.observations.length > 0) {
                popupContent += `<div><strong>Observations:</strong><ul>`;
                feature.properties.observations.forEach(obs => {
                    popupContent += `<li>${obs.name}: ${obs.value} on ${obs.date}</li>`;
                });
                popupContent += `</ul></div>`;
            } else {
                popupContent += `<div>No observations available.</div>`;
            }
            layer.bindPopup(popupContent);
        }
    };

    if (loading) {
        return <div>Loading map...</div>;
    }

    return (
      <MapContainer
          center={[54.5, -2]}
          zoom={6}
          style={{ height: '600px', width: '100%' }}
          whenCreated={setMap}  // Capture map instance
          key={filteredGeoJsonFeatures.length}  // Key to force re-render on data change
      >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <GeoJSON data={filteredGeoJsonFeatures} onEachFeature={onEachFeature} />
      </MapContainer>
  );
}

export default LocalAuthorityMap;
