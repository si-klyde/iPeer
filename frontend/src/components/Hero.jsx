import { useRef } from "react"
import { ScrollParallax } from "react-just-parallax"
import { heroBackground } from "../assets"
import curve from "../assets/hero/curve.png"
import background from "../assets/homepage-bg.jpg"
import { heroIcons } from "../constants"
import Button from "./Button"
import { BackgroundCircles, BottomLine, Gradient } from "../design/Hero"
import Section from "./Section"


const Hero = () => {
  const parallaxRef = useRef(null);  
  return (
    <Section
      className="pt-[12rem] -mt-[5.25rem]"
      crosses
      crossesOffset="lg:translate-y-[5.25rem]"
      customPaddings
      id="hero"
    >
      <div className="container relative" ref={parallaxRef}>
        <div className="relative z-1 max-w-[62rem] mx-auto text-center mb-[3.875rem] md:mb-20 lg:mb-[6.25rem]">
               <h1 className="h1 mb-6">
                    Connect. Share. Empower
                    <span className="inline-block relative">
                        <img
                            src={curve}
                            className="abosulte top-full left-0 w-full xl:-mt-2"
                            with={624} height={28} alt="Curve" />
                    </span>
                </h1> 
                <p className="body-1 max-w-3xl mx-auto mb-6 text-color-4 lg:mb-8">
                    Welcome to iPeer: Bicol University's Mental Health Hub.
                </p>
                    <Button href="" className="w-56 mx-10 mb-5" white>
                        Get Started
                    </Button>
            </div>
            <div className="relative max-w-[23rem] mx-auto md:max-w-5xl
                 xl:mb-24">
                <div className="relative z-1 p-0.5 rounded-2xl bg-color-1">
                    <div className="relative bg-n-8 rounded-[1rem]">
                        <div className="h-[1.4rem] bg-n-10 rounded-t-[0.9rem]"/>
                        <div className="aspect-[33/40] rounded-b-[0.9rem] overflow-hidden
                         md:aspect-[688/490] lg:aspect-[1024/600]">
                            <img src={background} className="w-full scale-[5]
                            translate-y-[8%] md:scale-[1] md:translate-y-[10%]
                            lg:translate-y-[0%]"
                            width={1024} height={490} alt="bg"/>
                            
                            <ScrollParallax isAbsolutelyPositioned>
                                <ul className="hidden absolute -left-[5.5rem] bottom-[7.5rem] px-1 py-1 bg-n-9/40 backdrop-blur border border-n-1/10 rounded-2xl xl:flex">
                                    {heroIcons.map((icon, index) => (
                                        <li className="p-5" key={index}>
                                            <img src={icon} width={24} height={25} alt={icon} />
                                        </li>
                                    ))}
                                </ul>
                            </ScrollParallax>
                        </div>
                    </div>
                    <Gradient />
                </div>
                <div className="absolute -top-[54%] left-1/2 w-[234%] -translate-x-1/2 md:-top-[46%] 
                md:w-[165%] lg:-top-[140%]">
                    <img src={heroBackground}
                        className="w-full"
                        width={1440} height={1880} alt="hero"/>
                </div>
                <BackgroundCircles />
            </div>
        </div>
    </Section>
      
  )
}

export default Hero