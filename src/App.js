import React from 'react';
import './App.css';
import Scene from './scene'

function App() {

  Scene();

  return (
    <div className="App">
      <video id="video" autoPlay style={{display:'none'}}></video>
    </div>
  );
}

export default App;
