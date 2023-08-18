import './App.css';
import React from 'react';
import Map from './Map';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={'logo512.png'} className="App-logo" alt="logo" />
        </a>
      </header>
      <div className="map-container"> {/* Use "className" instead of "class" */}
        <Map />
      </div>
    </div>
  );
}

export default App;
