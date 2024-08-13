import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WaitingRoom from './pages/WaitingRoom';
import Counseling from './pages/Counseling';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<WaitingRoom />} />
                <Route path="/counseling/:roomId" element={<Counseling />} />
            </Routes>
        </Router>
    );
}

export default App;