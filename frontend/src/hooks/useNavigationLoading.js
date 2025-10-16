import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to manage loading states during navigation
 * Completely prevents loading flashes during route changes
 */
export const useNavigationLoading = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const location = useLocation();

  useEffect(() => {
    // If we're changing routes, mark as navigating
    if (location.pathname !== currentPath && currentPath !== '') {
      setIsNavigating(true);
      
      // Longer delay to ensure loading messages don't flash during navigation
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 300);

      return () => clearTimeout(timer);
    }
    
    setCurrentPath(location.pathname);
  }, [location.pathname, currentPath]);

  return { isNavigating };
};

/**
 * Hook for components to use seamless loading
 * Prevents loading messages during navigation
 */
export const useSeamlessComponentLoading = (componentLoading = false) => {
  const { isNavigating } = useNavigationLoading();
  
  // Don't show loading if we're navigating between routes
  const shouldShowLoading = componentLoading && !isNavigating;
  
  return shouldShowLoading;
};
