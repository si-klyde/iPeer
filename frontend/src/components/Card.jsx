import React from 'react';
import { PuzzlePieceIcon, SparklesIcon, HeartIcon } from '@heroicons/react/24/outline';

const ProfileCard = () => {
  return (
    <>
      {/* Connect */}
      <div className="mx-5 relative w-[30rem] md:w-[25rem] sm:w-full h-full bg-n-4/50 rounded-md pt-24 pb-8 px-4 shadow-xl flex flex-col items-center">
        <div className="border-2 border-solid border-black absolute rounded-lg bg-n-1 size-20 p-6 z-10 -top-8 shadow-xl">
          <div className="bg-transparent w-full h-full overflow-auto">
            <SparklesIcon className="w-auto h-auto" />
          </div>
        </div>
        <label className="font-bold text-n-1 text-lg">
          Unique Approach
        </label>
        <p className="text-center text-n-8/60 mt-2 leading-relaxed">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </p>
      </div>

      {/* Share */}
      <div className="mx-5 relative w-[30rem] md:w-[25rem] sm:w-full h-full bg-n-4/50 rounded-md pt-24 pb-8 px-4 shadow-xl flex flex-col items-center">
        <div className="border-2 border-solid border-black absolute rounded-lg bg-n-1 size-20 p-6 z-10 -top-8 shadow-xl">
          <div className="bg-transparent w-full h-full overflow-auto">
            <PuzzlePieceIcon className="w-auto h-auto" />
          </div>
        </div>
        <label className="font-bold text-n-1 text-lg">
          Support Network
        </label>
        <p className="text-center text-n-8/60 mt-2 leading-relaxed">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </p>
      </div>

      {/* Empower */}
      <div className="mx-5 relative w-[30rem] md:w-[25rem] sm:w-full h-full bg-n-4/50 rounded-md pt-24 pb-8 px-4 shadow-xl flex flex-col items-center">
        <div className="border-2 border-solid border-black absolute rounded-lg bg-n-1 size-20 p-6 z-10 -top-8 shadow-xl">
          <div className="bg-transparent w-full h-full overflow-auto">
            <HeartIcon className="w-auto h-auto" />
          </div>
        </div>
        <label className="font-bold text-n-1 text-lg">
          Holistic Care
        </label>
        <p className="text-center text-n-8/60 mt-2 leading-relaxed">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </p>
      </div>
    </>
  );
};

export default ProfileCard;
