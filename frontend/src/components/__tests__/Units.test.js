import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Units from '../Units';
import { unitsAPI, rulesAPI } from '../../services/api';

// Mock the API
jest.mock('../../services/api');
const mockedUnitsAPI = unitsAPI;
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

describe('Units Component', () => {
  const mockUnits = [
    {
      id: '1',
      name: 'Space Marine',
      type: 'Infantry',
      melee: 3,
      ranged: 3,
      morale: 7,
      defense: 3,
      points: 100,
      amount: 5,
      max: 10,
      rules: []
    },
    {
      id: '2',
      name: 'Terminator',
      type: 'Elite',
      melee: 4,
      ranged: 4,
      morale: 8,
      defense: 4,
      points: 200,
      amount: 3,
      max: 5,
      rules: []
    }
  ];

  const mockRules = [
    {
      id: '1',
      name: 'Bolter Discipline',
      type: 'Passive',
      points: [5, 10, 15]
    },
    {
      id: '2',
      name: 'And They Shall Know No Fear',
      type: 'Passive',
      points: [3, 6, 9]
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUnitsAPI.getAll.mockResolvedValue(mockUnits);
    mockedUnitsAPI.create.mockResolvedValue({ id: '3', name: 'New Unit' });
    mockedUnitsAPI.update.mockResolvedValue({ id: '1', name: 'Updated Unit' });
    mockedUnitsAPI.delete.mockResolvedValue({});
    mockedRulesAPI.getAll.mockResolvedValue(mockRules);
  });

  test('renders units list with new stats', async () => {
    render(<Units />);
    
    await waitFor(() => {
      expect(screen.getByText('Space Marine')).toBeInTheDocument();
      expect(screen.getByText('Terminator')).toBeInTheDocument();
    });
  });

  test('displays unit stats correctly', async () => {
    render(<Units />);
    
    await waitFor(() => {
      expect(screen.getByText('Space Marine')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // Melee
      expect(screen.getByText('7')).toBeInTheDocument(); // Morale
    });
  });

  test('opens form when Add New Unit button is clicked', async () => {
    render(<Units />);
    
    const addButton = screen.getByText('Add New Unit');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Add Unit')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Melee')).toBeInTheDocument();
    expect(screen.getByLabelText('Ranged')).toBeInTheDocument();
    expect(screen.getByLabelText('Morale')).toBeInTheDocument();
    expect(screen.getByLabelText('Defense')).toBeInTheDocument();
  });

  test('submits new unit form with new stats', async () => {
    const user = userEvent.setup();
    render(<Units />);
    
    // Open form
    fireEvent.click(screen.getByText('Add New Unit'));
    
    // Fill form
    await user.type(screen.getByLabelText('Name'), 'New Unit');
    await user.type(screen.getByLabelText('Type'), 'Infantry');
    await user.type(screen.getByLabelText('Melee'), '4');
    await user.type(screen.getByLabelText('Ranged'), '4');
    await user.type(screen.getByLabelText('Morale'), '8');
    await user.type(screen.getByLabelText('Defense'), '4');
    await user.type(screen.getByLabelText('Points'), '150');
    
    // Submit form
    fireEvent.click(screen.getByText('Save Unit'));
    
    await waitFor(() => {
      expect(mockedUnitsAPI.create).toHaveBeenCalledWith({
        name: 'New Unit',
        type: 'Infantry',
        melee: 4,
        ranged: 4,
        morale: 8,
        defense: 4,
        points: 150,
        rules: []
      });
    });
  });

  test('opens edit form when edit button is clicked', async () => {
    render(<Units />);
    
    await waitFor(() => {
      expect(screen.getByText('Space Marine')).toBeInTheDocument();
    });
    
    const editButtons = screen.getAllByTitle('Edit');
    fireEvent.click(editButtons[0]);
    
    expect(screen.getByDisplayValue('Space Marine')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3')).toBeInTheDocument(); // Melee value
    expect(screen.getByText('Edit Unit')).toBeInTheDocument();
  });

  test('deletes unit when delete button is clicked', async () => {
    window.confirm = jest.fn(() => true);
    render(<Units />);
    
    await waitFor(() => {
      expect(screen.getByText('Space Marine')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this unit?');
    await waitFor(() => {
      expect(mockedUnitsAPI.delete).toHaveBeenCalledWith('1');
    });
  });

  test('searches units by name', async () => {
    const user = userEvent.setup();
    render(<Units />);
    
    await waitFor(() => {
      expect(screen.getByText('Space Marine')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search units...');
    await user.type(searchInput, 'Space');
    
    await waitFor(() => {
      expect(mockedUnitsAPI.getAll).toHaveBeenCalledWith({ name: 'Space' });
    });
  });

  test('opens rule selector when Attach Rules button is clicked', async () => {
    render(<Units />);
    
    // Open form first
    fireEvent.click(screen.getByText('Add New Unit'));
    
    // Click Attach Rules button
    fireEvent.click(screen.getByText('+ Attach Rules'));
    
    await waitFor(() => {
      expect(screen.getByText('Select Rules to Attach')).toBeInTheDocument();
      expect(screen.getByText('Bolter Discipline')).toBeInTheDocument();
    });
  });

  test('filters rules for units (all types)', async () => {
    render(<Units />);
    
    // Open form and rule selector
    fireEvent.click(screen.getByText('Add New Unit'));
    fireEvent.click(screen.getByText('+ Attach Rules'));
    
    await waitFor(() => {
      // Should show all rule types for units
      expect(screen.getByText('Bolter Discipline')).toBeInTheDocument();
      expect(screen.getByText('And They Shall Know No Fear')).toBeInTheDocument();
    });
  });

  test('attaches rule to unit', async () => {
    render(<Units />);
    
    // Open form and rule selector
    fireEvent.click(screen.getByText('Add New Unit'));
    fireEvent.click(screen.getByText('+ Attach Rules'));
    
    await waitFor(() => {
      expect(screen.getByText('Bolter Discipline')).toBeInTheDocument();
    });
    
    // Click T1 button for the rule
    const t1Buttons = screen.getAllByText('T1');
    fireEvent.click(t1Buttons[0]);
    
    // Close rule selector
    fireEvent.click(screen.getByText('Close'));
    
    // Check that rule is attached
    expect(screen.getByText('Bolter Discipline')).toBeInTheDocument();
  });

  test('displays error message when API fails', async () => {
    mockedUnitsAPI.getAll.mockRejectedValue(new Error('API Error'));
    render(<Units />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load units')).toBeInTheDocument();
    });
  });

  test('handles empty units list', async () => {
    mockedUnitsAPI.getAll.mockResolvedValue([]);
    render(<Units />);
    
    await waitFor(() => {
      expect(screen.getByText('No units found')).toBeInTheDocument();
    });
  });

  test('validates required fields', async () => {
    render(<Units />);
    
    // Open form
    fireEvent.click(screen.getByText('Add New Unit'));
    
    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Save Unit'));
    
    // Form should not submit (no API call)
    expect(mockedUnitsAPI.create).not.toHaveBeenCalled();
  });
});
