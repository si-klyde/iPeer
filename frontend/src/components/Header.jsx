import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MenuSvg from '../assets/svg/MenuSvg';
import { navigation } from '../constants';
import Button from './Button';
import { disablePageScroll, enablePageScroll } from 'scroll-lock';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import logo from '../assets/ipeer-icon.png';
import ProfileDropdown from './ProfileDropdown';

const Header = ({ user }) => {
  const location = useLocation();
  const [openNavigation, setOpenNavigation] = useState(false);
  const [isShrunk, setIsShrunk] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Define paths where Header should not appear
  const hideHeaderPaths = ['/login'];

  useEffect(() => {
    const handleScroll = () => {
      setIsShrunk(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Check if the current path is in the list of paths where the header should be hidden
  if (hideHeaderPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
        isShrunk ? 'bg-[#FFF9F9] shadow-md h-14' : 'bg-[#FFF9F9] shadow-md h-20'
      }`}
    >
      <div className="flex items-center justify-between px-5 lg:px-7.5 xl:px-10 h-full">
        {/* Logo and Title */}
        <a href="/" className="text-2xl font-semibold flex items-center space-x-3">
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
                  src={user.photoURL}
                  alt="Profile"
                />
              </button>
              <ProfileDropdown 
                user={user}
                isOpen={isDropdownOpen}
                onSignOut={handleSignOut}
              />
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