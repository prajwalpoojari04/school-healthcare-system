import api from './api';
import { getApiErrorMessage, normalizeAlerts } from '../utils/helpers';

export const alertService = {
  async getAlerts() {
    try {
      const { data } = await api.get('/alerts');
      return normalizeAlerts(data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch alerts'));
    }
  },
};
