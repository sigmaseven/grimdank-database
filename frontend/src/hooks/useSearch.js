import { useState, useEffect, useRef, useCallback } from 'react';

export const useSearch = (searchFunction, initialSearchTerm = '') => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // If search is empty, search immediately
    if (value === '') {
      searchFunction();
    } else {
      // Debounce search by 300ms
      searchTimeoutRef.current = setTimeout(() => {
        searchFunction();
      }, 300);
    }
  }, [searchFunction]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchFunction();
  }, [searchFunction]);

  return {
    searchTerm,
    searchInputRef,
    handleSearch,
    handleSearchSubmit
  };
};
