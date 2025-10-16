import React, { useState, useEffect } from 'react';
import { useNavigationLoading } from '../hooks/useNavigationLoading';

/**
 * InstantContent component ensures instant content display
 * by managing loading states intelligently during navigation
 */
const InstantContent = ({ 
  loading, 
  children,
  loadingMessage = 'Loading...',
  className = 'loading'
}) => {
  const { isNavigating } = useNavigationLoading();
  const [hasEverLoaded, setHasEverLoaded] = useState(false);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    // If we're navigating, always show content immediately
    if (isNavigating) {
      setShowContent(true);
      return;
    }

    // If not navigating and loading, hide content briefly
    if (loading && hasEverLoaded) {
      setShowContent(false);
    } else {
      setShowContent(true);
    }

    // Mark that we've loaded content at least once
    if (!loading && !hasEverLoaded) {
      setHasEverLoaded(true);
    }
  }, [loading, isNavigating, hasEverLoaded]);

  // During navigation, always show children (even if loading)
  if (isNavigating) {
    return children;
  }

  // If loading and we should show loading message, show it
  if (loading && !showContent) {
    return <div className={className}>{loadingMessage}</div>;
  }

  // Otherwise show children
  return children;
};

export default InstantContent;

