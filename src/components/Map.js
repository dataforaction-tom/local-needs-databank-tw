import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap  } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import supabase from '../supabaseClient';
import L from 'leaflet';
import chroma from 'chroma-js';
import localForage from 'localforage';

function getColor(value, classes, colorScale) {
    // Find the index of the class that the value falls into
    for (let i = 0; i < classes.length - 1; i++) {
        if (value >= classes[i] && value < classes[i + 1]) {
            // Return the color at the midpoint of the class range for better accuracy
            const midPoint = classes[i] + (classes[i + 1] - classes[i]) / 2;
            return colorScale(midPoint).hex();
        }
    }
    // Handle the case where value is in the last class
    return colorScale(classes[classes.length - 1]).hex();
}

function Legend({ colorScale, breaks }) {
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




function LocalAuthorityMap({ selectedDataset, filteredObservations, title }) {
    const [geoJsonData, setGeoJsonData] = useState([]);
    const [filteredGeoJsonFeatures, setFilteredGeoJsonFeatures] = useState([]);
    const [loading, setLoading] = useState(true);

    const getColorScaleAndBreaks = (data) => {
        const values = data.flatMap(feature => feature.properties.observations.map(obs => obs.value));
        const min = Math.min(...values);
      
        const max = Math.max(...values);
        
        
        // Round min and max to the nearest ten
        const roundedMin = Math.floor(min / 10) * 10;
        const roundedMax = Math.ceil(max / 10) * 10;
        const range = roundedMax - roundedMin;
        const step = range / 10;    
        const breaks = Array.from({length: 11}, (_, i) => roundedMin + i * step);    
        const colorScale = chroma.scale(['pink', '#662583']).domain(breaks);
           
        return { colorScale, breaks };
    };

    useEffect(() => {
        const fetchGeoJsonData = async () => {
            const datasetId = selectedDataset && selectedDataset.value;
            if (datasetId) {
                setLoading(true);
                const cacheKey = `geojson-${datasetId}`;
    
                // Check cache first
                const cachedData = await localForage.getItem(cacheKey);
                if (cachedData) {
                    
                    setGeoJsonData(cachedData);
                    setFilteredGeoJsonFeatures(cachedData);
                    setLoading(false);
                    return;
                }
    
                try {
                    const response = await supabase.rpc('get_features_geojson', { p_dataset_id: parseInt(datasetId, 10) });
                    if (!response.error && response.data) {
                        const normalizedData = response.data;
                        setGeoJsonData(response.data);
                        setFilteredGeoJsonFeatures(response.data);
                       
                        
    
                        // Save to cache
                        await localForage.setItem(cacheKey, normalizedData);
                    } else {
                        setGeoJsonData([]);
                        setFilteredGeoJsonFeatures([]);
                    }
                } catch (error) {
                    console.error('Error fetching GeoJSON:', error);
                    setGeoJsonData([]);
                    setFilteredGeoJsonFeatures([]);
                }
                setLoading(false);
            }
        };
    
        fetchGeoJsonData();
    }, [selectedDataset]);

   
    

    // Only include features that have at least one filtered observation for that place
    useEffect(() => {
        if (geoJsonData.length > 0) {
            const allowedPlaceNames = new Set(filteredObservations.map(obs => obs.place));
            const features = geoJsonData.filter(feature => allowedPlaceNames.has(feature.properties.lad22nm));
            setFilteredGeoJsonFeatures(features);
        } else {
            setFilteredGeoJsonFeatures([]);
        }
    }, [filteredObservations, geoJsonData]);

    // Precompute max value per place from filtered observations only
    const placeNameToMaxValue = useMemo(() => {
        const map = new Map();
        for (const obs of filteredObservations) {
            const current = map.get(obs.place);
            map.set(obs.place, current !== undefined ? Math.max(current, obs.value) : obs.value);
        }
        return map;
    }, [filteredObservations]);

    // Fit bounds to features when they change
    function FitBounds({ features }) {
        const mapInstance = useMap();
        useEffect(() => {
            if (!mapInstance) return;
            if (features && features.length > 0) {
                const layer = L.geoJSON(features);
                const bounds = layer.getBounds();
                if (bounds.isValid()) {
                    mapInstance.fitBounds(bounds, { padding: [50, 50] });
                }
            } else {
                mapInstance.setView([54.5, -2], 6);
            }
        }, [mapInstance, features]);
        return null;
    }
    

    const onEachFeature = (feature, layer, colorScale) => {
        const placeName = feature.properties.lad22nm;
        const maxValue = placeNameToMaxValue.get(placeName);
        if (maxValue === undefined) {
            // No filtered observations for this place (should be rare due to filtering)
            layer.setStyle({ fillOpacity: 0, color: 'transparent', weight: 0 });
            layer.bindPopup(`<div><strong>Name:</strong> ${placeName}</div><div>No observations available.</div>`);
            return;
        }

        layer.setStyle({
            fillColor: colorScale(maxValue).hex(),
            fillOpacity: 0.8,
            color: 'white',
            weight: 1
        });

        const formatNumber = (num) => new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(num);
        const matching = filteredObservations.filter(obs => obs.place === placeName);
        let popupContent = `<div><strong>Name:</strong> ${placeName}</div>`;
        if (matching.length > 0) {
            popupContent += `<div><strong>Observations:</strong><ul>`;
            matching.forEach(obs => {
                popupContent += `<li>${obs.name} (${obs.year}): ${formatNumber(obs.value)}</li>`;
            });
            popupContent += `</ul></div>`;
        } else {
            popupContent += `<div>No observations available.</div>`;
        }
        layer.bindPopup(popupContent);
    };

    const renderGeoJsonLayer = () => {
        const { colorScale, breaks } = getColorScaleAndBreaks(filteredGeoJsonFeatures);
        return (
            <>
                <GeoJSON
                    data={filteredGeoJsonFeatures}
                    onEachFeature={(feature, layer) => onEachFeature(feature, layer, colorScale)}
                    style={(feature) => {
                        const placeName = feature.properties.lad22nm;
                        const maxValue = placeNameToMaxValue.get(placeName);
                        if (maxValue === undefined) {
                            return { color: 'transparent', fillOpacity: 0, weight: 0 };
                        }
                        return {
                            color: 'white',
                            fillColor: colorScale(maxValue).hex(),
                            weight: 1,
                            fillOpacity: 0.8,
                        };
                    }}
                />
                <Legend colorScale={colorScale} breaks={breaks} />
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
            key={filteredGeoJsonFeatures.length}
        >
            <TileLayer
            url="https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG9tY3ciLCJhIjoiY2x2OGxyZGw3MGl4ajJqanp0aTd6NmhtciJ9.RAPKYGC_Y5TVueF5TNoPeg"
                attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                ></TileLayer>
            <FitBounds features={filteredGeoJsonFeatures} />
            {renderGeoJsonLayer()}
        </MapContainer>
        </div>
    );
}
}

export default LocalAuthorityMap;
