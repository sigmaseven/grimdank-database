import React, { useState, useEffect } from 'react';

/**
 * InvisibleLoading component renders nothing during loading states
 * Completely eliminates loading message flashes during navigation
 */
const InvisibleLoading = ({ 
  loading, 
  children,
  fallback = null // What to show when loading (default: nothing)
}) => {
  const [shouldShowContent, setShouldShowContent] = useState(true);

  useEffect(() => {
    if (loading) {
      // When loading starts, immediately hide content
      setShouldShowContent(false);
    } else {
      // When loading ends, show content
      setShouldShowContent(true);
    }
  }, [loading]);

  // If loading, show fallback (which defaults to null/nothing)
  if (loading) {
    return fallback;
  }

  // If not loading, show children
  return shouldShowContent ? children : null;
};

export default InvisibleLoading;

