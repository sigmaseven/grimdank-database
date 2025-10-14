import React from 'react';

function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  pageSize, 
  onPageSizeChange, 
  totalItems,
  pageSizeOptions = [50, 100, 200] 
}) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handlePageSizeChange = (newSize) => {
    onPageSizeChange(parseInt(newSize));
  };

  if (totalPages <= 1) {
    return (
      <div className="pagination-container">
        <div className="pagination-info">
          Showing {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </div>
        <div className="pagination-controls">
          <label htmlFor="page-size-select" className="pagination-label">
            Items per page:
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(e.target.value)}
            className="pagination-select"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing {startItem}-{endItem} of {totalItems} items
      </div>
      
      <div className="pagination-controls">
        <div className="pagination-buttons">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="pagination-btn pagination-btn-first"
            title="First page"
          >
            ««
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn pagination-btn-prev"
            title="Previous page"
          >
            «
          </button>
          
          <div className="pagination-page-numbers">
            {(() => {
              const pages = [];
              const maxVisiblePages = 5;
              let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
              let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
              
              if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
              }
              
              if (startPage > 1) {
                pages.push(
                  <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="pagination-btn pagination-btn-number"
                  >
                    1
                  </button>
                );
                if (startPage > 2) {
                  pages.push(
                    <span key="ellipsis1" className="pagination-ellipsis">...</span>
                  );
                }
              }
              
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`pagination-btn pagination-btn-number ${
                      i === currentPage ? 'pagination-btn-active' : ''
                    }`}
                  >
                    {i}
                  </button>
                );
              }
              
              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  pages.push(
                    <span key="ellipsis2" className="pagination-ellipsis">...</span>
                  );
                }
                pages.push(
                  <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className="pagination-btn pagination-btn-number"
                  >
                    {totalPages}
                  </button>
                );
              }
              
              return pages;
            })()}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn pagination-btn-next"
            title="Next page"
          >
            »
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="pagination-btn pagination-btn-last"
            title="Last page"
          >
            »»
          </button>
        </div>
        
        <div className="pagination-page-size">
          <label htmlFor="page-size-select" className="pagination-label">
            Items per page:
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(e.target.value)}
            className="pagination-select"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default Pagination;

