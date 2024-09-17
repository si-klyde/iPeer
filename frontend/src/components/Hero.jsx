import { BoltIcon, LinkIcon, ShareIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { aboutImage, heroImage, sectionImage } from "../assets";
import Button from "./Button";
import ProfileCard from "./Card";
import TypingEffect from "./TypingEffect";
import ServicesCard from "./ServicesCard";

const Hero = () => {
  const parallaxRef = useRef(null);
  const [isVisible, setIsVisible] = useState({
    hero: false,
    about: false,
    more: false,
    upcoming: false,
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
        // style={{
        //   background: "radial-gradient(circle at bottom right, rgba(217, 249, 157, 0.4) 20%, #FFFFFF 80%)",
        // }}
      >
         {/* Left background covering half of the screen */}
        {/* <div
          className="absolute top-0 left-0 w-1/2 h-full z-0"
          style={{
            background: 'radial-gradient(circle at top left, rgba(217, 249, 157, 0) 20%, #FFFFFF 80%)' // Subtle green to white gradient
          }}
        >
        </div> */}

        {/* Right background with radial gradient positioned at the top-right */}
        {/* <div
          className="absolute top-0 right-0 w-1/2 h-full z-0"
          style={{
            background: 'radial-gradient(circle at bottom right, rgba(217, 249, 157, 0.1) 20%, #FFFFFF 80%)' // Subtle green to white gradient
          }}
        >
        </div> */}
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

      {/* Key Features Section */}
      <motion.section
        id="about"
        className="relative w-full h-[100vh] flex flex-col items-center justify-between p-20 bg-[#FFF9F9]"
        variants={fadeUpVariants}
        initial="hidden"
        animate={isVisible.about ? "visible" : "hidden"}
      >
        {/* Background gradients */}
        {/* <div
          className="absolute top-0 left-0 w-1/2 h-full z-0"
          style={{
            background:
              'radial-gradient(circle at bottom left, rgba(217, 249, 157, 0.1) 20%, #FFFFFF 80%)',
          }}
        ></div>

        <div
          className="absolute top-0 right-0 w-1/2 h-full z-0"
          style={{
            background:
              'radial-gradient(circle at top right, rgba(217, 249, 157, 0.1) 20%, #FFFFFF 80%)',
          }}
        ></div> */}

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
            <Button className="w-64">
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
        id="more"
        className="relative w-full h-[100vh] flex items-center justify-center px-10 bg-[#E0F2F1]"
        variants={fadeUpVariants}
        initial="hidden"
        animate={isVisible.more ? "visible" : "hidden"}
        // style={{
        //   background: "radial-gradient(circle at 50% 50%, rgba(217, 249, 157, 0.2) 20%, #FFFFFF 80%)",
        // }}
      >
        {/* Left background covering half of the screen */}
      {/* <div
        className="absolute top-0 left-0 w-1/2 h-full z-0"
        style={{
          background: 'radial-gradient(circle at top left, rgba(217, 249, 157, 0.1) 20%, #FFFFFF 80%)' // Subtle green to white gradient
        }}
      ></div> */}

      {/* Right background with radial gradient positioned at the top-right */}
      {/* <div
        className="absolute top-0 right-0 w-1/2 h-full z-0"
        style={{
          background: 'radial-gradient(circle at bottom right, rgba(217, 249, 157, 0.1) 20%, #FFFFFF 80%)' // Subtle green to white gradient
        }}
      >
      </div> */}
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
        id="upcoming"
        className="relative w-full h-[100vh] flex items-center justify-between p-20 bg-[#FAFAFA]"
        variants={fadeUpVariants}
        initial="hidden"
        animate={isVisible.upcoming ? "visible" : "hidden"}
        // style={{
        //   background: "radial-gradient(circle at 50% 50%, rgba(217, 249, 157, 0.2) 20%, #FFFFFF 80%)",
        // }}
      >
         {/* Left background covering half of the screen */}
          {/* <div
            className="absolute top-0 left-0 w-1/2 h-full z-0"
            style={{
              background: 'radial-gradient(circle at bottom left, rgba(217, 249, 157, 0.1) 20%, #FFFFFF 80%)' // Subtle green to white gradient
            }}
          ></div> */}

          {/* Right background with radial gradient positioned at the top-right */}
          {/* <div
            className="absolute top-0 right-0 w-1/2 h-full z-0"
            style={{
              background: 'radial-gradient(circle at top right, rgba(217, 249, 157, 0.1) 20%, #FFFFFF 80%)' // Subtle green to white gradient
            }}
          >
          </div> */}
        {/* Text Section */}
        <div className="z-10 ml-32 w-1/2 flex flex-col justify-center space-y-4 text-black pl-16">
          <p className="font-mono text-md text-gray-600">Your Wellness Partner</p>
          <p className="text-5xl font-bold leading-tight">
            Personalized Emotional Support Services
          </p>
          <p className="mt-20 text-md text-gray-700 w-3/4">
            iPeer offers emotional support tailored to your needs, empowering you to achieve emotional resonance and wellness.
          </p>
          <Button className="mb-5 w-48 bg-color-5">Explore Now</Button>
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

      <motion.section
        id="services"
        className="relative w-full h-[100vh] flex items-center justify-center px-10 bg-[#F5F5F5]"
        variants={fadeUpVariants}
        initial="hidden"
        animate={isVisible.more ? "visible" : "hidden"}
        // style={{
        //   background: "radial-gradient(circle at 50% 50%, rgba(217, 249, 157, 0.2) 20%, #FFFFFF 80%)",
        // }}
      >
        {/* Left background covering half of the screen */}
      {/* <div
        className="absolute top-0 left-0 w-1/2 h-full z-0"
        style={{
          background: 'radial-gradient(circle at top left, rgba(217, 249, 157, 0.1) 20%, #FFFFFF 80%)' // Subtle green to white gradient
        }}
      ></div> */}

      {/* Right background with radial gradient positioned at the top-right */}
      {/* <div
        className="absolute top-0 right-0 w-1/2 h-full z-0"
        style={{
          background: 'radial-gradient(circle at bottom right, rgba(217, 249, 157, 0.1) 20%, #FFFFFF 80%)' // Subtle green to white gradient
        }}
      >
      </div> */}
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
    </>
  );
};

export default Hero;
