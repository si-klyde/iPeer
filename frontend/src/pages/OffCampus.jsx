import React, { useState } from 'react';
import Button from '../components/Button';

const OffCampus = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handler when the animation is loaded
  const handleAnimationLoad = () => {
    setIsLoaded(true);
  };

  const toggleModal = () => setIsModalOpen(!isModalOpen);


  return (
    <div className='bg-[#FFF9F9] min-h-screen'>
      {/* Hero Section */}
      <section 
        id="top"
        className="relative w-full h-[50vh] overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#FFF9F9]"></div> {/* Background overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-10 space-y-6 z-20">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl text-black font-extrabold tracking-normal drop-shadow-2xl mb-10">
              Off-Campus Resources
            </h1>
            <p className="text-md lg:text-md text-gray-700 text-opacity-90 max-w-4xl mx-auto leading-relaxed drop-shadow-md">
            Explore local mental health resources around Bicol University for additional support. Nearby clinics and psychological services provide professional care to address personal and academic challenges, ensuring you have access to the help you need in a safe and supportive environment.            </p>
          </div>
        </div>
        {/* <div className="absolute bottom-0 left-0 w-full z-10 shadow-xl h-[20vh]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#f3fbf5" fillOpacity="1" d="M0,128L120,112C240,96,480,64,720,64C960,64,1200,96,1320,112L1440,128L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path>
          </svg>
        </div> */}
      </section>


      
          {/* Divider */}
        <div className="w-5/6 h-0.5 bg-black/25 mx-auto my-12"></div>

      {/* 1st Office Section */}
      <section
        id="guidance-offices"
        className="relative w-full py-20 bg-[#FFF9F9] flex flex-col items-center"
      >
        <div className="container mx-auto px-6 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Text Content */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Bicol Drug Testing and Neuro Psychiatric Laboratory - Legazpi City</h2>
            <p className="text-gray-700 text-sm text-justify mb-4">
            Bicol Drug Testing and Neuro Psychiatric Laboratory is a reputable mental health service provider located in the heart of Legazpi, Philippines. 
            Situated at Capt. F. Aquende St. (Washington Drive), Old Albay District, the clinic is dedicated to offering essential mental health services to the local community. 
            With a focus on providing compassionate care, they are committed to supporting 
            individuals with various psychological and psychiatric needs. Open and accessible, the clinic provides a welcoming environment for those seeking professional mental health assistance.
            </p>
            <ul className="text-gray-700 space-y-2 mb-6">
              <li>• Neuro-Psychiatric Test</li>
              <li>• Psychological Test </li>
              <li>• Drug Screening Test</li>
            </ul>
            <div className="flex flex-col space-y-4">
            <Button
              className="bg-green-500 w-1/3 text-white px-4 py-2 rounded-full transition-transform transform hover:scale-105 duration-100 text-center"
              onClick={() => window.open(
                "https://www.facebook.com/profile.php?id=100088474968422",
                "_blank",
                "noopener,noreferrer"
              )}
            >
              View Page  
            </Button>

            </div>
          </div>

          {/* Map and Contact Details */}
          <div>
            <div className="mb-6">
              <iframe
                title="Campus Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3693.1012630849364!2d123.73182777484439!3d13.140631787190461!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a10166a1de0619%3A0x2caac0e20c07af37!2sBicol%20Drug%20Testing%20and%20Neuro%20Psychiatric%20Laboratory%20-%20Legazpi%20City!5e1!3m2!1sen!2sph!4v1732521986219!5m2!1sen!2sph"
                width="100%"
                height="300"
                className="rounded-md shadow-lg"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
            <div className=" flex flex-row space-y-0 space-x-10">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Contact Details</h3>
                <p className="text-md text-gray-700">4Capt. F. Aquende St. (Washington Drive), Old Albay District</p>
                <p className="text-md text-gray-700"> Legazpi , Albay</p>
                <p className="text-blue-600 hover:underline">
                  <a href="tel:+639207017010">0920 701 7010</a>
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Hours of Operation</h3>
                <p className="text-gray-700">Mon-Fri: 8 AM - 5 PM</p>
                <p className="text-gray-700">Sat: 8 AM - 3 PM</p>
                <p className="text-gray-700">Sun: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-5/6 h-0.5 bg-black/25 mx-auto my-12"></div>

      {/* 2nd Offices Section */}
      <section
        id="guidance-offices"
        className="relative w-full py-20 bg-[#FFF9F9] flex flex-col items-center"
      >
        <div className="container mx-auto px-6 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Text Content */}
          

          {/* Map and Contact Details */}
          <div>
            <div className="mb-6">
              <iframe
                title="Campus Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3692.6721336953983!2d123.748932074845!3d13.169119287164625!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a101075c330daf%3A0xd82859f5a84f6bfc!2sDLMR%20Psychometric%20Center%20-%20Legazpi!5e1!3m2!1sen!2sph!4v1732522255078!5m2!1sen!2sph"
                width="100%"
                height="300"
                className="rounded-md shadow-lg"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
            <div className=" flex flex-row space-y-0 space-x-10">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Contact Details</h3>
                <p className="text-md text-gray-700">Shorehomes, Purok 2</p>
                <p className="text-md text-gray-700"> Legazpi City, 4500 Albay</p>
                <p className="text-blue-600 hover:underline">
                  <a href="tel:+639213515551"> 0921 351 5551</a>
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Hours of Operation</h3>
                <p className="text-gray-700">Mon-Sat: 8 AM - 5 PM</p>
                <p className="text-gray-700">Sun: Closed</p>
              </div>
            </div>
          </div>

           {/* Text Content */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">DLMR Psychometric Center - Legazpi</h2>
            <p className="text-gray-700 text-sm text-justify mb-4">
            DLMR is a psychometric testing center located in Rawis, Legazpi City. The center offers psychological and neuro-psychiatric testing for employees, 
            face-to-face and online counseling, and assistance with adoption and annulment cases.

            </p>
            <ul className="text-gray-700 space-y-2 mb-6">
              <li>• Neuro-Psychiatric and Psychological Test</li>
              <li>• Psychological Assessment</li>
              <li>• School and SPED Assessment</li>
              <li>• Online and Face-to-face Counseling</li>
            </ul>
            <div className="flex flex-col space-y-4">
            <Button
              className="bg-green-500 w-1/3 text-white px-4 py-2 rounded-full transition-transform transform hover:scale-105 duration-100 text-center"
              onClick={() => window.open(
                "https://www.facebook.com/dlmrpsychometriclegazpi",
                "_blank",
                "noopener,noreferrer"
              )}
            >
              View Page
            </Button>

            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-5/6 h-0.5 bg-black/25 mx-auto my-12"></div>

      {/* 3rd Offices Section */}
      <section
        id="guidance-offices"
        className="relative w-full py-20 bg-[#FFF9F9] flex flex-col items-center"
      >
        <div className="container mx-auto px-6 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Text Content */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Ranga Psychosocial Services</h2>
            <p className="text-gray-700 text-sm text-justify mb-4">
            In the Bikol language, "Ranga" means comfort, solace, or relief. 
            Ranga Psychosocial Services is a mental health clinic at the heart of the Bicol Region which aims to cater to the ranga in every person.
            </p>
            <ul className="text-gray-700 space-y-2 mb-6">
              <li>• Psychotherapy/Counseling</li>
              <li>• Psychological Assessment</li>
              <li>• Neuropsychiatric/Neuropsychological Testing</li>
              <li>• School-based Psychological Assessment</li>
              <li>• Workplace Mental Health Programs</li>
              <li>• Seminars and Workshops</li>
            </ul>
            <div className="flex flex-col space-y-4">
            <Button
              className="bg-green-500 w-1/3 text-white px-4 py-2 rounded-full transition-transform transform hover:scale-105 duration-100 text-center"
              onClick={() => window.open(
                "https://www.rangapsychosocialservices.com/?fbclid=IwZXh0bgNhZW0CMTAAAR1zFeCWpKdlyC7sAoyrGSIvBdAQMnoJ7RphsEWRmZkm5-tSy5FosRBDPQo_aem_-SLQN0s1ZL483k0OVGdlRw",
                "_blank",
                "noopener,noreferrer"
              )}
            >
              View Website
            </Button>

            </div>
          </div>

          {/* Map and Contact Details */}
          <div>
            <div className="mb-6">
              <iframe
                title="Campus Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3693.0326080354985!2d123.74760597484445!3d13.145193487186333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a101f09777c249%3A0x5d2cc570005acfb5!2sRanga%20Psychosocial%20Services!5e1!3m2!1sen!2sph!4v1732963699400!5m2!1sen!2sph"
                width="100%"
                height="300"
                className="rounded-md shadow-lg"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
            <div className=" flex flex-row space-y-0 space-x-10">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Contact Details</h3>
                <p className="text-md text-gray-700">3/F Unit A, SMC Building Blk. 3, Lot 4, Landco Business Park, F. Imperial St</p>
                <p className="text-md text-gray-700">Legazpi City, 4500 Albay</p>
                <p className="text-blue-600 hover:underline">
                  <a href="tel:+639399272642">0939 927 2642</a>
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Hours of Operation</h3>
                <p className="text-gray-700">Fri-Sat: 8 AM - 5 PM</p>
                <p className="text-gray-700">Mon-Thur: Closed</p>
                <p className="text-gray-700">Sun: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-5/6 h-0.5 bg-black/25 mx-auto my-12"></div>

      {/* 4th Offices Section */}
      <section
        id="guidance-offices"
        className="relative w-full py-20 bg-[#FFF9F9] flex flex-col items-center"
      >
        <div className="container mx-auto px-6 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Text Content */}
          

          {/* Map and Contact Details */}
          <div>
            <div className="mb-6">
              <iframe
                title="Campus Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3685.7753530561577!2d123.18717297801963!3d13.618929952618718!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a18d9fa953b263%3A0x46064ad9bfe971b3!2sB%26M%20Neuropsychological%20Testing%20Center!5e1!3m2!1sen!2sph!4v1732523021516!5m2!1sen!2sph"
                width="100%"
                height="300"
                className="rounded-md shadow-lg"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
            <div className=" flex flex-row space-y-0 space-x-10">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Contact Details</h3>
                <p className="text-md text-gray-700">Unit 212, 2nd Floor, Bicol Access Health Centrum Hospital (Pedro Olivan Medical Arts Building) </p>
                <p className="text-md text-gray-700">Naga City</p>
                <p className="text-blue-600 hover:underline">
                  <a href="tel:+639568123523">0956 812 3523</a>
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Hours of Operation</h3>
                <p className="text-gray-700">Mon-Sun: 9 AM - 5 PM</p>
              </div>
            </div>
          </div>

           {/* Text Content */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">B&M Neuropsychological Testing Center</h2>
            <p className="text-gray-700 text-sm text-justify mb-4">
            B & M Neuropsychological Testing Center is a psychotherapist in Naga, Camarines Sur, Bicol. 
            B & M Neuropsychological Testing Center is situated nearby to the hospital Bicol Access Health Centrum, 
            as well as near the fire station Chin Po Tong Volunteer Fire Brigade.
            </p>
            <ul className="text-gray-700 space-y-2 mb-6">
              <li>• Neuropsychiatric/Neuropsychological Testing</li>
              <li>• Psychological Assessment</li>
              <li>• Psychotherapy/Counseling</li>
            </ul>
            <div className="flex flex-col space-y-4">
            <Button
              className="bg-green-500 w-1/3 text-white px-4 py-2 rounded-full transition-transform transform hover:scale-105 duration-100 text-center"
              onClick={() => window.open(
                "https://mapcarta.com/N8041730390",
                "_blank",
                "noopener,noreferrer"
              )}
            >
              View in Mapcarta
            </Button>

            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-5/6 h-0.5 bg-black/25 mx-auto my-12"></div>
      
      <div className='p-10 mb-10 text-center'>
      <button
        onClick={toggleModal}
        className="mt-6 text-green-700 font-medium hover:underline text-xl drop-shadow-xl"
      >
        See more →
      </button>
      </div>

          {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/2">
            <h3 className="text-2xl font-bold text-gray-800 mb-5 text-center">More Clinics</h3>
            <ul className="text-gray-700 space-y-5 mb-6 ">
              <li className='transform transition-colors duration-100 hover:text-green-500'><a href='https://g.co/kgs/8G1geyt'>• Spectrum Therapy and Intervention Center</a></li>
              <li className='transform transition-colors duration-100 hover:text-green-500'><a href='https://g.co/kgs/bDEpUJB'>• PsycHelp Psychological Services</a></li>
              <li className='transform transition-colors duration-100 hover:text-green-500'><a href='https://g.co/kgs/XExcv2D'>• Dr. Gregorio Tan</a></li>
              <li className='transform transition-colors duration-100 hover:text-green-500'><a href='https://g.co/kgs/uX7iWmJ'>• Harong Kan Sagrada Familia Therapy Center</a></li>
              <li className='transform transition-colors duration-100 hover:text-green-500'><a href='https://g.co/kgs/cso4ksu'>• GentleMen (GM) Bicol for SRHR Inc.</a></li>
              <li className='transform transition-colors duration-100 hover:text-green-500'><a href='https://g.co/kgs/ZLPvqZR'>• Bicol Center for Behavioral Medicine</a></li>
              <li className='transform transition-colors duration-100 hover:text-green-500'><a href='https://g.co/kgs/RJtKs2t'>• Brothers of Charity, Holy Face Rehabilitation Center for Mental Health</a></li>
              <li className='transform transition-colors duration-100 hover:text-green-500'><a href='https://g.co/kgs/JZuvGVy'>• Dr. Rachel A. Penetrante</a></li>
              <li className='transform transition-colors duration-100 hover:text-green-500'><a href='https://g.co/kgs/9db6sq9'>• National Center For Mental Health</a></li>
            </ul>
            <Button
              className="bg-red-500 text-white px-4 py-2 rounded-lg transition-transform transform hover:scale-105 duration-100"
              onClick={toggleModal}
            >
              Close
            </Button>
          </div>
        </div>
      )}    
    </div>
  );
};

export default OffCampus;
