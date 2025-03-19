import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-tokyo-fg-dark">
      <div className="relative w-12 h-12 mb-4">
        <div className="w-12 h-12 rounded-full absolute border-4 border-tokyo-terminal-blue/30"></div>
        <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-transparent border-t-tokyo-terminal-blue"></div>
      </div>
      <p className="text-sm">Analyzing content...</p>
    </div>
  );
};

export default LoadingIndicator;