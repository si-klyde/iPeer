import React from 'react';
import { PuzzlePieceIcon, SparklesIcon, HeartIcon } from '@heroicons/react/24/outline';

const ProfileCard = () => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
      {/* Connect */}
      <div className="relative w-full bg-n-4/50 rounded-md pt-24 pb-8 px-4 shadow-xl flex flex-col items-center">
        <div className="border-2 border-solid border-black absolute rounded-lg bg-n-1 size-16 md:size-20 p-4 md:p-6 z-10 -top-8 shadow-xl">
          <div className="bg-transparent w-full h-full overflow-auto">
            <SparklesIcon className="w-auto h-auto" />
          </div>
        </div>
        <label className="font-bold text-n-1 text-lg">
          Unique Approach
        </label>
        <p className="text-center text-n-8/80 mt-2 leading-relaxed">
          iPeer offers peer support through video calls, messaging, and consultations.       
        </p>
      </div>

      {/* Share */}
      <div className="relative w-full bg-n-4/50 rounded-md pt-24 pb-8 px-4 shadow-xl flex flex-col items-center">
        <div className="border-2 border-solid border-black absolute rounded-lg bg-n-1 size-16 md:size-20 p-4 md:p-6 z-10 -top-8 shadow-xl">
          <div className="bg-transparent w-full h-full overflow-auto">
            <PuzzlePieceIcon className="w-auto h-auto" />
          </div>
        </div>
        <label className="font-bold text-n-1 text-lg">
          Support Network
        </label>
        <p className="text-center text-n-8/80 mt-2 leading-relaxed">
          Access peer support, scheduling, and notifications for personalized care.    
        </p>
      </div>

      {/* Empower */}
      <div className="relative w-full bg-n-4/50 rounded-md pt-24 pb-8 px-4 shadow-xl flex flex-col items-center">
        <div className="border-2 border-solid border-black absolute rounded-lg bg-n-1 size-16 md:size-20 p-4 md:p-6 z-10 -top-8 shadow-xl">
          <div className="bg-transparent w-full h-full overflow-auto">
            <HeartIcon className="w-auto h-auto" />
          </div>
        </div>
        <label className="font-bold text-n-1 text-lg">
          Holistic Care
        </label>
        <p className="text-center text-n-8/80 mt-2 leading-relaxed">
          Stay informed with mental health resources, events, and emergency hotlines.
        </p>
      </div>
    </div>
  );
};

export default ProfileCard;
