import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition component provides seamless transitions between pages
 * by managing loading states globally and preventing loading flashes
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(location.pathname);

  useEffect(() => {
    // Only show transition if we're actually changing routes
    if (location.pathname !== currentLocation) {
      setIsTransitioning(true);
      
      // Use a longer transition to completely mask loading flashes
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentLocation(location.pathname);
      }, 250); // Longer delay to ensure no loading flashes are visible

      return () => clearTimeout(timer);
    }
  }, [location.pathname, currentLocation]);

  return (
    <div className={`page-transition ${isTransitioning ? 'transitioning' : ''}`}>
      {children}
    </div>
  );
};

export default PageTransition;
