import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  setAuthToken,
  register,
  login,
  logout,
  checkAuthStatus,
  createTribe,
  joinTribe,
  getUserTribes,
} from '../auth';

jest.mock('axios');
const mockAxios = axios;

describe('Auth Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset axios defaults
    delete axios.defaults.headers.common['Authorization'];
  });

  describe('setAuthToken', () => {
    it('should set token in AsyncStorage and axios headers when token is provided', async () => {
      const token = 'test-token';
      await setAuthToken(token);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', token);
      expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
    });

    it('should remove token from AsyncStorage and axios headers when token is null', async () => {
      await setAuthToken(null);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
      expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('register', () => {
    it('should register successfully and set auth token', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          user_id: '123',
        },
      };
      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await register('test@example.com', 'password123');

      expect(mockAxios.post).toHaveBeenCalledWith('http://localhost:5002/api/register', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when registration fails', async () => {
      const errorMessage = 'Registration failed';
      mockAxios.post.mockRejectedValueOnce({
        response: {
          data: {
            error: errorMessage,
          },
        },
      });

      await expect(register('test@example.com', 'password123')).rejects.toEqual(errorMessage);
    });
  });

  describe('login', () => {
    it('should login successfully and set auth token', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          user_id: '123',
        },
      };
      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await login('test@example.com', 'password123');

      expect(mockAxios.post).toHaveBeenCalledWith('http://localhost:5002/api/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when login fails', async () => {
      const errorMessage = 'Login failed';
      mockAxios.post.mockRejectedValueOnce({
        response: {
          data: {
            error: errorMessage,
          },
        },
      });

      await expect(login('test@example.com', 'password123')).rejects.toEqual(errorMessage);
    });
  });

  describe('logout', () => {
    it('should clear auth token', async () => {
      await logout();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
      expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('checkAuthStatus', () => {
    it('should return true when token exists', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce('test-token');

      const result = await checkAuthStatus();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('token');
      expect(result).toBe(true);
    });

    it('should return false when token does not exist', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await checkAuthStatus();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('token');
      expect(result).toBe(false);
    });

    it('should return false when AsyncStorage throws error', async () => {
      AsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      const result = await checkAuthStatus();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('token');
      expect(result).toBe(false);
    });
  });

  describe('Tribe Operations', () => {
    describe('createTribe', () => {
      it('should create tribe successfully', async () => {
        const mockResponse = {
          data: {
            id: '123',
            name: 'Test Tribe',
            code: 'ABC123',
          },
        };
        mockAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await createTribe('Test Tribe');

        expect(mockAxios.post).toHaveBeenCalledWith('http://localhost:5002/api/tribe', {
          name: 'Test Tribe',
        });
        expect(result).toEqual(mockResponse.data);
      });

      it('should throw error when tribe creation fails', async () => {
        const errorMessage = 'Failed to create tribe';
        mockAxios.post.mockRejectedValueOnce({
          response: {
            data: {
              error: errorMessage,
            },
          },
        });

        await expect(createTribe('Test Tribe')).rejects.toEqual(errorMessage);
      });
    });

    describe('joinTribe', () => {
      it('should join tribe successfully', async () => {
        const mockResponse = {
          data: {
            success: true,
            tribe: {
              id: '123',
              name: 'Test Tribe',
            },
          },
        };
        mockAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await joinTribe('ABC123');

        expect(mockAxios.post).toHaveBeenCalledWith('http://localhost:5002/api/tribe/join', {
          code: 'ABC123',
        });
        expect(result).toEqual(mockResponse.data);
      });

      it('should throw error when joining tribe fails', async () => {
        const errorMessage = 'Failed to join tribe';
        mockAxios.post.mockRejectedValueOnce({
          response: {
            data: {
              error: errorMessage,
            },
          },
        });

        await expect(joinTribe('ABC123')).rejects.toEqual(errorMessage);
      });
    });

    describe('getUserTribes', () => {
      it('should get user tribes successfully', async () => {
        const mockResponse = {
          data: {
            tribes: [
              { id: '123', name: 'Tribe 1' },
              { id: '456', name: 'Tribe 2' },
            ],
          },
        };
        mockAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await getUserTribes();

        expect(mockAxios.get).toHaveBeenCalledWith('http://localhost:5002/api/tribes');
        expect(result).toEqual(mockResponse.data.tribes);
      });

      it('should throw error when getting tribes fails', async () => {
        const errorMessage = 'Failed to get tribes';
        mockAxios.get.mockRejectedValueOnce({
          response: {
            data: {
              error: errorMessage,
            },
          },
        });

        await expect(getUserTribes()).rejects.toEqual(errorMessage);
      });
    });
  });
});
