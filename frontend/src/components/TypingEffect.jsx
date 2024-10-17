import React from 'react';
import { Typewriter } from 'react-simple-typewriter';

const TypingEffect = () => {
  return (
    <h1 className="-mt-20 mb-6 text-6xl lg:text-6xl text-n-8">
      Your safe space for{' '}
      <h1 className='font-black indent-0'>
      <Typewriter
        words={['Support', 'Connection', 'Mental Wellness']}
        loop={Infinity} // Infinite looping of the words
        cursor
        cursorStyle="|" // Custom cursor style
        typeSpeed={100}  // Speed of typing each character
        deleteSpeed={80} // Speed of deleting each character
        delaySpeed={2000} // Delay before typing the next word
      />
      </h1>
    </h1>
  );
};

export default TypingEffect;
