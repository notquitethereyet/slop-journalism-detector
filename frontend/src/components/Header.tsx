import React from 'react';
import { HiOutlineSparkles } from 'react-icons/hi';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center space-x-3 mb-3">
        <HiOutlineSparkles className="w-8 h-8 text-tokyo-terminal-cyan" />
        <h1 className="text-4xl font-bold text-tokyo-terminal-cyan">
          Slop Detector
        </h1>
      </div>
      <p className="text-tokyo-fg-dark max-w-xl mx-auto">
        I am just tired of dogshit journalism bro.
      </p>
    </header>
  );
};

export default Header;