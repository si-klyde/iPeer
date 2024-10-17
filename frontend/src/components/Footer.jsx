import React from "react";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import logo from '../assets/ipeer-icon.png';


const Footer = () => {
  return (
    <footer className="bg-green-600 text-white py-8 font-mono">
      <div className="container mx-auto flex justify-between items-start">
        {/* Left Section: Title */}
        <a href="" className='text-2xl font-semibold flex items-center space-x-3'>
          <img src={logo} alt='' className='w-15 inline-block' />
          <span className='text-white font-code'>
            iPeer
          </span>
        </a>
        
        {/* Center Section: Navigation Links */}
        <div className="flex space-x-8">
          <div>
            <h4 className="text-sm font-semibold mb-4">MENU</h4>
            <ul>
              <li className="mb-2"><a href="#" className="hover:underline">About</a></li>
              <li className="mb-2"><a href="#" className="hover:underline">Service</a></li>
              <li><a href="#" className="hover:underline">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-4">SERVICE</h4>
            <ul>
              <li className="mb-2"><a href="#" className="hover:underline">Health Promotion</a></li>
              <li className="mb-2"><a href="#" className="hover:underline">Disease Prevention</a></li>
              <li className="mb-2"><a href="#" className="hover:underline">Diagnosis & Treatment</a></li>
              <li><a href="#" className="hover:underline">Rehabilitation</a></li>
            </ul>
          </div>
        </div>
        
        {/* Right Section: Social Icons */}
        <div className="flex space-x-4">
          <a href="#" aria-label="Facebook">
            <FaFacebook className="text-white hover:text-gray-300" size={20} />
          </a>
          <a href="#" aria-label="Twitter">
            <FaTwitter className="text-white hover:text-gray-300" size={20} />
          </a>
          <a href="#" aria-label="Instagram">
            <FaInstagram className="text-white hover:text-gray-300" size={20} />
          </a>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-n-1/300 mt-6 pt-6 text-center text-sm text-gray-200">
        <p>&copy;2024 iPeer.com All rights reserved</p>
        <div className="flex justify-center space-x-6 mt-2">
          <a href="#" className="hover:underline">Terms of Use</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
