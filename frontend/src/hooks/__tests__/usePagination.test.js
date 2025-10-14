import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../usePagination';

describe('usePagination Hook', () => {
  test('initializes with default values', () => {
    const { result } = renderHook(() => usePagination(50, [50, 100, 200]));
    
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(50);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.loading).toBe(false);
    expect(result.current.skip).toBe(0);
  });

  test('handles page changes', () => {
    const { result } = renderHook(() => usePagination(50, [50, 100, 200]));
    
    act(() => {
      result.current.handlePageChange(3);
    });
    
    expect(result.current.currentPage).toBe(3);
    expect(result.current.skip).toBe(100); // (3-1) * 50
  });

  test('handles page size changes', () => {
    const { result } = renderHook(() => usePagination(50, [50, 100, 200]));
    
    act(() => {
      result.current.handlePageSizeChange(100);
    });
    
    expect(result.current.pageSize).toBe(100);
    expect(result.current.currentPage).toBe(1); // Should reset to page 1
    expect(result.current.skip).toBe(0);
  });

  test('updates total items and calculates total pages', () => {
    const { result } = renderHook(() => usePagination(50, [50, 100, 200]));
    
    act(() => {
      result.current.updateTotalItems(150);
    });
    
    expect(result.current.totalItems).toBe(150);
    expect(result.current.totalPages).toBe(3); // 150 / 50 = 3
  });

  test('resets pagination', () => {
    const { result } = renderHook(() => usePagination(50, [50, 100, 200]));
    
    // Change some values first
    act(() => {
      result.current.handlePageChange(3);
      result.current.handlePageSizeChange(100);
      result.current.updateTotalItems(200);
    });
    
    // Reset
    act(() => {
      result.current.resetPagination();
    });
    
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(50);
    expect(result.current.skip).toBe(0);
  });

  test('calculates skip correctly', () => {
    const { result } = renderHook(() => usePagination(25, [25, 50, 100]));
    
    act(() => {
      result.current.handlePageChange(5);
    });
    
    expect(result.current.skip).toBe(100); // (5-1) * 25
  });

  test('handles edge cases', () => {
    const { result } = renderHook(() => usePagination(50, [50, 100, 200]));
    
    // Test with zero total items
    act(() => {
      result.current.updateTotalItems(0);
    });
    
    expect(result.current.totalPages).toBe(0);
    
    // Test with negative page
    act(() => {
      result.current.handlePageChange(-1);
    });
    
    expect(result.current.currentPage).toBe(1); // Should not go below 1
  });

  test('maintains page size options', () => {
    const { result } = renderHook(() => usePagination(50, [25, 50, 100, 200]));
    
    expect(result.current.pageSizeOptions).toEqual([25, 50, 100, 200]);
  });
});
