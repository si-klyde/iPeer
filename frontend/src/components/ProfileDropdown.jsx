import React from 'react';

const ProfileDropdown = ({ user, isOpen, onSignOut }) => {
  return (
    isOpen && (
      <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5">
        <div className="px-4 py-3 text-sm font-semibold bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-t-md">
          Hi, {user.fullName || 'User'} 👋
        </div>
        <a
          href="/profile"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Your Profile
        </a>
        <div className="border-t border-gray-100 my-1"></div>
        <a
          href="/notifications"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Notifications
        </a>
        <div className="border-t border-gray-100 my-1"></div>
        <div className="px-4 py-2">
          <button
            onClick={onSignOut}
            className="w-full text-sm text-white bg-red-500 hover:bg-red-600 py-2 px-4 rounded-md transition-colors duration-200"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  );
};

export default ProfileDropdown;
