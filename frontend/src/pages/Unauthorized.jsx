import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-100">
      <h1 className="text-4xl font-bold text-red-600">Unauthorized Access</h1>
      <p className="mt-4 text-black text-lg">You do not have permission to view this page.</p>
      <Link
        to="/"
        className="mt-6 px-4 py-2 text-white bg-green-500 rounded hover:bg-blue-700 transition duration-300"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default Unauthorized;