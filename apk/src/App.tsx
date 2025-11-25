import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import ConnectionScreen from './pages/ConnectionScreen';
import LoginScreen from './pages/LoginScreen';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ConnectionScreen />} />
        <Route path="/login" element={<LoginScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
