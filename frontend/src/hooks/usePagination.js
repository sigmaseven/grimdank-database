import { useState, useEffect, useCallback } from 'react';

export const usePagination = (initialPageSize = 50, pageSizeOptions = [50, 100, 200]) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const handlePageSizeChange = useCallback((newPageSize) => {
    const newPageSizeNum = parseInt(newPageSize);
    setPageSize(newPageSizeNum);
    // Reset to first page when page size changes
    setCurrentPage(1);
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setTotalItems(0);
  }, []);

  const updateTotalItems = useCallback((total) => {
    setTotalItems(total);
    // If current page is beyond the new total pages, reset to last valid page
    const newTotalPages = Math.ceil(total / pageSize);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0) {
      // If no pages, reset to page 1
      setCurrentPage(1);
    }
  }, [currentPage, pageSize]);

  // Calculate skip value for API calls
  const skip = (currentPage - 1) * pageSize;

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    loading,
    skip,
    pageSizeOptions,
    setLoading,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
    updateTotalItems,
  };
};

export default usePagination;

