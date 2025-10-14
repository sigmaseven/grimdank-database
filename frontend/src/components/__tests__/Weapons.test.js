import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Weapons from '../Weapons';
import { weaponsAPI, rulesAPI } from '../../services/api';

// Mock the API
jest.mock('../../services/api');
const mockedWeaponsAPI = weaponsAPI;
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

// Mock the WeaponPointsCalculator component
jest.mock('../WeaponPointsCalculator', () => {
  return function MockWeaponPointsCalculator({ onPointsCalculated }) {
    return (
      <div data-testid="weapon-points-calculator">
        <button onClick={() => onPointsCalculated(50)}>Calculate Points</button>
      </div>
    );
  };
});

describe('Weapons Component', () => {
  const mockWeapons = [
    {
      id: '1',
      name: 'Bolter',
      type: 'Ranged',
      range: 24,
      ap: '0',
      attacks: 1,
      points: 10,
      rules: []
    },
    {
      id: '2',
      name: 'Power Sword',
      type: 'Melee',
      range: 0,
      ap: '-3',
      attacks: 1,
      points: 15,
      rules: []
    }
  ];

  const mockRules = [
    {
      id: '1',
      name: 'Rapid Fire',
      type: 'Offensive',
      points: [5, 10, 15]
    },
    {
      id: '2',
      name: 'Power Weapon',
      type: 'Passive',
      points: [3, 6, 9]
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedWeaponsAPI.getAll.mockResolvedValue(mockWeapons);
    mockedWeaponsAPI.create.mockResolvedValue({ id: '3', name: 'New Weapon' });
    mockedWeaponsAPI.update.mockResolvedValue({ id: '1', name: 'Updated Weapon' });
    mockedWeaponsAPI.delete.mockResolvedValue({});
    mockedRulesAPI.getAll.mockResolvedValue(mockRules);
  });

  test('renders weapons list', async () => {
    render(<Weapons />);
    
    await waitFor(() => {
      expect(screen.getByText('Bolter')).toBeInTheDocument();
      expect(screen.getByText('Power Sword')).toBeInTheDocument();
    });
  });

  test('displays weapon information correctly', async () => {
    render(<Weapons />);
    
    await waitFor(() => {
      expect(screen.getByText('Bolter')).toBeInTheDocument();
      expect(screen.getByText('Ranged')).toBeInTheDocument();
      expect(screen.getByText('24')).toBeInTheDocument(); // Range
      expect(screen.getByText('0')).toBeInTheDocument(); // AP
    });
  });

  test('opens form when Add New Weapon button is clicked', async () => {
    render(<Weapons />);
    
    const addButton = screen.getByText('Add New Weapon');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Add Weapon')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Range')).toBeInTheDocument();
    expect(screen.getByLabelText('AP')).toBeInTheDocument();
    expect(screen.getByLabelText('Attacks')).toBeInTheDocument();
  });

  test('submits new weapon form', async () => {
    const user = userEvent.setup();
    render(<Weapons />);
    
    // Open form
    fireEvent.click(screen.getByText('Add New Weapon'));
    
    // Fill form
    await user.type(screen.getByLabelText('Name'), 'New Weapon');
    await user.type(screen.getByLabelText('Type'), 'Ranged');
    await user.type(screen.getByLabelText('Range'), '30');
    await user.type(screen.getByLabelText('AP'), '-1');
    await user.type(screen.getByLabelText('Attacks'), '2');
    await user.type(screen.getByLabelText('Points'), '25');
    
    // Submit form
    fireEvent.click(screen.getByText('Save Weapon'));
    
    await waitFor(() => {
      expect(mockedWeaponsAPI.create).toHaveBeenCalledWith({
        name: 'New Weapon',
        type: 'Ranged',
        range: 30,
        ap: '-1',
        attacks: 2,
        points: 25,
        rules: []
      });
    });
  });

  test('opens edit form when edit button is clicked', async () => {
    render(<Weapons />);
    
    await waitFor(() => {
      expect(screen.getByText('Bolter')).toBeInTheDocument();
    });
    
    const editButtons = screen.getAllByTitle('Edit');
    fireEvent.click(editButtons[0]);
    
    expect(screen.getByDisplayValue('Bolter')).toBeInTheDocument();
    expect(screen.getByText('Edit Weapon')).toBeInTheDocument();
  });

  test('deletes weapon when delete button is clicked', async () => {
    window.confirm = jest.fn(() => true);
    render(<Weapons />);
    
    await waitFor(() => {
      expect(screen.getByText('Bolter')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this weapon?');
    await waitFor(() => {
      expect(mockedWeaponsAPI.delete).toHaveBeenCalledWith('1');
    });
  });

  test('searches weapons by name', async () => {
    const user = userEvent.setup();
    render(<Weapons />);
    
    await waitFor(() => {
      expect(screen.getByText('Bolter')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search weapons...');
    await user.type(searchInput, 'Bolter');
    
    await waitFor(() => {
      expect(mockedWeaponsAPI.getAll).toHaveBeenCalledWith({ name: 'Bolter' });
    });
  });

  test('opens rule selector when Attach Rules button is clicked', async () => {
    render(<Weapons />);
    
    // Open form first
    fireEvent.click(screen.getByText('Add New Weapon'));
    
    // Click Attach Rules button
    fireEvent.click(screen.getByText('+ Attach Rules'));
    
    await waitFor(() => {
      expect(screen.getByText('Select Rules to Attach')).toBeInTheDocument();
      expect(screen.getByText('Rapid Fire')).toBeInTheDocument();
    });
  });

  test('filters rules for weapons (Offensive and Passive)', async () => {
    render(<Weapons />);
    
    // Open form and rule selector
    fireEvent.click(screen.getByText('Add New Weapon'));
    fireEvent.click(screen.getByText('+ Attach Rules'));
    
    await waitFor(() => {
      // Should show Offensive and Passive rules for weapons
      expect(screen.getByText('Rapid Fire')).toBeInTheDocument();
      expect(screen.getByText('Power Weapon')).toBeInTheDocument();
    });
  });

  test('attaches rule to weapon with tier selection', async () => {
    render(<Weapons />);
    
    // Open form and rule selector
    fireEvent.click(screen.getByText('Add New Weapon'));
    fireEvent.click(screen.getByText('+ Attach Rules'));
    
    await waitFor(() => {
      expect(screen.getByText('Rapid Fire')).toBeInTheDocument();
    });
    
    // Click T2 button for the rule
    const t2Buttons = screen.getAllByText('T2');
    fireEvent.click(t2Buttons[0]);
    
    // Close rule selector
    fireEvent.click(screen.getByText('Close'));
    
    // Check that rule is attached
    expect(screen.getByText('Rapid Fire')).toBeInTheDocument();
  });

  test('sorts weapons by different fields', async () => {
    render(<Weapons />);
    
    await waitFor(() => {
      expect(screen.getByText('Bolter')).toBeInTheDocument();
    });
    
    // Click on Name header to sort
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    
    // Should call API with sort parameters
    await waitFor(() => {
      expect(mockedWeaponsAPI.getAll).toHaveBeenCalledWith({ sortField: 'name', sortDirection: 'asc' });
    });
  });

  test('displays error message when API fails', async () => {
    mockedWeaponsAPI.getAll.mockRejectedValue(new Error('API Error'));
    render(<Weapons />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load weapons')).toBeInTheDocument();
    });
  });

  test('handles empty weapons list', async () => {
    mockedWeaponsAPI.getAll.mockResolvedValue([]);
    render(<Weapons />);
    
    await waitFor(() => {
      expect(screen.getByText('No weapons found')).toBeInTheDocument();
    });
  });

  test('validates required fields', async () => {
    render(<Weapons />);
    
    // Open form
    fireEvent.click(screen.getByText('Add New Weapon'));
    
    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Save Weapon'));
    
    // Form should not submit (no API call)
    expect(mockedWeaponsAPI.create).not.toHaveBeenCalled();
  });
});
