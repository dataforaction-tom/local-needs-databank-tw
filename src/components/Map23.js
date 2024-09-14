import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import supabase from '../supabaseClient';
import L from 'leaflet';
import chroma from 'chroma-js';
import * as d3 from 'd3';

// Helper function to calculate color based on the value
function getColor(value, classes, colorScale) {
    for (let i = 0; i < classes.length - 1; i++) {
        if (value >= classes[i] && value < classes[i + 1]) {
            const midPoint = classes[i] + (classes[i + 1] - classes[i]) / 2;
            return colorScale(midPoint).hex();
        }
    }
    return colorScale(classes[classes.length - 1]).hex();
}

// Legend component for color scale
function Legend({ colorScale, breaks }) {
    const map = useMap();

    useEffect(() => {
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.padding = '6px 8px';
            div.style.background = 'rgba(255,255,255,0.8)';
            div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
            div.style.borderRadius = '5px';
            div.style.fontSize = '14px';

            // Generate legend items based on the breaks
            for (let i = 0; i < breaks.length - 1; i++) {
                const from = breaks[i];
                const to = breaks[i + 1];
                const color = colorScale((from + to) / 2).hex();

                div.innerHTML += `<i style="background: ${color}; width: 18px; height: 18px; display: inline-block; margin-right: 5px;"></i> ${from}&ndash;${to}<br>`;
            }

            return div;
        };

        legend.addTo(map);

        return () => {
            map.removeControl(legend);
        };
    }, [map, colorScale, breaks]);

    return null;
}

// Main map component
function LocalAuthorityMap23({ selectedDataset, filteredObservations, title, startColor = 'pink', endColor = '#662583' }) {
    const [geoJsonData, setGeoJsonData] = useState([]);
    const [filteredGeoJsonFeatures, setFilteredGeoJsonFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [map, setMap] = useState(null);

    // Function to recalculate color scale and breaks based on filtered observations
    const getColorScaleAndBreaks = (observations) => {
        if (observations.length === 0) return { colorScale: chroma.scale([startColor, endColor]), breaks: [] };

        const values = observations.map(obs => obs.value);
        const min = Math.min(...values);
        const max = Math.max(...values);

        // Use D3.js to generate exactly 10 human-readable breaks
        const breaks = d3.ticks(min, max, 10);

        const colorScale = chroma.scale([startColor, endColor]).domain(breaks);

        return { colorScale, breaks };
    };

    // Fetch GeoJSON data from Supabase using RPC
    useEffect(() => {
        const fetchGeoJsonData = async () => {
            const datasetId = selectedDataset && selectedDataset.value;
            const limit = 100;  // Number of results per page
            let offset = 0;  // Initial offset
            let hasMoreData = true;
            let allData = [];
    
            if (datasetId) {
                setLoading(true);
                console.log(`Fetching GeoJSON data for dataset ID: ${datasetId}`);
    
                while (hasMoreData) {
                    try {
                        const response = await supabase.rpc('build_map', {
                            p_dataset_id: parseInt(datasetId, 10),
                            p_limit: limit,
                            p_offset: offset
                        });
    
                        if (!response.error && response.data.length > 0) {
                            allData = [...allData, ...response.data];
                            offset += limit;  // Move to the next batch
                        } else {
                            hasMoreData = false;  // Stop fetching if no data is returned
                        }
                    } catch (error) {
                        console.error('Error during RPC call:', error);
                        hasMoreData = false;  // Stop fetching if there is an error
                    }
                }
    
                setGeoJsonData(allData);
                setFilteredGeoJsonFeatures(allData);
                setLoading(false);
            } else {
                console.log('No dataset selected');
            }
        };
    
        fetchGeoJsonData();
    }, [selectedDataset]);
    

    // Filter geoJsonData based on filteredObservations
    useEffect(() => {
        if (geoJsonData.length > 0) {
            const features = geoJsonData.filter(feature =>
                filteredObservations.some(obs => obs.place_code === feature.properties.name)
            );
            setFilteredGeoJsonFeatures(features);
        }
    }, [filteredObservations, geoJsonData]);

    // Add GeoJSON layers when data is ready
    useEffect(() => {
        if (map && filteredGeoJsonFeatures.length > 0) {
            const geoJsonLayer = L.geoJSON(filteredGeoJsonFeatures, {
                onEachFeature: (feature, layer) => onEachFeature(feature, layer, filteredObservations, getColorScaleAndBreaks(filteredObservations).colorScale)
            }).addTo(map);
            const bounds = geoJsonLayer.getBounds();
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (map) {
            map.setView([54.5, -2], 6);
        }
    }, [filteredGeoJsonFeatures, map]);

    // Function to bind pop-ups and styles to each feature
    function onEachFeature(feature, layer, filteredObservations, colorScale) {
        const placeCode = feature.properties.name;  // Match place_code to the correct property in GeoJSON
        const matchingObservations = filteredObservations.filter(obs => obs.place_code === placeCode);

        const maxValue = matchingObservations.reduce((max, obs) => Math.max(max, obs.value), 0);

        layer.setStyle({
            fillColor: colorScale(maxValue).hex(),
            fillOpacity: 0.8,
            color: 'white',
            weight: 1
        });

        // Build popup content dynamically based on matched observations
        let popupContent = `<div><strong>Name:</strong> ${feature.properties.place_name || placeCode}</div>`;
        if (matchingObservations.length > 0) {
            popupContent += `<div><strong>Observations:</strong><ul>`;
            matchingObservations.forEach(obs => {
                popupContent += `<li>${obs.name} (${obs.year}): ${obs.value}</li>`;
            });
            popupContent += `</ul></div>`;
        } else {
            popupContent += `<div>No observations available.</div>`;
        }

        layer.bindPopup(popupContent);
    }

    // Function to render GeoJSON layer
    const renderGeoJsonLayer = () => {
        const { colorScale, breaks } = getColorScaleAndBreaks(filteredObservations);

        return (
            <>
                <GeoJSON
                    data={filteredGeoJsonFeatures}
                    onEachFeature={(feature, layer) => onEachFeature(feature, layer, filteredObservations, colorScale)}
                    style={(feature) => ({
                        color: 'white',
                        fillColor: colorScale(feature.properties.observations.reduce((max, obs) => Math.max(max, obs.value), 0)).hex(),
                        weight: 2,
                        fillOpacity: 0.9
                    })}
                />
                <Legend colorScale={colorScale} breaks={breaks} />
            </>
        );
    };

    return (
        <div>
            <h2 className='text-2xl font-bold text-center mt-10'>{title || 'Observation Charts'}</h2>
            <MapContainer
                center={[54.5, -2]}
                zoom={7}
                style={{ height: '600px', width: '100%' }}
                whenCreated={setMap}
            >
                <TileLayer
                    url="https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG9tY3ciLCJhIjoiY2x2OGxyZGw3MGl4ajJqanp0aTd6NmhtciJ9.RAPKYGC_Y5TVueF5TNoPeg"
                    attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {filteredGeoJsonFeatures.length > 0 && renderGeoJsonLayer()}
            </MapContainer>
        </div>
    );
}

export default LocalAuthorityMap23;
