import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginImage } from '../assets';
import logo from '../assets/ipeer-icon.png';
import LoginClient from './LoginClient'; // Import LoginClient
import RegisterPeerCounselor from './RegisterPeerCounselor'; // Import RegisterPeerCounselor
import LoginPeerCounselor from './LoginPeerCounselor'; // Import LoginPeerCounselor

const Login = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null); // Track which modal to show

  useEffect(() => {
    // Hide Header and Footer
    document.querySelector('header')?.classList.add('hidden');
    document.querySelector('footer')?.classList.add('hidden');

    return () => {
      // Restore Header and Footer visibility when leaving the page
      document.querySelector('header')?.classList.remove('hidden');
      document.querySelector('footer')?.classList.remove('hidden');
    };
  }, []);

  const goBack = () => {
    if (activeModal) {
      setActiveModal(null); // Reset to default state
    } else {
      navigate(-1); // Navigate to home page if no modal is active
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="max-w-screen-xl bg-white shadow-lg sm:rounded-lg flex justify-center flex-1 animate-fade-up relative">
        
        {/* Back Arrow Button */}
        <button
          onClick={goBack}
          className="absolute top-4 left-4 bg-transparent text-black text-xl font-bold py-2 px-4 rounded-md hover:bg-gray-200 transition duration-200"
        >
          &#8592; {/* Left Arrow character */}
        </button>

        {/* Left Section */}
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 text-center">
          {/* Conditionally Render Components */}
          {activeModal === null && (
            <>
              <a
                href="/home"
                className="text-2xl font-semibold flex items-center justify-center"
              >
                <img src={logo} alt="iPeer Logo" className="w-15 inline-block" />
                <span className="text-[#0e0e0e] font-code">iPeer</span>
              </a>
              <h2 className="text-4xl font-extrabold text-gray-800 my-8">
                Welcome
              </h2>
              <p className="text-gray-800 mb-10 text-sm">
                Your mental health companion at Bicol University. Select your role
                to proceed.
              </p>
              <button
                onClick={() => setActiveModal('client')}
                className="w-2/3 bg-green-400 hover:bg-green-600/80 text-white font-bold shadow-inner py-3 px-4 rounded-2xl mb-6 transition duration-200"
              >
                Login as Client
              </button>
              <button
                onClick={() => setActiveModal('register')}
                className="w-2/3 bg-green-400 hover:bg-green-600/80 text-white font-bold shadow-inner py-3 px-4 rounded-2xl mb-6 transition duration-200"
              >
                Register as Peer Counselor
              </button>
              <button
                onClick={() => setActiveModal('peer')}
                className="w-2/3 bg-green-400 hover:bg-green-600/80 text-white font-bold shadow-inner py-3 px-4 rounded-2xl mb-6 transition duration-200"
              >
                Login as Peer Counselor
              </button>
            </>
          )}

          {activeModal === 'client' && <LoginClient />}
          {activeModal === 'register' && <RegisterPeerCounselor />}
          {activeModal === 'peer' && <LoginPeerCounselor />}
        </div>

        {/* Right Section (Illustration) */}
        <div className="hidden lg:flex flex-1 bg-green-100 items-center justify-center">
          <div className="lg:w-5/6 flex justify-end mr-10">
            <img
              src={loginImage} // Replace with the correct source
              alt="Mental Health Illustration"
              className="size-fit object-cover rounded-lg "
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
