import api from './api';
import {
  getApiErrorMessage,
  normalizeStudent,
  toStudentPayload,
} from '../utils/helpers';

export const studentService = {
  async getAll(params = {}) {
    try {
      const { data } = await api.get('/students', { params });
      const students = (data.students || []).map(normalizeStudent);
      return { students, total: data.count ?? students.length };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch students'));
    }
  },

  async getById(id) {
    try {
      const { data } = await api.get(`/students/${id}`);
      return normalizeStudent(data.student || data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Student not found'));
    }
  },

  async search(query) {
    try {
      const { data } = await api.get('/students/search', {
        params: { name: query, q: query },
      });
      const students = (data.students || []).map(normalizeStudent);
      return { students, total: data.count ?? students.length };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Search failed'));
    }
  },

  async create(studentData) {
    try {
      const { data } = await api.post('/students', toStudentPayload(studentData));
      return normalizeStudent(data.student || data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create student'));
    }
  },

  async update(id, studentData) {
    try {
      const { data } = await api.put(`/students/${id}`, toStudentPayload(studentData));
      return normalizeStudent(data.student || data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update student'));
    }
  },

  async delete(id) {
    try {
      const { data } = await api.delete(`/students/${id}`);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete student'));
    }
  },
};
