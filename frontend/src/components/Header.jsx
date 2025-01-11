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
import NotificationBell from './NotificationBell';
import { HiHome, HiCalendar, HiInformationCircle, HiClipboardList, HiUserGroup, HiAcademicCap, HiLogout, HiLogin } from 'react-icons/hi';

const getIcon = (title) => {
  switch (title) {
    case 'Home': return <HiHome className="w-5 h-5" />;
    case 'Therapy': return <HiUserGroup className="w-5 h-5" />;
    case 'Calendar': return <HiCalendar className="w-5 h-5" />;
    case 'Information': return <HiInformationCircle className="w-5 h-5" />;
    case 'Counseling': return <HiClipboardList className="w-5 h-5" />;
    case 'Dashboard': return <HiAcademicCap className="w-5 h-5" />;
    default: return null;
  }
};

const Header = ({ user, setUser }) => {
  const location = useLocation();
  const [openNavigation, setOpenNavigation] = useState(false);
  const [isShrunk, setIsShrunk] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Define paths where Header should not appear
  const hideHeaderPaths = ['/login'];

  // Define limited navigation for peer-counselors
  const peerCounselorNavigation = navigation.filter(item =>
    ['Home', 'Calendar', 'Information', 'Dashboard'].includes(item.title)
  );

  // Define navigation for clients (excluding Dashboard)
  const clientNavigation = navigation.filter(item =>
    ['Home', 'Therapy', 'Calendar', 'Information', 'Counseling'].includes(item.title)
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsShrunk(window.scroll  > 50);
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
      // Clear localStorage
      localStorage.clear();
      
      // Reset user context/state if using context
      setUser(null);

      navigate('/home');
      // window.location.reload();
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
      <div className="flex items-center justify-between px-4 sm:px-5 md:px-7.5 lg:px-10 h-full">
        {/* Logo and Title */}
        <a href="/" className="text-xl sm:text-2xl font-semibold flex items-center space-x-2 sm:space-x-3">
          <img src={logo} alt="" className="w-12 sm:w-15 inline-block" />
          <span className="text-[#0e0e0e] font-code">iPeer</span>
        </a>

        {/* Navigation Links */}
        <nav
          className={`fixed top-[4.5rem] right-4 w-64 bg-white py-2 rounded-lg shadow-lg lg:static lg:flex lg:w-auto lg:bg-transparent lg:shadow-none
          transform transition-all duration-300 ease-in-out origin-top
          ${openNavigation 
            ? 'opacity-100 scale-y-100 translate-y-0' 
            : 'opacity-0 scale-y-0 -translate-y-4 pointer-events-none'
          } lg:opacity-100 lg:scale-y-100 lg:translate-y-0 lg:pointer-events-auto`}
        >
          <div className="relative z-10 flex flex-col w-full py-2 lg:flex-row">
            {(user?.role === 'peer-counselor' ? peerCounselorNavigation : clientNavigation).map((item) => (
              <a
                key={item.id}
                href={item.url}
                onClick={handleClick}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out
                ${item.onlyMobile ? 'lg:hidden' : ''}
                ${item.url === location.pathname 
                  ? 'text-green-600 bg-gray-50 lg:bg-transparent' 
                  : 'text-gray-700 hover:text-green-500'
                }
                lg:px-4 lg:py-2 
                hover:bg-gray-100/90 hover:translate-x-1 lg:hover:translate-x-0
                lg:hover:bg-transparent lg:hover:scale-105
                rounded-md`}
              >
                <span className="text-current lg:hidden">{getIcon(item.title)}</span>
                <span className={`${!getIcon(item.title) ? 'lg:ml-0' : ''}`}>{item.title}</span>
              </a>
            ))}
            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 
                transition-all duration-200 ease-in-out 
                hover:bg-gray-100/90 hover:text-green-500 hover:translate-x-1
                rounded-md lg:hidden"
              >
                <HiLogout className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 
                transition-all duration-200 ease-in-out 
                hover:bg-gray-100/90 hover:text-green-500 hover:translate-x-1
                rounded-md lg:hidden"
                onClick={() => window.location.href = '/login'}
              >
                <HiLogin className="w-5 h-5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </nav>

        {/* Buttons */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {user ? (
            <div className="flex items-center space-x-3 sm:space-x-4">
              <NotificationBell user={user} />
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
            </div>
          ) : (
            <Button className="hidden lg:flex lg:text-xs text-n-8" href="/login">
              Sign In
            </Button>
          )}
          <Button className="lg:hidden px-2 sm:px-3" onClick={toggleNavigation}>
            <MenuSvg openNavigation={openNavigation} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;