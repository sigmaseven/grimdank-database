import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for seamless loading states that don't flash during navigation
 * Provides smooth transitions by managing loading states intelligently
 */
export const useSeamlessLoading = (initialLoading = false) => {
  const [loading, setLoading] = useState(initialLoading);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const loadingTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // Smart loading state management
  const setLoadingState = (newLoading, delay = 0) => {
    if (!mountedRef.current) return;

    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    if (newLoading) {
      // For initial loads, show loading immediately
      if (isInitialLoad) {
        setLoading(true);
      } else {
        // For subsequent loads, add a small delay to prevent flashing
        // during quick navigation
        loadingTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setLoading(true);
          }
        }, delay);
      }
    } else {
      // Clear any pending loading timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setLoading(false);
      
      // Mark that we've completed the initial load
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  };

  // Reset initial load state (useful when navigating to a new page)
  const resetInitialLoad = () => {
    setIsInitialLoad(true);
    setLoading(false);
  };

  return {
    loading,
    setLoading: setLoadingState,
    resetInitialLoad,
    isInitialLoad
  };
};

/**
 * Hook for managing data loading with seamless transitions
 */
export const useSeamlessDataLoading = (loadFunction, dependencies = []) => {
  const { loading, setLoading, resetInitialLoad, isInitialLoad } = useSeamlessLoading();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load data with seamless loading
  const loadData = async (showLoading = true) => {
    if (!mountedRef.current) return;

    try {
      if (showLoading) {
        setLoading(true, isInitialLoad ? 0 : 150); // Delay for non-initial loads
      }
      
      const result = await loadFunction();
      
      if (mountedRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        setData(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Auto-load when dependencies change
  useEffect(() => {
    loadData();
  }, dependencies);

  return {
    data,
    loading,
    error,
    loadData,
    resetInitialLoad,
    setLoading
  };
};

