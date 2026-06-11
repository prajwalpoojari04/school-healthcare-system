import api from './api';
import {
  getApiErrorMessage,
  normalizeDashboardStats,
  normalizeMedicalRecord,
  normalizeRecentVisit,
} from '../utils/helpers';

export const dashboardService = {
  async getDashboard() {
    try {
      const { data } = await api.get('/dashboard');
      return normalizeDashboardStats(data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch dashboard'));
    }
  },

  async getRecentVisits() {
    try {
      const { data } = await api.get('/dashboard/recent-visits');
      const visits = (data.visits || []).map(normalizeRecentVisit);
      return { visits, total: data.count ?? visits.length };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch recent visits'));
    }
  },

  async getAnalytics() {
    try {
      const { data } = await api.get('/dashboard/analytics');
      const analytics = data.analytics || [];
      return {
        commonDiseases: analytics.map((item) => ({
          name: item._id || item.name,
          count: item.count,
        })),
        diseaseTrends: data.diseaseTrends || [],
        visitStatistics: data.visitStatistics || [],
        healthAnalytics: data.healthAnalytics || [],
        rawAnalytics: analytics,
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch analytics'));
    }
  },

  async getRecentCases(limit = 5) {
    try {
      const { data } = await api.get('/dashboard/recent-visits');
      const records = (data.visits || []).map(normalizeMedicalRecord).slice(0, limit);
      return records;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch recent cases'));
    }
  },
};
