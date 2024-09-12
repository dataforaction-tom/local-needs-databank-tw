import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import supabase from '../supabaseClient';
import L from 'leaflet';
import chroma from 'chroma-js';

function getColor(value, classes, colorScale) {
    for (let i = 0; i < classes.length - 1; i++) {
        if (value >= classes[i] && value < classes[i + 1]) {
            const midPoint = classes[i] + (classes[i + 1] - classes[i]) / 2;
            return colorScale(midPoint).hex();
        }
    }
    return colorScale(classes[classes.length - 1]).hex();
}

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

        // Ensure breaks are recalculated based on the min/max of filtered observations
        const roundedMin = Math.floor(min / 10) * 10;
        const roundedMax = Math.ceil(max / 10) * 10;
        const step = (roundedMax - roundedMin) / 10;
        const breaks = Array.from({ length: 11 }, (_, i) => roundedMin + i * step);

        const colorScale = chroma.scale([startColor, endColor]).domain(breaks);

        return { colorScale, breaks };
    };

    useEffect(() => {
        const fetchGeoJsonData = async () => {
            const datasetId = selectedDataset && selectedDataset.value;
            if (datasetId) {
                setLoading(true);
                console.log(`Fetching GeoJSON data for dataset ID: ${datasetId}`);

                try {
                    const response = await supabase.rpc('build_map', { p_dataset_id: parseInt(datasetId, 10) });
                    if (!response.error && response.data) {
                        setGeoJsonData(response.data);
                        setFilteredGeoJsonFeatures(response.data);
                    } else {
                        console.error('RPC error or no data returned:', response.error);
                        setGeoJsonData([]);
                        setFilteredGeoJsonFeatures([]);
                    }
                } catch (error) {
                    console.error('Error during RPC call:', error);
                    setGeoJsonData([]);
                    setFilteredGeoJsonFeatures([]);
                }

                setLoading(false);
            } else {
                console.log('No dataset selected');
            }
        };

        fetchGeoJsonData();
    }, [selectedDataset]);

    useEffect(() => {
        if (geoJsonData.length > 0) {
            const features = geoJsonData.filter(feature =>
                filteredObservations.some(obs => obs.place_code === feature.properties.name)
            );
            setFilteredGeoJsonFeatures(features);
        }
    }, [filteredObservations, geoJsonData]);

    useEffect(() => {
        if (map && filteredGeoJsonFeatures.length > 0) {
            const geoJsonLayer = L.geoJSON(filteredGeoJsonFeatures, {
                onEachFeature: (feature, layer) => onEachFeature(feature, layer)
            }).addTo(map);
            const bounds = geoJsonLayer.getBounds();
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (map) {
            map.setView([54.5, -2], 6);
        }
    }, [filteredGeoJsonFeatures, map]);

    function onEachFeature(feature, layer, filteredObservations, colorScale) {
        // Get the place code from the feature
        const placeCode = feature.properties.name;
    
        // Find matching observations in filteredObservations
        const matchingObservations = filteredObservations.filter(obs => obs.place_code === placeCode);
    
        // Get the maximum observation value for the filtered observations
        const maxValue = matchingObservations.reduce((max, obs) => Math.max(max, obs.value), 0);
    
        // Set the style for the feature based on the maximum value
        layer.setStyle({
            fillColor: colorScale(maxValue).hex(),
            fillOpacity: 0.8,
            color: 'white',
            weight: 1
        });
    
        // Create popup content, only displaying observations from filteredObservations
        let popupContent = `<div><strong>Name:</strong> ${feature.properties.place_name}</div>`;
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
    

    const renderGeoJsonLayer = () => {
        const { colorScale, breaks } = getColorScaleAndBreaks(filteredObservations); // Dynamically calculate color scale and breaks
    
        return (
            <>
                <GeoJSON
                    data={filteredGeoJsonFeatures}
                    onEachFeature={(feature, layer) => onEachFeature(feature, layer, filteredObservations, colorScale)} // Pass filteredObservations here
                    style={(feature) => ({
                        color: 'white',
                        fillColor: colorScale(feature.properties.observations.reduce((max, obs) => Math.max(max, obs.value), 0)).hex(),
                        weight: 2,
                        fillOpacity: 0.9
                    })}
                />
                <Legend colorScale={colorScale} breaks={breaks} /> {/* Pass dynamically calculated values to legend */}
            </>
        );
    };
    

    if (loading) {
        return <div></div>;
    }

    if (geoJsonData.length > 0 && filteredGeoJsonFeatures.length > 0) {
        return (
            <div>
                <h2 className='text-2xl font-bold text-center mt-10'>{title || 'Observation Charts'}</h2>
                <MapContainer
                    center={[54.5, -2]}
                    zoom={7}
                    style={{ height: '600px', width: '100%' }}
                    whenCreated={setMap}
                    key={filteredGeoJsonFeatures.length}
                >
                    <TileLayer
                        url="https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG9tY3ciLCJhIjoiY2x2OGxyZGw3MGl4ajJqanp0aTd6NmhtciJ9.RAPKYGC_Y5TVueF5TNoPeg"
                        attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {renderGeoJsonLayer()}
                </MapContainer>
            </div>
        );
    }
}

export default LocalAuthorityMap23;
