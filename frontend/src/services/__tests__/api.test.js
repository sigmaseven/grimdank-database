import { 
  rulesAPI, 
  weaponsAPI, 
  wargearAPI, 
  unitsAPI, 
  factionsAPI, 
  armyBooksAPI, 
  armyListsAPI 
} from '../api';

// Mock axios
jest.mock('axios');
import axios from 'axios';

const mockedAxios = axios;

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rules API', () => {
    test('should get all rules', async () => {
      const mockRules = [{ id: '1', name: 'Test Rule' }];
      mockedAxios.get.mockResolvedValue({ data: mockRules });

      const result = await rulesAPI.getAll();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/rules');
      expect(result).toEqual(mockRules);
    });

    test('should get rule by id', async () => {
      const mockRule = { id: '1', name: 'Test Rule' };
      mockedAxios.get.mockResolvedValue({ data: mockRule });

      const result = await rulesAPI.get('1');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/rules/1');
      expect(result).toEqual(mockRule);
    });

    test('should create rule', async () => {
      const newRule = { name: 'New Rule', type: 'Defensive' };
      const mockResponse = { id: '1', ...newRule };
      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await rulesAPI.create(newRule);

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/rules', newRule);
      expect(result).toEqual(mockResponse);
    });

    test('should update rule', async () => {
      const updatedRule = { id: '1', name: 'Updated Rule' };
      mockedAxios.put.mockResolvedValue({ data: updatedRule });

      const result = await rulesAPI.update('1', updatedRule);

      expect(mockedAxios.put).toHaveBeenCalledWith('/api/v1/rules/1', updatedRule);
      expect(result).toEqual(updatedRule);
    });

    test('should delete rule', async () => {
      mockedAxios.delete.mockResolvedValue({ data: {} });

      await rulesAPI.delete('1');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/v1/rules/1');
    });
  });

  describe('Weapons API', () => {
    test('should get all weapons', async () => {
      const mockWeapons = [{ id: '1', name: 'Test Weapon' }];
      mockedAxios.get.mockResolvedValue({ data: mockWeapons });

      const result = await weaponsAPI.getAll();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/weapons');
      expect(result).toEqual(mockWeapons);
    });

    test('should create weapon', async () => {
      const newWeapon = { name: 'New Weapon', type: 'Ranged' };
      const mockResponse = { id: '1', ...newWeapon };
      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await weaponsAPI.create(newWeapon);

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/weapons', newWeapon);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Units API', () => {
    test('should get all units', async () => {
      const mockUnits = [{ id: '1', name: 'Test Unit' }];
      mockedAxios.get.mockResolvedValue({ data: mockUnits });

      const result = await unitsAPI.getAll();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/units');
      expect(result).toEqual(mockUnits);
    });

    test('should create unit with new stats', async () => {
      const newUnit = { 
        name: 'New Unit', 
        type: 'Infantry',
        melee: 3,
        ranged: 3,
        morale: 7,
        defense: 3,
        points: 100
      };
      const mockResponse = { id: '1', ...newUnit };
      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await unitsAPI.create(newUnit);

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/units', newUnit);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Factions API', () => {
    test('should get all factions', async () => {
      const mockFactions = [{ id: '1', name: 'Test Faction' }];
      mockedAxios.get.mockResolvedValue({ data: mockFactions });

      const result = await factionsAPI.getAll();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/factions');
      expect(result).toEqual(mockFactions);
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      const error = new Error('Network Error');
      mockedAxios.get.mockRejectedValue(error);

      await expect(rulesAPI.getAll()).rejects.toThrow('Network Error');
    });
  });
});
