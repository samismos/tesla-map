import './Map.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Dropdown, Menu, Switch, Slider, Card } from 'antd';
import { SearchOutlined } from "@ant-design/icons";
import { FaFlag } from 'react-icons/fa'; // For the flag icon

const CountrySearchBar = ({ onSelectCountry, selectedCountry }) => {
  const [countries, setCountries] = useState([]);
  const [selectedOption, setSelectedOption] = useState();

  useEffect(() => {
    axios.get('geojson/countries.geojson')
      .then((response) => {
        // Assuming the response data has the structure { type: 'FeatureCollection', features: [...] }
        // Here, we extract the features array from the response and set it as the value of countries.
        if (Array.isArray(response.data?.features)) {
          const sortedCountries = response.data.features.sort((a, b) =>
            a.properties.ADMIN.localeCompare(b.properties.ADMIN)
          );
          setCountries(sortedCountries);
        }
      })
      .catch((error) => {
        console.error('Error fetching country data', error);
      });
  }, []);

  const handleCountryChange = (event) => {
    const newSelectedCountry = event;
    onSelectCountry(newSelectedCountry); // Notify the parent component (Map) about the selected country
    setSelectedOption(newSelectedCountry);
  };

  useEffect(() => {
    setSelectedOption(selectedCountry);
  }, [selectedCountry]);

  /* Recommended way to use menu={menu} instead of deprecated overlay={menu}
  --------------------------------------------------------
    const menuItems = countries.map((feature) => ({
    label: feature.properties.ADMIN,
    key: feature.properties.ADMIN,
    onClick: () => handleCountryChange(feature.properties.ADMIN),
  })); 
  --------------------------------------------------------
  */

  function WidgetMenu(props) {
    return (
      <Menu {...props} style={{ maxHeight: '300px', overflowY: 'scroll' }}>
        {countries.map((feature) => (
          <Menu.Item key={feature.properties.ADMIN} onClick={() => handleCountryChange(feature.properties.ADMIN)}>
            {feature.properties.ADMIN}
          </Menu.Item>
        ))}
      </Menu>
    );
  }

  return (
    <div className="dropdown-container">
      <Dropdown overlay={<WidgetMenu />} arrow={true} trigger={['click']}>
        <Button icon={<SearchOutlined />}>
          {selectedOption}
        </Button>
      </Dropdown>
    </div>
  );
};

const ZoomSlider = ({ onZoomChange, currentZoom, isZooming }) => {
  const [sliderValue, setSliderValue] = useState(currentZoom);

  const handleSliderChange = (value) => {
    if (!isZooming) {
      setSliderValue(value);
      onZoomChange(value);
    }
  };

  useEffect(() => {
    handleSliderChange(currentZoom);
  }, [currentZoom])

  return (
    <div className="slider-container">
      <label>
        <Slider min={2} max={18} value={sliderValue} onAfterChange={handleSliderChange} />
      </label>
    </div>
  );
};

const OpenStationSwitch = ({ onSwitchChange, showOpenStations, }) => {
  const [switchValue, setSwitchValue] = useState(showOpenStations);

  const handleSwitchChange = (value) => {
    setSwitchValue(value);
    onSwitchChange(value);
  }

  return (
    <div className='switch-container'>
      <label>
        <Switch defaultChecked={false} checked={switchValue} onChange={handleSwitchChange} />
        &nbsp;Show only open stations
      </label>
    </div>
  );
}

function FlagCard({ selectedCountry }) {
  const [flagInfo, setFlagInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    axios.get(`http://192.168.0.71:3100/get-country-flag?selectedCountry=${selectedCountry}`)
      .then((response) => {
        setFlagInfo(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching country flag:', error);
        setIsLoading(false);
      });
  }, [selectedCountry]);

  return (
    <div>
      {!isMinimized ? (
        <div className='button-container'>
          <button className='flag-button' onClick={() => setIsMinimized(!isMinimized)}>
          <span>View {selectedCountry}</span>
  <div className="flag-icon top-right"><FaFlag /></div>
  <div className="flag-icon bottom-left"><FaFlag /></div>
          </button>
        </div>
      ) : (
        <div>
          {isLoading ? (
            <div className='card-container'>
            <div className='loading-spinner'></div>
            <div>Loading...</div>
            </div>
          ) : (
            flagInfo && (
              <div className='card-container'>
              <Card bordered={true} hoverable={true} title={selectedCountry} cover={<img src={flagInfo.flagLink} alt={flagInfo.countryCode} style={{ maxWidth: 256, margin: 'auto' }} />}>
                {flagInfo.flagAlt}
                <div><button className='flag-button' onClick={() => setIsMinimized(!isMinimized)}>Close</button></div>
              </Card>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export { ZoomSlider, CountrySearchBar, OpenStationSwitch, FlagCard };
