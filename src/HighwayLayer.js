import React, { useState, useEffect } from 'react';
import { GeoJSON } from 'react-leaflet';
import axios from 'axios';

const HighwayLayer = ({ linkIds }) => {
  const [highwayData, setHighwayData] = useState([]);

  useEffect(() => {
    const fetchHighwayData = async (linkId) => {
      const overpassApiUrl = `https://overpass-api.de/api/interpreter?data=[out:json];way(${linkId});out%20geom;`;

      try {
        const response = await axios.get(overpassApiUrl);
        const highwayGeoJson = response.data;

        console.log('Received GeoJSON data:', highwayGeoJson);

        if (highwayGeoJson.elements[0]?.geometry) {
          const featureCollection = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: highwayGeoJson.elements[0]?.geometry,
                properties: {},
              },
            ],
          };

          console.log('Feature Collection:', featureCollection);

          // Store the highway GeoJSON data in state
          setHighwayData((prevHighwayData) => [...prevHighwayData, featureCollection]);
        }
      } catch (error) {
        console.error(`Error fetching highway geometry for linkId ${linkId}`, error);
      }
    };

    // Fetch highway data for each linkId
    linkIds.forEach((linkId) => {
      fetchHighwayData(linkId);
    });
  }, [linkIds]);

  // Create a single GeoJSON data object to be used for rendering
  const geoJsonData = {
    type: 'FeatureCollection',
    features: highwayData.flatMap((data) => data.features),
  };

  return (
    <GeoJSON data={geoJsonData} style={{ color: 'red' }} />
  );
};

export default HighwayLayer;
