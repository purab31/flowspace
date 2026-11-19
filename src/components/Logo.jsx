import React from 'react';

const Logo = ({ className = "" }) => {
  return (
    <div className={`relative w-8 h-8 flex items-end justify-start ${className}`}>
      {/* Tier 1: Top/Outer (Lime Green) */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-8 border-l-8 border-[#92D050]" />
      
      {/* Tier 2: Middle-Outer (Green) */}
      <div className="absolute top-2 left-2 w-6 h-6 border-t-8 border-l-8 border-[#00B050]" />
      
      {/* Tier 3: Middle-Inner (Dark Green) */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-8 border-l-8 border-[#008037]" />
      
      {/* Tier 4: Center (Deep Green Square) */}
      <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#004D21]" />
    </div>
  );
};

export default Logo;
