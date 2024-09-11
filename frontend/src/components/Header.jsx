import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ipeer from '../assets/nav-logo.png';
import MenuSvg from '../assets/svg/MenuSvg';
import { navigation } from "../constants";
import Button from './Button';
import { HamburgerMenu } from '../design/Header';
import { disablePageScroll, enablePageScroll } from 'scroll-lock';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Header = ({ user }) => {
  const pathname = useLocation();  
  const [openNavigation, setOpenNavigation] = useState(false);
  const navigate = useNavigate();
  
  const toggleNavigation = () => {
    if(openNavigation){
      setOpenNavigation(false);
      enablePageScroll();
    }
    else{
      setOpenNavigation(true);
      disablePageScroll();
    }
  };
  const handleClick = () =>{
    if(!openNavigation) return;
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

  return (
      <div
            className={`fixed top-0 left-0 w-full z-50  shadow-lg border-b-white lg:bg-transparent lg:bg-opacity-70 lg:backdrop-blur-sm ${
              openNavigation ? "bg-n-8" : "bg-n-8/90 backdrop-blur-sm"
            }`}
          >          
          <div className="flex items-center px-5 lg:px-7.5 xl:px-10
            max-lg:py-4">
                <a className="block w-[12rem] xl:mr-8" href="/home">
                    <img className='pb-0' src={ipeer}  width={190} height={10} 
                    alt="iPeer"/>
                </a>
                <nav className={`${openNavigation ? 'flex' : 'hidden'} fixed top-[5rem] left-0 right-0 bottom-0 bg-n-8 lg:static lg:flex lg:mx-auto lg:bg-transparent`}>
                  <div className="relative z-2 flex flex-col items-center
                    justify-center m-auto lg:flex-row">
                       {navigation.map((item) => (
                            <a key={item.id} href={item.url} onClick={handleClick} 
                            className={`block relative font-code text-2xl uppercase text-color-4 transition-colors hover:text-color-5 ${
                                item.onlyMobile ? "lg:hidden" : ""
                              } px-6 py-6 md:py-8 lg:-mr-0.25 lg:text-xs lg:font-semibold ${
                                item.url === pathname.hash
                                  ? "z-2 lg:text-color-5"
                                  : "lg:text-n-1"
                              } lg:leading-5 lg:hover:text-color-5 xl:px-12 drop-shadow-lg `}
                            >                                
                            {item.title}
                            </a>
                            
                       ))}
                    </div>

                    <HamburgerMenu />
                </nav>

                {user ? (
                  <button onClick={handleSignOut}>
                    Sign Out
                  </button>
                ) : (
                  <>
                    <a href="#signup" className="button hidden mr-8 lg:text-xs text-n-1 transition-colors hover:text-color-5 lg:block">
                      New Account
                    </a>
                    <Button className="hidden lg:flex lg:text-xs text-n-1" href="/login" white>
                      Sign In
                    </Button>
                  </>
                )}

                <Button className="ml-auto lg:hidden" px="px-3" onClick={toggleNavigation}>
                  <MenuSvg openNavigation={openNavigation} />
                </Button>
            </div>
    </div>
  )
}

export default Header
