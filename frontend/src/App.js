import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import CreatePoll from './components/CreatePoll';
import PollDetail from './components/PollDetail';
import ParticipatePoll from './components/ParticipatePoll';
import PollResults from './components/PollResults';
import './styles/index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreatePoll />} />
            <Route path="/poll/:id" element={<PollDetail />} />
            <Route path="/poll/:id/participate" element={<ParticipatePoll />} />
            <Route path="/poll/:id/results" element={<PollResults />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
