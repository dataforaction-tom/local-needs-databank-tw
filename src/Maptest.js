import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap  } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import supabase from './supabaseClient';
import L from 'leaflet';
import chroma from 'chroma-js';

function Legend({ colorScale }) {
    const map = useMap();

    React.useEffect(() => {
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.padding = '6px 8px';
            div.style.background = 'rgba(255,255,255,0.8)';
            div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
            div.style.borderRadius = '5px';
            div.style.fontSize = '14px';

            const grades = colorScale.domain();
            const labels = [];

            for (let i = 0; i < grades.length - 1; i++) {
                const from = grades[i];
                const to = grades[i + 1];
                const color = colorScale(from + (to - from) / 2).hex();

                labels.push(
                    `<span style="background: ${color}; width: 24px; height: 24px; display: inline-block; margin-right: 5px; border: 1px solid #ddd;"></span> ` +
                    `${Math.round(from)}&ndash;${Math.round(to)}`
                );
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };

        legend.addTo(map);

        return () => {
            map.removeControl(legend);
        };
    }, [map, colorScale]);

    return null;
}



function LocalAuthorityMap({ selectedDataset, filteredObservations }) {
    const [geoJsonData, setGeoJsonData] = useState([]);
    const [filteredGeoJsonFeatures, setFilteredGeoJsonFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [map, setMap] = useState(null);

    const getColorScale = (data) => {
        const values = data.flatMap(feature =>
            feature.properties.observations.map(obs => obs.value)
        );
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;
        console.log('range', range);
        const step = range / 10; // Adjust the number of intervals as needed
        console.log('step', step);
        const domain = Array.from({length: 11}, (_, i) => min + i * step);
        console.log('domain', domain);
    
        return chroma.scale(['pink', '#662583']).domain(domain).mode('lab');
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
                popupContent += `<li>${obs.name}: ${obs.value}</li>`;
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
            <>
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
            <Legend colorScale={colorScale} />
            </>
        );
    };

    if (loading) {
        return <div></div>;
    }

    return (
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
                ></TileLayer>
            {renderGeoJsonLayer()}
        </MapContainer>
    );
}

export default LocalAuthorityMap;
