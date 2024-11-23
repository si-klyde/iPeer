import { BoltIcon, LinkIcon, ShareIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { aboutImage, heroImage, sectionImage, mindImage } from "../assets";
import Button from "./Button";
import ProfileCard from "./Card";
import TypingEffect from "./TypingEffect";
import ServicesCard from "./ServicesCard";

const Hero = () => {
  const parallaxRef = useRef(null);
  const [isVisible, setIsVisible] = useState({
    hero: false,
    about: false,
    features: false,
    explore: false,
    services: false,
    schedule: false,
    touch: false,
  });

  const observerOptions = {
    threshold: 0.2, // Trigger the animation when 20% of the element is visible
  };

  useEffect(() => {
    const sections = document.querySelectorAll("section");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: true,
          }));
        }
      });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <>
      {/* Top section */}
      <motion.section
        className="relative w-full h-[100vh] bg-[#E6F4EA]"
        id="hero" 
        ref={parallaxRef}
        variants={fadeUpVariants}
        initial="hidden"
        animate={isVisible.hero ? "visible" : "hidden"}
      >
        <div className="relative ml-15 flex items-center justify-end w-full h-screen md:h-screen">
          <img src={heroImage} alt="Hero Image" className="w-2/3 md:w-1/3 md:h-96 lg:h-auto lg:w-2/3 h-auto sd:w-1/3" />
        </div>
    
        {/* Text on top of the background */}
        <div className="lg:ml-20 absolute inset-0 flex items-center justify-start p-10">
          <div className="text-left">
            <TypingEffect />
            <p className="body-1/2 max-w-3xl mb-6 text-lg text-n-8 lg:mb-8">
              Welcome to iPeer: Bicol University's Mental Health Hub.
            </p>
            <Button className="mb-5" href="#about">
              Get Started
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Key Features Section */}
      <motion.section
        id="about"
        className="relative w-full h-[100vh] flex flex-col items-center justify-between p-20 bg-[#FFF9F9]"
        variants={fadeUpVariants}
        initial="hidden"
        animate={isVisible.about ? "visible" : "hidden"}
      >

        {/* Image and Text Section */}
        <div className="flex w-full justify-between items-center">
          {/* Image Section */}
          <div className="relative w-1/2 flex justify-center z-10">
            <img
              src={aboutImage}
              alt="About Image"
              className="ml-32 -mr-5 w-3/4 h-[400px] object-cover rounded-md"
            />
          </div>

          {/* Text Section */}
          <div className="relative w-1/2 flex flex-col justify-center space-y-4 text-black pl-16 z-10">
            <p className="font-mono text-sm text-gray-600">Our Journey Together</p>
            <p className="text-5xl font-bold leading-tight">
              Discover Your True Potential
            </p>
            <p className="text-md text-gray-700 w-3/4 pb-5">
              Here at MindSpace Hub, we foster personal growth and mental wellness
              through peer counseling, supporting you every step of the way.
            </p>
            <Button className="w-64" href="#features">
              Learn More
            </Button>
          </div>
        </div>

        {/* Hero Icons */}
        <div className="flex justify-around w-1/2 z-10 text-black">
          <div className="flex flex-col items-center text-center">
            <div className="p-6 rounded-full bg-transparent transition duration-300">
              <LinkIcon className="size-8 text-black" />
            </div>
            <p className="mt-2 font-bold">Connect.</p>
          </div>
          <div className="flex flex-col items-center text-center">
          <div className="p-6 rounded-full bg-transparent transition duration-300">
            <ShareIcon className="size-8 text-black" />
            </div>
            <p className="mt-2 font-bold">Share.</p>
          </div>
          <div className="flex flex-col items-center text-center">
          <div className="p-6 rounded-full bg-transparent transition duration-300">
            <BoltIcon className="size-8 text-black" />
            </div>
            <p className="mt-2 font-bold">Empower.</p>
          </div>
        </div>
      </motion.section>


      {/* Tailored Guidance Section */}
      <motion.section
        id="features"
        className="relative w-full h-[100vh] flex items-center justify-center px-10 bg-[#E6F4EA]"
        variants={fadeUpVariants}
        initial="hidden"
        animate={isVisible.features ? "visible" : "hidden"}
      >
        <div className="z-10 text-black">
          <p className="flex justify-center font-mono text-md text-gray-500">
            Tailored Guidance
          </p>
          <h1 className="bg-clip-text font-sans mb-5 text-4xl font-semibold flex justify-center p-6">
            Key Features
          </h1>
          <p className="mx-auto font-sans text-md mb-24 flex justify-center w-1/2 text-center">
            Our services ensure a personalized approach to enhance well-being, nurturing your mental health journey.
          </p>
          <div className="flex flex-wrap justify-center py-10">
            <ProfileCard />
          </div>
        </div>
      </motion.section>

      {/* Upcoming Events/Seminars Section */}
      <motion.section
        id="explore"
        className="relative w-full h-[100vh] flex items-center justify-between p-20 bg-[#E6F4EA]"
        variants={fadeUpVariants}
        initial="hidden"
        animate={isVisible.explore ? "visible" : "hidden"} 
      >
        {/* Text Section */}
        <div className="z-10 ml-32 w-1/2 flex flex-col justify-center space-y-4 text-black pl-16">
          <p className="font-mono text-md text-gray-600">Your Wellness Partner</p>
          <p className="text-5xl font-bold leading-tight">
            Personalized Emotional Support Services
          </p>
          <p className="mt-20 text-md text-gray-700 w-3/4">
            iPeer offers emotional support tailored to your needs, empowering you to achieve emotional resonance and wellness.
          </p>
          <Button className="mb-5 w-48 bg-color-5" href="#services">
            Explore Now
          </Button>
        </div>

        {/* Image Section */}
        <div className=" z-10 w-1/2 -ml-18 mr-20 flex justify-center">
          <img
            src={sectionImage}
            alt="About Image"
            className="w-3/4 h-[450px] object-cover rounded-md"
          />
        </div>
      </motion.section>

    {/* Services Section */}
      <motion.section
        id="services"
        className="relative w-full h-[110vh] flex items-center justify-center px-10 bg-[#FFF9F9]"
        variants={fadeUpVariants}
        initial="hidden"
        animate={isVisible.services ? "visible" : "hidden"}
      >
        <div className="z-10 text-black">
          <p className="flex justify-center font-mono text-md text-gray-500">
            Our Services
          </p>
          <h1 className="bg-clip-text font-sans mb-5 text-4xl font-semibold flex justify-center p-6">
            Peer Counseling and Support Services
          </h1>
          <div className="flex flex-wrap justify-center">
            <ServicesCard />
          </div>
        </div>
      </motion.section>

      {/* Schedule Section */}
      <motion.section
        id="schedule"
        className="relative w-full h-[100vh] flex items-center justify-center px-10 bg-[#E6F4EA]"
        variants={fadeUpVariants}
        initial="hidden"
        animate={isVisible.schedule ? "visible" : "hidden"}
      >
        <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-transparent p-24">
      {/* Image Section */}
      <div className="flex-shrink-0 w-full md:w-1/2 p-4">
        <img
          src={mindImage}
          alt="Mindfulness"
          className="-mr-5 w-[800px] h-[400px] rounded-lg shadow-md"
        />
      </div>

      {/* Text Section */}
      <div className="bg-transparent rounded-lg p-8 w-full md:w-1/2 mt-6 md:mt-0 md:ml-6">
        <p className="font-mono text-md text-gray-600/100 mb-5">Our Schedule</p>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Creating Space for Mind Wellness
        </h1>
        <p className="text-gray-600 mb-6">
          At iPeer, we foster a safe and nurturing environment for
          healing, growth, and personal transformation.
        </p>

        <div className="border-t border-gray-300 mt-4 pt-4">
          <h2 className="font-semibold text-lg text-gray-800 mb-5">iPeer Counseling and Appointment Schedule</h2>
          <div className="text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Mon - Tue:</span>
              <span>8:00 - 17:30</span>
            </div>
            <div className="flex justify-between">
              <span>Wed - Thu:</span>
              <span>8:00 - 17:30</span>
            </div>
            <div className="flex justify-between">
              <span>Fri:</span>
              <span>8:00 - 17:30</span>
            </div>
            <div className="flex justify-between">
              <span>Sat:</span>
              <span className="text-red-500">Closed</span>
            </div>
            <div className="flex justify-between">
              <span>Sun:</span>
              <span className="text-red-500">Closed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
      </motion.section>
      
      {/* Get in Touch Section */}
      <motion.section
        id="touch"
        className="relative w-full h-[100vh] flex items-center justify-center px-10 bg-[#E6F4EA]"
        variants={fadeUpVariants}
        initial="hidden"
        animate={isVisible.touch ? "visible" : "hidden"}
      >
      <div className="bg-[#9CDBA6] shadow-xl -mt-20 h-72 w-5/6 flex items-center justify-center relative">
      {/* Background Circles */}
      <div className="absolute size-48 bg-[#4FD3C4] rounded-full top-1/4 left-1/4"></div>
      <div className="absolute w-48 h-48 bg-[#488FB1] rounded-full bottom-1/4 right-1/4"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center m-10" >
        <p className="text-white">Get In Touch</p>
        <h1 className="text-white text-3xl font-bold mb-4">
          Reach Out to Us for <br /> Personalized Support
        </h1>
        <button className="bg-[#50B498] text-white py-2 px-4 rounded-lg hover:bg-[#468585] shadow-md">
          Appoint Today
        </button>
      </div>
    </div>
      </motion.section>
    </>
  );
};

export default Hero;
