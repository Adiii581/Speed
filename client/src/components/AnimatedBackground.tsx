import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(255, 237, 213, 0.3) 0%, transparent 60%),
            radial-gradient(circle at 80% 20%, rgba(255, 220, 177, 0.25) 0%, transparent 60%),
            radial-gradient(circle at 40% 40%, rgba(254, 215, 170, 0.2) 0%, transparent 60%),
            linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 250, 245, 0.8) 30%, rgba(255, 237, 213, 0.5) 70%, rgba(254, 215, 170, 0.4) 100%)
          `
        }}
      />
      
      {/* Animated Network SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ 
          animation: 'float 20s ease-in-out infinite',
          transformOrigin: 'center'
        }}
      >
        <defs>
          <style>
            {`
              @keyframes float {
                0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
                33% { transform: translate(30px, -30px) rotate(120deg); }
                66% { transform: translate(-20px, 20px) rotate(240deg); }
              }
              
              @keyframes pulse {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.7; }
              }
              
              @keyframes flow {
                0% { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: 20; }
              }
              
              .network-line {
                stroke: rgba(251, 146, 60, 0.7);
                stroke-width: 1.5;
                fill: none;
                stroke-dasharray: 5, 5;
                animation: flow 3s linear infinite;
              }
              
              .network-dot {
                fill: rgba(251, 146, 60, 0.8);
                animation: pulse 4s ease-in-out infinite;
              }
              
              .network-dot:nth-child(2n) {
                animation-delay: -1s;
              }
              
              .network-dot:nth-child(3n) {
                animation-delay: -2s;
              }
            `}
          </style>
        </defs>
        
        {/* Network of connected lines and dots */}
        {/* Top section */}
        <line className="network-line" x1="10%" y1="20%" x2="30%" y2="15%" />
        <line className="network-line" x1="30%" y1="15%" x2="60%" y2="25%" />
        <line className="network-line" x1="60%" y1="25%" x2="85%" y2="10%" />
        <line className="network-line" x1="85%" y1="10%" x2="90%" y2="30%" />
        
        {/* Middle section */}
        <line className="network-line" x1="5%" y1="50%" x2="25%" y2="45%" />
        <line className="network-line" x1="25%" y1="45%" x2="45%" y2="55%" />
        <line className="network-line" x1="45%" y1="55%" x2="70%" y2="40%" />
        <line className="network-line" x1="70%" y1="40%" x2="95%" y2="60%" />
        
        {/* Connecting verticals */}
        <line className="network-line" x1="30%" y1="15%" x2="25%" y2="45%" />
        <line className="network-line" x1="60%" y1="25%" x2="70%" y2="40%" />
        <line className="network-line" x1="85%" y1="10%" x2="95%" y2="60%" />
        
        {/* Bottom section */}
        <line className="network-line" x1="15%" y1="80%" x2="40%" y2="75%" />
        <line className="network-line" x1="40%" y1="75%" x2="65%" y2="85%" />
        <line className="network-line" x1="65%" y1="85%" x2="80%" y2="70%" />
        
        {/* More connections */}
        <line className="network-line" x1="25%" y1="45%" x2="40%" y2="75%" />
        <line className="network-line" x1="45%" y1="55%" x2="65%" y2="85%" />
        <line className="network-line" x1="70%" y1="40%" x2="80%" y2="70%" />
        
        {/* Incomplete shapes - triangular formations */}
        <line className="network-line" x1="20%" y1="30%" x2="35%" y2="50%" />
        <line className="network-line" x1="35%" y1="50%" x2="50%" y2="35%" />
        
        <line className="network-line" x1="75%" y1="55%" x2="85%" y2="75%" />
        <line className="network-line" x1="85%" y1="75%" x2="95%" y2="55%" />
        
        {/* Dots at intersection points */}
        <circle className="network-dot" cx="10%" cy="20%" r="2" />
        <circle className="network-dot" cx="30%" cy="15%" r="3" />
        <circle className="network-dot" cx="60%" cy="25%" r="2" />
        <circle className="network-dot" cx="85%" cy="10%" r="3" />
        <circle className="network-dot" cx="90%" cy="30%" r="2" />
        
        <circle className="network-dot" cx="5%" cy="50%" r="2" />
        <circle className="network-dot" cx="25%" cy="45%" r="3" />
        <circle className="network-dot" cx="45%" cy="55%" r="2" />
        <circle className="network-dot" cx="70%" cy="40%" r="3" />
        <circle className="network-dot" cx="95%" cy="60%" r="2" />
        
        <circle className="network-dot" cx="15%" cy="80%" r="2" />
        <circle className="network-dot" cx="40%" cy="75%" r="3" />
        <circle className="network-dot" cx="65%" cy="85%" r="2" />
        <circle className="network-dot" cx="80%" cy="70%" r="3" />
        
        {/* Additional floating dots */}
        <circle className="network-dot" cx="20%" cy="30%" r="1.5" />
        <circle className="network-dot" cx="35%" cy="50%" r="1.5" />
        <circle className="network-dot" cx="50%" cy="35%" r="1.5" />
        <circle className="network-dot" cx="75%" cy="55%" r="1.5" />
        <circle className="network-dot" cx="85%" cy="75%" r="1.5" />
        <circle className="network-dot" cx="95%" cy="55%" r="1.5" />
      </svg>
      
      {/* Secondary animated layer for depth */}
      <svg
        className="absolute inset-0 w-full h-full opacity-50"
        style={{ 
          animation: 'float 25s ease-in-out infinite reverse',
          transformOrigin: 'center'
        }}
      >
        <line className="network-line" x1="0%" y1="40%" x2="20%" y2="60%" />
        <line className="network-line" x1="20%" y1="60%" x2="50%" y2="45%" />
        <line className="network-line" x1="80%" y1="80%" x2="100%" y2="70%" />
        <line className="network-line" x1="100%" y1="30%" x2="75%" y2="45%" />
        
        <circle className="network-dot" cx="0%" cy="40%" r="1.5" />
        <circle className="network-dot" cx="20%" cy="60%" r="2" />
        <circle className="network-dot" cx="50%" cy="45%" r="1.5" />
        <circle className="network-dot" cx="80%" cy="80%" r="2" />
        <circle className="network-dot" cx="100%" cy="70%" r="1.5" />
        <circle className="network-dot" cx="100%" cy="30%" r="1.5" />
        <circle className="network-dot" cx="75%" cy="45%" r="2" />
      </svg>
    </div>
  );
};

export default AnimatedBackground;