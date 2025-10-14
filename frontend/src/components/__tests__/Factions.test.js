import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Factions from '../Factions';
import { factionsAPI } from '../../services/api';

// Mock the API
jest.mock('../../services/api');
const mockedFactionsAPI = factionsAPI;

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

describe('Factions Component', () => {
  const mockFactions = [
    {
      id: '1',
      name: 'Space Marines',
      description: 'The Emperor\'s finest',
      type: 'Official'
    },
    {
      id: '2',
      name: 'Chaos Space Marines',
      description: 'Traitors to the Imperium',
      type: 'Official'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedFactionsAPI.getAll.mockResolvedValue(mockFactions);
    mockedFactionsAPI.create.mockResolvedValue({ id: '3', name: 'New Faction' });
    mockedFactionsAPI.update.mockResolvedValue({ id: '1', name: 'Updated Faction' });
    mockedFactionsAPI.delete.mockResolvedValue({});
  });

  test('renders factions list', async () => {
    render(<Factions />);
    
    await waitFor(() => {
      expect(screen.getByText('Space Marines')).toBeInTheDocument();
      expect(screen.getByText('Chaos Space Marines')).toBeInTheDocument();
    });
  });

  test('displays faction information correctly', async () => {
    render(<Factions />);
    
    await waitFor(() => {
      expect(screen.getByText('Space Marines')).toBeInTheDocument();
      expect(screen.getByText('The Emperor\'s finest')).toBeInTheDocument();
      expect(screen.getByText('Official')).toBeInTheDocument();
    });
  });

  test('opens form when Add New Faction button is clicked', async () => {
    render(<Factions />);
    
    const addButton = screen.getByText('Add New Faction');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Add Faction')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
  });

  test('submits new faction form', async () => {
    const user = userEvent.setup();
    render(<Factions />);
    
    // Open form
    fireEvent.click(screen.getByText('Add New Faction'));
    
    // Fill form
    await user.type(screen.getByLabelText('Name'), 'New Faction');
    await user.type(screen.getByLabelText('Description'), 'A new faction');
    await user.selectOptions(screen.getByLabelText('Type'), 'Custom');
    
    // Submit form
    fireEvent.click(screen.getByText('Save Faction'));
    
    await waitFor(() => {
      expect(mockedFactionsAPI.create).toHaveBeenCalledWith({
        name: 'New Faction',
        description: 'A new faction',
        type: 'Custom'
      });
    });
  });

  test('opens edit form when edit button is clicked', async () => {
    render(<Factions />);
    
    await waitFor(() => {
      expect(screen.getByText('Space Marines')).toBeInTheDocument();
    });
    
    const editButtons = screen.getAllByTitle('Edit');
    fireEvent.click(editButtons[0]);
    
    expect(screen.getByDisplayValue('Space Marines')).toBeInTheDocument();
    expect(screen.getByText('Edit Faction')).toBeInTheDocument();
  });

  test('deletes faction when delete button is clicked', async () => {
    window.confirm = jest.fn(() => true);
    render(<Factions />);
    
    await waitFor(() => {
      expect(screen.getByText('Space Marines')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this faction?');
    await waitFor(() => {
      expect(mockedFactionsAPI.delete).toHaveBeenCalledWith('1');
    });
  });

  test('searches factions by name', async () => {
    const user = userEvent.setup();
    render(<Factions />);
    
    await waitFor(() => {
      expect(screen.getByText('Space Marines')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search factions...');
    await user.type(searchInput, 'Space');
    
    await waitFor(() => {
      expect(mockedFactionsAPI.getAll).toHaveBeenCalledWith({ name: 'Space' });
    });
  });

  test('displays error message when API fails', async () => {
    mockedFactionsAPI.getAll.mockRejectedValue(new Error('API Error'));
    render(<Factions />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load factions')).toBeInTheDocument();
    });
  });

  test('handles empty factions list', async () => {
    mockedFactionsAPI.getAll.mockResolvedValue([]);
    render(<Factions />);
    
    await waitFor(() => {
      expect(screen.getByText('No factions found')).toBeInTheDocument();
    });
  });

  test('validates required fields', async () => {
    render(<Factions />);
    
    // Open form
    fireEvent.click(screen.getByText('Add New Faction'));
    
    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Save Faction'));
    
    // Form should not submit (no API call)
    expect(mockedFactionsAPI.create).not.toHaveBeenCalled();
  });

  test('clears error message after successful operation', async () => {
    // First make API fail
    mockedFactionsAPI.getAll.mockRejectedValue(new Error('API Error'));
    render(<Factions />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load factions')).toBeInTheDocument();
    });
    
    // Then make API succeed
    mockedFactionsAPI.getAll.mockResolvedValue(mockFactions);
    
    // Trigger a reload (e.g., by clicking refresh or similar action)
    const refreshButton = screen.getByText('Add New Faction');
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Failed to load factions')).not.toBeInTheDocument();
    });
  });

  test('handles form cancellation', async () => {
    render(<Factions />);
    
    // Open form
    fireEvent.click(screen.getByText('Add New Faction'));
    
    // Cancel form
    fireEvent.click(screen.getByText('Cancel'));
    
    // Form should be closed
    expect(screen.queryByText('Add Faction')).not.toBeInTheDocument();
  });
});
