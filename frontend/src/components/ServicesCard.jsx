import React from 'react';
import { FaCalendar } from 'react-icons/fa';
import { FaLaptopMedical } from 'react-icons/fa';
import { FaHandshake } from 'react-icons/fa';
import { FaBookMedical } from 'react-icons/fa';

function ServicesCard() {
  return (
    <div className="grid grid-cols-2 gap-10 p-6">
      {/* Card 1 */}
      <div className="flex flex-row items-center rounded-lg bg-white shadow-lg h-48 w-full p-4">
      <div className="rounded-xl flex items-center justify-center w-1/3 h-full bg-transparent">
      <FaHandshake className="w-16 h-16 text-green-500" />
        </div>
        <div className="flex flex-col justify-center w-2/3 pl-4">
          <h5 className="text-xl font-semibold text-gray-900">Peer Support</h5>
          <p className="text-sm text-gray-700">Professional counselors providing guidance.</p>
          <a href="#" className="mt-2 text-gray-600 hover:underline">Make an appointment</a>
        </div>
      </div>

      {/* Card 2 */}
      <div className="flex flex-row items-center rounded-lg bg-white shadow-lg h-48 w-full p-4">
      <div className="rounded-xl flex items-center justify-center w-1/3 h-full bg-transparent">
      <FaBookMedical className="w-16 h-16 text-green-500" />
        </div>
        <div className="flex flex-col justify-center w-2/3 pl-4">
          <h5 className="text-xl font-semibold text-gray-900">Information Hub </h5>
          <p className="text-gray-700">Empowering mental wellness together.</p>
          <a href="#" className="mt-2 text-gray-600 hover:underline">Learn More</a>
        </div>
      </div>

      {/* Card 3 */}
      <div className="flex flex-row items-center rounded-lg bg-white shadow-lg h-48 w-full p-4">
      <div className="rounded-xl flex items-center justify-center w-1/3 h-full bg-transparent">
        <FaCalendar className="w-16 h-16 text-green-500 font-bold" />
        </div>
        <div className="flex flex-col justify-center w-2/3 pl-4">
          <h5 className="text-xl font-semibold text-gray-900">Calendar of Events and Seminars</h5>
          <p className="text-gray-700">Tailored programs for healing journeys.</p>
          <a href="#" className="mt-2 text-gray-600 hover:underline">Discover More</a>
        </div>
      </div>

      {/* Card 4 */}
      <div className="flex flex-row items-center rounded-lg bg-white shadow-lg h-48 w-full p-4">
      <div className="rounded-xl flex items-center justify-center w-1/3 h-full bg-transparent">
        <FaLaptopMedical className="w-16 h-16 text-green-500" />
        </div>
        <div className="flex flex-col justify-center w-2/3 pl-4">
          <h5 className="text-xl font-semibold text-gray-900">Online Therapies</h5>
          <p className="text-gray-700">Holistic approaches to personal growth.</p>
          <a href="#" className="mt-2 text-gray-600 hover:underline">Understand More</a>
        </div>
      </div>
    </div>
  );
}

export default ServicesCard;
