import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginImage } from '../assets';
import logo from '../assets/ipeer-icon.png';
import LoginClient from './LoginClient';
import RegisterPeerCounselor from './RegisterPeerCounselor';
import LoginPeerCounselor from './LoginPeerCounselor';

const Login = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    document.querySelector('header')?.classList.add('hidden');
    document.querySelector('footer')?.classList.add('hidden');

    return () => {
      document.querySelector('header')?.classList.remove('hidden');
      document.querySelector('footer')?.classList.remove('hidden');
    };
  }, []);

  const goBack = () => {
    if (activeModal) {
      setActiveModal(null);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="h-auto bg-gray-100 flex justify-center items-center p-4 sm:pt-16 md:pt-20">
      <div className="max-w-screen-xl w-full bg-white shadow-lg sm:rounded-lg flex flex-col lg:flex-row justify-center flex-1 animate-fade-up relative">
        <button
          onClick={goBack}
          className="absolute top-4 left-4 bg-transparent text-black text-xl font-bold py-2 px-4 rounded-md hover:bg-gray-200 transition duration-200"
        >
          &#8592;
        </button>

        {/* Left Section */}
        <div className="w-full lg:w-1/2 xl:w-5/12 p-6 sm:p-8 text-center flex flex-col items-center justify-center">
          {activeModal === null && (
            <>
              <a
                href="/home"
                className="text-2xl font-semibold flex items-center justify-center mb-4"
              >
                <img src={logo} alt="iPeer Logo" className="w-10 inline-block mr-2" />
                <span className="text-[#0e0e0e] font-code">iPeer</span>
              </a>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 my-6">
                Welcome
              </h2>
              <p className="text-gray-800 mb-8 text-sm sm:text-base">
                Your mental health companion at Bicol University. Select your role to proceed.
              </p>
              <button
                onClick={() => setActiveModal('client')}
                className="w-full sm:w-2/3 bg-green-400 hover:bg-green-600/80 text-white font-bold shadow-inner py-3 px-4 rounded-2xl mb-4 sm:mb-6 transition duration-200"
              >
                Login as Client
              </button>
              {/* <button
                onClick={() => setActiveModal('register')}
                className="w-full sm:w-2/3 bg-green-400 hover:bg-green-600/80 text-white font-bold shadow-inner py-3 px-4 rounded-2xl mb-4 sm:mb-6 transition duration-200"
              >
                Register as Peer Counselor
              </button> */}
              <button
                onClick={() => setActiveModal('peer')}
                className="w-full sm:w-2/3 bg-green-400 hover:bg-green-600/80 text-white font-bold shadow-inner py-3 px-4 rounded-2xl transition duration-200"
              >
                Login as Peer Counselor
              </button>
            </>
          )}

          {/* Modals */}
          {activeModal === 'client' && <LoginClient />}
          {/* {activeModal === 'register' && <RegisterPeerCounselor />} */}
          {activeModal === 'peer' && <LoginPeerCounselor />}
        </div>

        {/* Right Section */}
        <div className="flex flex-1 bg-green-100 items-center justify-center p-4 lg:p-0">
          <div className="w-full lg:w-5/6 flex justify-center lg:justify-end">
            <img
              src={loginImage}
              alt="Mental Health Illustration"
              className="w-full md:h-auto sm:h-auto sm:w-2/3 md:w-2/3 lg:w-full object-cover rounded-lg"
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          animation: fadeUp 0.7s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;