import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Button from "./Button";
import { heroImage, aboutImage } from "../assets";
import TypingEffect from "./TypingEffect";
import ProfileCard from "./Card";
import { LinkIcon, ShareIcon, BoltIcon } from "@heroicons/react/24/outline";
import { sectionImage } from "../assets";

const Hero = () => {
  const parallaxRef = useRef(null);
  const [isVisible, setIsVisible] = useState({
    hero: false,
    about: false,
    more: false,
    upcoming: false
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
            [entry.target.id]: true
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
        className="bg-slate-50 relative w-full h-[100vh]"
        id="hero"
        ref={parallaxRef}
        variants={fadeUpVariants}
        initial="hidden"
        animate={isVisible.hero ? "visible" : "hidden"}
      >
        <div className="relative ml-15 flex items-center justify-end w-full h-screen">
          <img src={heroImage} alt="Hero Image" className="w-2/3 h-auto" />
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

      {/* Key Feaures Section */}
      <motion.section
        id="about"
        className="bg-slate-50 relative w-full h-[100vh] flex items-center justify-between px-10"
        variants={fadeUpVariants}
        initial="hidden"
        animate={isVisible.about ? "visible" : "hidden"}
      >
        {/* Image Section */}
        <div className="w-1/2 flex justify-center">
          <img
            src={aboutImage}
            alt="About Image"
            className="ml-32 -mr-5 w-3/4 h-[450px] object-cover rounded-md"
          />
        </div>

        {/* Text Section */}
        <div className="w-1/2 flex flex-col justify-center space-y-4 text-black pl-16">
          <p className="font-mono text-md text-gray-600">Our Journey Together</p>
          <p className="text-5xl font-bold leading-tight">
            Discover Your True Potential
          </p>
          <p className="text-lg text-gray-700 w-3/4">
            Here at iPeer, we foster personal growth and mental wellness through peer counseling, supporting you every step of the way.
          </p>

          <div className="flex flex-row space-x-7 pr-4 py-4">
            <div className="rounded-xl size-20 p-6 z-10 -top-8 hover:shadow-xl transition">
              <div className="bg-transparent w-full h-full overflow-auto">
                <LinkIcon className="w-auto h-auto" />
              </div>
            </div>
            <div className="rounded-xl size-20 p-6 z-10 -top-8 hover:shadow-xl transition">
              <div className="bg-transparent w-full h-full overflow-auto">
                <ShareIcon className="w-auto h-auto" />
              </div>
            </div>
            <div className="rounded-xl size-20 p-6 z-10 -top-8 hover:shadow-xl transition">
              <div className="bg-transparent w-full h-full overflow-auto">
                <BoltIcon className="w-auto h-auto" />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Tailored Guidance Section */}
      <motion.section
        id="more"
        className="bg-slate-50 relative w-full h-[100vh] flex items-center justify-center px-10"
        variants={fadeUpVariants}
        initial="hidden"
        animate={isVisible.more ? "visible" : "hidden"}
      >
        <div className="text-black">
          <p className="flex justify-center font-mono text-md text-gray-500">Tailored Guidance</p>
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
        id="third"
        className="bg-slate-50 relative w-full h-[100vh] flex items-center justify-between px-10"
        variants={fadeUpVariants}
        initial="hidden"
        animate={isVisible.about ? "visible" : "hidden"}
      >
        {/* Text Section */}
        <div className="ml-32 w-1/2 flex flex-col justify-center space-y-4 text-black pl-16">
          <p className="font-mono text-md text-gray-600">Your Wellness Partner</p>
          <p className="text-5xl font-bold leading-tight">
            Personalized Emotional Support Services
          </p>
          <p className="mt-20 text-md text-gray-700 w-3/4">
             iPeer offers emotional support tailored to your needs, empowering you to achieve emotional resonance and wellness.          
          </p>
          <Button className="mb-5 w-48 bg-color-5">
          Explore Now
        </Button>
        </div>
        
        {/* Image Section */}
        <div className="w-1/2 -ml-18 mr-20 flex justify-center">
          <img
            src={sectionImage}
            alt="About Image"
            className="w-3/4 h-[450px] object-cover rounded-md"
          />
        </div>
      </motion.section>
    </>
  );
};

export default Hero;
