import './Map.css';
import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import teslaData from './data/tesla-sites.json';
import { booleanPointInPolygon } from '@turf/turf';
import { ZoomSlider, CountrySearchBar, OpenStationSwitch, FlagCard } from './AntComponents.js';


const customIcon = new Icon({
  iconUrl: 'marker.png',
  iconSize: [40, 40],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const center = [38.6588362, 23.0719843];

const Map = () => {
  const [selectedCountry, setSelectedCountry] = useState('Greece');
  const [filteredStations, setFilteredStations] = useState([]);
  const [geojsonData, setGeojsonData] = useState(null);
  const [selectedCountryGeoJson, setSelectedCountryGeoJson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeoJsonReady, setIsGeoJsonReady] = useState(false);
  const [showOpenStations, setShowOpenStations] = useState(false);
  const [zoom, setZoom] = useState(7);
  const [isZooming, setIsZooming] = useState(false);
  const [mapCenter, setMapCenter] = useState(center);



  useEffect(() => {
  axios.get('/geojson/countries.geojson')
    .then((response) => {
      setGeojsonData(response.data);
    })
    .catch((error) => {
      console.error('Error fetching GeoJSON data:', error);
    });
}, []);

  useEffect(() => {
    setIsLoading(true);

    if (geojsonData && selectedCountry) {
      console.log('Selected country changed:', selectedCountry);
      const filteredData = teslaData.filter((tesla) => {
        if (!showOpenStations) {
          return tesla.address?.country === selectedCountry;
        } else {
          return tesla.address?.country === selectedCountry && tesla.status === 'OPEN';
        }
      });
      setFilteredStations(filteredData);

      const selectedCountryFeature = geojsonData.features.find(
        (feature) => feature.properties.ADMIN === selectedCountry
      );

      if (selectedCountryFeature) {
        setSelectedCountryGeoJson({
          type: 'FeatureCollection',
          features: [selectedCountryFeature],
        });
      } else {
        setSelectedCountryGeoJson(null);
      }
    } else {
      setFilteredStations(teslaData);
      setSelectedCountryGeoJson(null);
    }

    setIsLoading(false);
  }, [selectedCountry, geojsonData, showOpenStations]);

  useEffect(() => {
    if (selectedCountryGeoJson) {
      setIsGeoJsonReady(true);
    }
  }, [selectedCountryGeoJson]);

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
  };

  const MapEvent = ({ handleMapClick }) => {
    useMapEvents({
      click: handleMapClick,
    });
  
    return null;
  };

  const handleMapClick = (event) => {
    if (event.latlng) {
      //setPopupPosition(event.latlng);
      const { lat, lng } = event.latlng;
      const clickedPoint = [lng, lat];
      // Find which country contains the clicked point
      const clickedCountryFeature = geojsonData.features.find((feature) => {
        return booleanPointInPolygon(clickedPoint, feature.geometry);
      });

      if (clickedCountryFeature) {
        // Handle the selected country, e.g., highlight or show info
        setSelectedCountry(clickedCountryFeature.properties.ADMIN);
      }
    }
  };

  const handleShowOpenStationsChange = (event) => {
    //console.log('Event:', event);
    setShowOpenStations(event);
  };

  function MapEventHandlers() {
    //Using isZooming flag to prevent rapid succession of zoom events,
    //leading to error with undefined states

    const handleZoomStart = () => {
      setIsZooming(true);
    };

    const handleZoomEnd = () => {
      setIsZooming(false);
      let center;
      const zoom = map.getZoom();
      // Attempt to get the center, but catch the specific error
      try {
        center = map.getCenter();
        setMapCenter([center.lat, center.lng]);
      } catch (error) {
        console.error('Error getting map center:', error);
      }
      // Update zoom only if zoom was successfully obtained
      if (zoom) {
        setZoom(zoom);
      }
    };

    const map = useMapEvents({
      zoomstart: handleZoomStart,
      zoomend: handleZoomEnd,
    })
    useEffect(() => {
      const disableMapInteraction = () => {
        if (isZooming) {
          map.dragging.disable();
          map.scrollWheelZoom.disable();
        }
        else {
          map.dragging.enable();
          map.scrollWheelZoom.enable();
        }
      };
      disableMapInteraction();

      return () => {
        map.dragging.enable();
        map.scrollWheelZoom.enable();
      };
    }, [map]);

    return null;
  }


  return (
    <div className="map-container">

      <><CountrySearchBar onSelectCountry={handleCountryChange} selectedCountry={selectedCountry}/></>
      <><OpenStationSwitch onSwitchChange={handleShowOpenStationsChange} showOpenStations={showOpenStations}/></>
      <><ZoomSlider onZoomChange={setZoom} currentZoom={zoom} isZooming={isZooming}/></>
      <><FlagCard selectedCountry={selectedCountry}/></>
      <div>
        {/*<LinkFetcher onDataFetched={handleLinkIdsFetched} />*/}
      </div>
      <MapContainer center={mapCenter} key={zoom} zoom={zoom} minZoom={2} style={{ height: '95vh', width: '100%', margin: 'auto', verticalAlign: 'center' }}>
      <MapEventHandlers />
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {isLoading ? (
          <div style={{
            fontSize: '20px',
            fontWeight:'bold',
          }}>Loading...</div>
        ) : (
          <>
            {isGeoJsonReady &&  <GeoJSON data={selectedCountryGeoJson} key={JSON.stringify(selectedCountryGeoJson)} />}
            {selectedCountry && (
              <MarkerClusterGroup chunkedLoading>
                {filteredStations.map((tesla) => (
                  <Marker key={tesla.id} position={[tesla.gps.latitude, tesla.gps.longitude]} icon={customIcon}>
                    <Popup>{tesla.name}<br />Status: {tesla.status}</Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            )}

            <MapEvent handleMapClick={handleMapClick} />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
