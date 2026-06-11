import api from './api';
import { getApiErrorMessage } from '../utils/helpers';

export const BACKEND_ROLES = ['Admin', 'Doctor', 'Nurse', 'Parent'];

const toBackendRole = (role) => {
  const normalized = role?.toLowerCase();
  const map = {
    admin: 'Admin',
    doctor: 'Doctor',
    nurse: 'Nurse',
    parent: 'Parent',
  };
  return map[normalized] || role;
};

export const authService = {
  async login(credentials) {
    try {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Invalid email or password'));
    }
  },

  async register(userData) {
    try {
      const { name, email, password, role } = userData;
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
        role: toBackendRole(role),
      });
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Registration failed'));
    }
  },

  async forgotPassword(email) {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to send reset link'));
    }
  },
};
