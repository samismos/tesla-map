
/*
import React, { useState, useEffect } from 'react';
import './Map.css';

const ShowClosedStations = ({ onSelectCountry, selectedCountry }) => {
  const [countries, setCountries] = useState([]);
  const apiUrl = 'https://restcountries.com/v3.1/all?fields=name'; // Replace with the actual API endpoint

  useEffect(() => {
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        // Map and sort the country names
        const countryNames = data.map((country) => country.name.common);
        const sortedCountryNames = countryNames.sort((a, b) => a.localeCompare(b));
        setCountries(sortedCountryNames); // Update the state with the sorted list of country names from the API
      })
      .catch((error) => {
        console.error('Error fetching countries:', error);
      });
  }, []);

  const handleCountryChange = (event) => {
    const selectedCountry = event.target.value;
    onSelectCountry(selectedCountry); // Notify the parent component (Map) about the selected country
  };

  return (
    <div className="CountrySearchBar">
      {/* Search Bar (Dropdown) /}
      <select onChange={handleCountryChange} value={selectedCountry}>
        <option value="">Select a country</option>
        {countries.map((countryName) => (
          <option key={countryName} value={countryName}>
            {countryName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CountrySearchBar;
*/