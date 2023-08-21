const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3100;

app.use(express.json());

/*
const allowedOrigins = [
  'http://192.168.0.71:3000',
  'http://localhost:3000',
  'http://192.168.0.132:3000' 
];
*/

/*
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
*/

const corsOptions = {
  origin: '*',
}
app.use(cors(corsOptions));

app.get('/get-country-flag', async (req, res) => {
  try {
    let { selectedCountry } = req.query;
    if(selectedCountry == 'United States') {
      selectedCountry = 'USA';
    }
    // Step 1: Get the 2-letter code based on selected country
    const countryCodeResponse = await axios.get(`https://restcountries.com/v3.1/name/${selectedCountry}?fields=name,cca2,population,flags`);
    console.log(countryCodeResponse.data);  
    const countryCode = countryCodeResponse.data[0]?.cca2;
    const flagLink = countryCodeResponse.data[0]?.flags.svg;
    const flagAlt = countryCodeResponse.data[0]?.flags.alt;
    const population = countryCodeResponse.data[0]?.population;

    // Step 2: Get the flag using the 2-letter code
    /*const flagResponse = await axios.get(`https://flagsapi.com/${countryCode}/flat/64.png`, {
      responseType: 'arraybuffer',
      timeout: 5000,
      withCredentials: true,
    });
    */

    // Send the country data to the client
    const package = {countryCode, flagLink, flagAlt, population};
    res.send(package);

    //res.send(flagResponse.data);

  } catch (error) {
    console.error('Error fetching country data:', error);
    res.status(500).json({ error: 'Failed to fetch country data for : ',selectedCountry });
  }
});



app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});
