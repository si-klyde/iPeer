import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ButtonGradient from './assets/svg/ButtonGradient.jsx';
import Header from './components/Header.jsx';
import Counseling from './pages/Counseling';
import WaitingRoom from './pages/WaitingRoom';

const App = () => {
    return (
        <>
            <Header />
            <div className="pt-[4.75rem] lg:pt-[5.25rem] overflow-hidden">
                <Routes>
                    <Route path="/" element={<WaitingRoom />} />
                    <Route path="/counseling/:roomId" element={<Counseling />} />
                </Routes>
            </div>
            <ButtonGradient />
        </>
    );
};

export default App;
