import React from 'react';

const ProfileDropdown = ({ user, isOpen, onSignOut }) => {
  return (
    isOpen && (
      <div className="text-center absolute right-0 z-50 mt-2 w-64 sm:w-56 md:w-64 lg:w-80 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5">
        <div className="px-4 py-3 text-sm font-semibold bg-[#89d095] text-gray-100 rounded-t-md">
          Hi, {user.fullName || user.username || 'User'}   👋
        </div>

        {user.role === 'admin' ? (
          // Admin-specific menu items
          <a
            href="/admin/dashboard"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Dashboard
          </a>
        ) : (
          <>
            <a
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Your Profile
            </a>
            <div className="border-t border-gray-100 my-1"></div>
            {user.role !== 'peer-counselor' && (
              <>
                <a
                  href="/appointments/client"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Appointments
                </a>
                <div className="border-t border-gray-100 my-1"></div>
              </>
            )}
          </>
        )}
        <div className="px-4 py-2">
          <button
            onClick={onSignOut}
            className="w-full sm:w-3/4 md:w-1/2 text-sm text-white bg-[#f67637] hover:bg-red-600 py-2 px-4 rounded-md transition-colors duration-200"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  );
};


export default ProfileDropdown;
