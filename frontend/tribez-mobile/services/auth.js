import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

export const setAuthToken = async (token) => {
  if (token) {
    await AsyncStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    await AsyncStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const register = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      email,
      password,
    });
    const { token, user_id } = response.data;
    await setAuthToken(token);
    return { token, user_id };
  } catch (error) {
    throw error.response?.data?.error || 'Registration failed';
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });
    const { token, user_id } = response.data;
    await setAuthToken(token);
    return { token, user_id };
  } catch (error) {
    throw error.response?.data?.error || 'Login failed';
  }
};

export const logout = async () => {
  await setAuthToken(null);
};

export const checkAuthStatus = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

// Add tribe-related functions
export const createTribe = async (name) => {
  try {
    const response = await axios.post(`${API_URL}/tribe`, { name });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to create tribe';
  }
};

export const joinTribe = async (code) => {
  try {
    const response = await axios.post(`${API_URL}/tribe/join`, { code });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to join tribe';
  }
};

export const getUserTribes = async () => {
  try {
    const response = await axios.get(`${API_URL}/tribes`);
    return response.data.tribes;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to get tribes';
  }
};
