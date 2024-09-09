import React, {useState, useEffect} from 'react';
import { Route, Routes } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import ButtonGradient from './assets/svg/ButtonGradient.jsx';
import Header from './components/Header.jsx';
import Counseling from './pages/Counseling';
import WaitingRoom from './pages/WaitingRoom';
import Hero from './components/Hero.jsx'
import Login from './pages/Login.jsx';
import { auth } from './firebase';
const App = () => {
    const [user, setUser] = useState(null); 

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
  
      return () => unsubscribe();
    }, []);
    //console.log("App.jsx: ", user);
    return (
        <>
            <Header user={ user }/>
            <div className="pt-[4.75rem] lg:pt-[5.25rem] overflow-hidden">
                <Routes>
                    <Route path="/" element={<Hero />} />
                    <Route path="/home" element={<Hero />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/waitingroom" element={<WaitingRoom />} />
                    <Route path="/counseling/:roomId" element={<Counseling />} />
                </Routes>
            </div>
            <ButtonGradient />
        </>
    );
};

export default App;
