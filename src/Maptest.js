import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import supabase from './supabaseClient';
import L from 'leaflet';
import chroma from 'chroma-js';

function LocalAuthorityMap({ selectedDataset, filteredObservations }) {
    const [geoJsonData, setGeoJsonData] = useState([]);
    const [filteredGeoJsonFeatures, setFilteredGeoJsonFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [map, setMap] = useState(null);

    // Function to create a color scale based on the data
    const getColorScale = (data) => {
        const values = data.flatMap(feature =>
            feature.properties.observations.map(obs => obs.value)
        );
        const min = Math.min(...values);
        const max = Math.max(...values);
        return chroma.scale(['pink', '#662583']).domain([min, max]);
    };

    useEffect(() => {
        const fetchGeoJsonData = async () => {
            if (selectedDataset && selectedDataset.value) {
                setLoading(true);
                try {
                    const response = await supabase.rpc('get_enriched_geojson_data', { p_dataset_id: parseInt(selectedDataset.value, 10) });
                    if (!response.error && response.data) {
                        setGeoJsonData(response.data);
                        setFilteredGeoJsonFeatures(response.data);
                    } else {
                        setGeoJsonData([]);
                    }
                } catch (error) {
                    console.error('Error fetching GeoJSON:', error);
                    setGeoJsonData([]);
                }
                setLoading(false);
            }
        };

        fetchGeoJsonData();
    }, [selectedDataset]);

    useEffect(() => {
        if (geoJsonData.length > 0) {
            const features = geoJsonData.filter(feature =>
                filteredObservations.some(obs => obs.place === feature.properties.name)
            );
            setFilteredGeoJsonFeatures(features);
        }
    }, [filteredObservations, geoJsonData]);

    useEffect(() => {
        if (map && filteredGeoJsonFeatures.length > 0) {
            const geoJsonLayer = L.geoJSON(filteredGeoJsonFeatures);
            const bounds = geoJsonLayer.getBounds();
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (map) {
            map.setView([54.5, -2], 6);
        }
    }, [filteredGeoJsonFeatures, map]);

    const onEachFeature = (feature, layer, colorScale) => {
        let maxValue = feature.properties.observations.reduce((max, obs) => Math.max(max, obs.value), 0);
        layer.setStyle({
            fillColor: colorScale(maxValue).hex(),
            fillOpacity: 0.9,
            color: 'white',
            weight: 1
        });

        let popupContent = `<div><strong>Name:</strong> ${feature.properties.name}</div>`;
        if (feature.properties.observations.length > 0) {
            popupContent += `<div><strong>Observations:</strong><ul>`;
            feature.properties.observations.forEach(obs => {
                popupContent += `<li>${obs.name}: ${obs.value} on ${obs.date}</li>`;
            });
            popupContent += `</ul></div>`;
        } else {
            popupContent += `<div>No observations available.</div>`;
        }
        layer.bindPopup(popupContent);
    };

    const renderGeoJsonLayer = () => {
        const colorScale = getColorScale(filteredGeoJsonFeatures);
        return (
            <GeoJSON
                data={filteredGeoJsonFeatures}
                onEachFeature={(feature, layer) => onEachFeature(feature, layer, colorScale)}
                style={(feature) => ({
                    color: 'white',
                    fillColor: colorScale(feature.properties.observations.reduce((max, obs) => Math.max(max, obs.value), 0)).hex(),
                    weight: 2,
                    fillOpacity: 0.9
                })}
            />
        );
    };

    if (loading) {
        return <div>Loading map...</div>;
    }

    return (
        <MapContainer
            center={[54.5, -2]}
            zoom={7}
            style={{ height: '600px', width: '50%' }}
            whenCreated={setMap}
            key={filteredGeoJsonFeatures.length}
        >
            <TileLayer
            url="https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG9tY3ciLCJhIjoiY2x2OGxyZGw3MGl4ajJqanp0aTd6NmhtciJ9.RAPKYGC_Y5TVueF5TNoPeg"
                attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                ></TileLayer>
            {renderGeoJsonLayer()}
        </MapContainer>
    );
}

export default LocalAuthorityMap;
