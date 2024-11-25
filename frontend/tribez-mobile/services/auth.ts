import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleError, validateForm, AuthError } from '../utils/errorHandling';

const API_URL = 'http://localhost:5002/api';

interface AuthResponse {
  token: string;
  user_id: string;
}

export const setAuthToken = async (token: string | null): Promise<void> => {
  try {
    if (token) {
      await AsyncStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      await AsyncStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  } catch (error) {
    throw handleError(error);
  }
};

export const register = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const validation = validateForm(email, password);
    if (!validation.isValid && validation.error) {
      throw validation.error;
    }

    const response = await axios.post<AuthResponse>(`${API_URL}/register`, {
      email,
      password,
    });

    const { token, user_id } = response.data;
    await setAuthToken(token);
    return { token, user_id };
  } catch (error) {
    throw handleError(error);
  }
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const validation = validateForm(email, password);
    if (!validation.isValid && validation.error) {
      throw validation.error;
    }

    const response = await axios.post<AuthResponse>(`${API_URL}/login`, {
      email,
      password,
    });

    const { token, user_id } = response.data;
    await setAuthToken(token);
    return { token, user_id };
  } catch (error) {
    throw handleError(error);
  }
};

export const logout = async (): Promise<void> => {
  try {
    await setAuthToken(null);
  } catch (error) {
    throw handleError(error);
  }
};

export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      await setAuthToken(token);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
};

// Tribe-related functions
interface Tribe {
  id: string;
  name: string;
  code?: string;
}

export const createTribe = async (name: string): Promise<Tribe> => {
  try {
    if (!name.trim()) {
      throw new AuthError('Tribe name cannot be empty');
    }

    const response = await axios.post<Tribe>(`${API_URL}/tribe`, { name });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const joinTribe = async (code: string): Promise<Tribe> => {
  try {
    if (!code.trim()) {
      throw new AuthError('Tribe code cannot be empty');
    }

    const response = await axios.post<{ tribe: Tribe }>(`${API_URL}/tribe/join`, { code });
    return response.data.tribe;
  } catch (error) {
    throw handleError(error);
  }
};

export const getUserTribes = async (): Promise<Tribe[]> => {
  try {
    const response = await axios.get<{ tribes: Tribe[] }>(`${API_URL}/tribes`);
    return response.data.tribes;
  } catch (error) {
    throw handleError(error);
  }
};

// Initialize axios interceptors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await setAuthToken(null);
    }
    return Promise.reject(error);
  }
);
