import React, { useState, useEffect } from 'react';

/**
 * DelayedLoading component prevents loading flashes by only showing
 * loading messages after a delay, creating seamless transitions
 */
const DelayedLoading = ({ 
  loading, 
  message = 'Loading...', 
  delay = 300,
  children,
  className = 'loading'
}) => {
  const [showLoading, setShowLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    let timeout;

    if (loading) {
      // For initial loads, show loading immediately
      if (isInitialLoad) {
        setShowLoading(true);
      } else {
        // For subsequent loads, delay showing the loading message
        timeout = setTimeout(() => {
          setShowLoading(true);
        }, delay);
      }
    } else {
      // Clear timeout and hide loading
      if (timeout) {
        clearTimeout(timeout);
      }
      setShowLoading(false);
      
      // Mark that we've completed the initial load
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [loading, delay, isInitialLoad]);

  // If loading and we should show the loading message, show it
  if (loading && showLoading) {
    return <div className={className}>{message}</div>;
  }

  // Otherwise, show children or nothing
  return children || null;
};

export default DelayedLoading;

