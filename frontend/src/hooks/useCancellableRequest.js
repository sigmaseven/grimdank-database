import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * Custom hook for managing cancellable requests
 * Prevents race conditions and memory leaks by cancelling previous requests
 */
export const useCancellableRequest = () => {
  const abortControllerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const makeRequest = useCallback(async (url, options = {}) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      // Don't throw error if request was cancelled
      if (error.name === 'AbortError') {
        return null; // Indicate request was cancelled
      }
      throw error;
    }
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return { makeRequest, cancelRequest };
};

/**
 * Custom hook for debounced search with cancellation
 */
export const useDebouncedSearch = (searchFn, delay = 300) => {
  const timeoutRef = useRef(null);
  const { makeRequest, cancelRequest } = useCancellableRequest();

  const debouncedSearch = useCallback((query, ...args) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Cancel any in-flight requests
    cancelRequest();

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        await searchFn(query, makeRequest, ...args);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Search error:', error);
        }
      }
    }, delay);
  }, [searchFn, delay, makeRequest, cancelRequest]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      cancelRequest();
    };
  }, [cancelRequest]);

  return { debouncedSearch, cancelRequest };
};

/**
 * Custom hook for managing loading states with cancellation
 */
export const useLoadingState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { makeRequest, cancelRequest } = useCancellableRequest();

  const executeWithLoading = useCallback(async (asyncFn, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFn(makeRequest, ...args);
      return result;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'An error occurred');
        throw err;
      }
      return null; // Request was cancelled
    } finally {
      setLoading(false);
    }
  }, [makeRequest]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequest();
    };
  }, [cancelRequest]);

  return {
    loading,
    error,
    executeWithLoading,
    resetError,
    cancelRequest,
  };
};
