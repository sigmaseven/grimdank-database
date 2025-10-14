import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Rules from '../Rules';
import { rulesAPI } from '../../services/api';

// Mock the API
jest.mock('../../services/api');
const mockedRulesAPI = rulesAPI;

// Mock the Pagination component
jest.mock('../Pagination', () => {
  return function MockPagination({ currentPage, totalPages, onPageChange }) {
    return (
      <div data-testid="pagination">
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
      </div>
    );
  };
});

describe('Rules Component', () => {
  const mockRules = [
    {
      id: '1',
      name: 'Bolter Discipline',
      description: 'A Space Marine rule',
      type: 'Passive',
      points: [5, 10, 15]
    },
    {
      id: '2',
      name: 'And They Shall Know No Fear',
      description: 'A Space Marine rule',
      type: 'Passive',
      points: [3, 6, 9]
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedRulesAPI.getAll.mockResolvedValue(mockRules);
    mockedRulesAPI.create.mockResolvedValue({ id: '3', name: 'New Rule' });
    mockedRulesAPI.update.mockResolvedValue({ id: '1', name: 'Updated Rule' });
    mockedRulesAPI.delete.mockResolvedValue({});
  });

  test('renders rules list', async () => {
    render(<Rules />);
    
    await waitFor(() => {
      expect(screen.getByText('Bolter Discipline')).toBeInTheDocument();
      expect(screen.getByText('And They Shall Know No Fear')).toBeInTheDocument();
    });
  });

  test('displays rule information correctly', async () => {
    render(<Rules />);
    
    await waitFor(() => {
      expect(screen.getByText('Bolter Discipline')).toBeInTheDocument();
      expect(screen.getByText('A Space Marine rule')).toBeInTheDocument();
      expect(screen.getByText('Passive')).toBeInTheDocument();
    });
  });

  test('opens form when Add New Rule button is clicked', async () => {
    render(<Rules />);
    
    const addButton = screen.getByText('Add New Rule');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Add Rule')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  test('submits new rule form', async () => {
    const user = userEvent.setup();
    render(<Rules />);
    
    // Open form
    fireEvent.click(screen.getByText('Add New Rule'));
    
    // Fill form
    await user.type(screen.getByLabelText('Name'), 'New Rule');
    await user.type(screen.getByLabelText('Description'), 'A new rule');
    await user.type(screen.getByLabelText('Type'), 'Defensive');
    
    // Submit form
    fireEvent.click(screen.getByText('Save Rule'));
    
    await waitFor(() => {
      expect(mockedRulesAPI.create).toHaveBeenCalledWith({
        name: 'New Rule',
        description: 'A new rule',
        type: 'Defensive',
        points: []
      });
    });
  });

  test('opens edit form when edit button is clicked', async () => {
    render(<Rules />);
    
    await waitFor(() => {
      expect(screen.getByText('Bolter Discipline')).toBeInTheDocument();
    });
    
    const editButtons = screen.getAllByTitle('Edit');
    fireEvent.click(editButtons[0]);
    
    expect(screen.getByDisplayValue('Bolter Discipline')).toBeInTheDocument();
    expect(screen.getByText('Edit Rule')).toBeInTheDocument();
  });

  test('deletes rule when delete button is clicked', async () => {
    window.confirm = jest.fn(() => true);
    render(<Rules />);
    
    await waitFor(() => {
      expect(screen.getByText('Bolter Discipline')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this rule?');
    await waitFor(() => {
      expect(mockedRulesAPI.delete).toHaveBeenCalledWith('1');
    });
  });

  test('searches rules by name', async () => {
    const user = userEvent.setup();
    render(<Rules />);
    
    await waitFor(() => {
      expect(screen.getByText('Bolter Discipline')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search rules...');
    await user.type(searchInput, 'Bolter');
    
    await waitFor(() => {
      expect(mockedRulesAPI.getAll).toHaveBeenCalledWith({ name: 'Bolter' });
    });
  });

  test('displays error message when API fails', async () => {
    mockedRulesAPI.getAll.mockRejectedValue(new Error('API Error'));
    render(<Rules />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load rules')).toBeInTheDocument();
    });
  });

  test('handles empty rules list', async () => {
    mockedRulesAPI.getAll.mockResolvedValue([]);
    render(<Rules />);
    
    await waitFor(() => {
      expect(screen.getByText('No rules found')).toBeInTheDocument();
    });
  });
});
