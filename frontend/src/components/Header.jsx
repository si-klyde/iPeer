import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MenuSvg from '../assets/svg/MenuSvg';
import { navigation } from '../constants';
import Button from './Button';
import { disablePageScroll, enablePageScroll } from 'scroll-lock';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import logo from '../assets/ipeer-icon.png';

const Header = ({ user }) => {
  const location = useLocation(); // Renamed for clarity
  const [openNavigation, setOpenNavigation] = useState(false);
  const [isShrunk, setIsShrunk] = useState(false); // New state for navbar size
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Define paths where Header should not appear
  const hideHeaderPaths = ['/login'];

  const toggleNavigation = () => {
    if (openNavigation) {
      setOpenNavigation(false);
      enablePageScroll();
    } else {
      setOpenNavigation(true);
      disablePageScroll();
    }
  };

  const handleClick = () => {
    if (!openNavigation) return;
    enablePageScroll();
    setOpenNavigation(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsShrunk(window.scrollY > 50); // Adjust scroll threshold as needed
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if the current path is in the list of paths where the header should be hidden
  if (hideHeaderPaths.includes(location.pathname)) {
    return null; // Do not render the header on these paths
  }

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
        isShrunk ? 'bg-[#FFF9F9] shadow-md h-14' : 'bg-[#FFF9F9] shadow-md h-20'
      }`}
    >
      <div className="flex items-center justify-between px-5 lg:px-7.5 xl:px-10 h-full">
        {/* Logo and Title */}
        <a href="" className="text-2xl font-semibold flex items-center space-x-3">
          <img src={logo} alt="" className="w-15 inline-block" />
          <span className="text-[#0e0e0e] font-code">iPeer</span>
        </a>

        {/* Navigation Links */}
        <nav
          className={`${
            openNavigation ? 'flex' : 'hidden'
          } fixed top-[4rem] left-0 right-0 bottom-0 bg-n-8 lg:static lg:flex lg:mx-auto lg:bg-transparent`}
        >
          <div className="relative z-10 flex flex-col items-center justify-center m-auto lg:flex-row">
            {navigation.map((item) => (
              <a
                key={item.id}
                href={item.url}
                onClick={handleClick}
                className={`block relative font-roboto text-2xl transition-colors hover:text-n-5 ${
                  item.onlyMobile ? 'lg:hidden' : ''
                } px-6 py-4 lg:py-2 lg:text-sm lg:font-medium ${
                  item.url === location.pathname ? 'text-n-5' : 'text-n-8'
                } lg:leading-5 lg:hover:text-green-500 xl:px-8 drop-shadow-lg`}
              >
                {item.title}
              </a>
            ))}
          </div>
        </nav>

        {/* Buttons */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex rounded-full bg-white hover:bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={user?.photoURL || `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzY0NzRmZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzY0YjNmNCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMTAwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+PC9zdmc+`}
                  alt=""
                />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-3 text-sm font-semibold bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-t-md">
                    Hi, {user?.displayName || 'User'} 👋
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
                      onClick={handleSignOut}
                      className="w-full text-sm text-white bg-red-500 hover:bg-red-600 py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button className="hidden lg:flex lg:text-xs text-n-8" href="/login">
              Sign In
            </Button>
          )}

          <Button className="lg:hidden px-3" onClick={toggleNavigation}>
            <MenuSvg openNavigation={openNavigation} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
