import api from './api';
import {
  getApiErrorMessage,
  normalizeMedicalRecord,
  toMedicalRecordPayload,
} from '../utils/helpers';

export const medicalRecordService = {
  async getAll() {
    try {
      const { data } = await api.get('/medical-records');
      const records = (data.records || []).map(normalizeMedicalRecord);
      return { records, total: data.count ?? records.length };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch medical records'));
    }
  },

  async getById(id) {
    try {
      const { records } = await this.getAll();
      const record = records.find((item) => item.id === id);
      if (!record) {
        throw new Error('Record not found');
      }
      return record;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Record not found'));
    }
  },

  async getByStudent(studentId) {
    try {
      const { data } = await api.get(`/medical-records/student/${studentId}`);
      const records = (data.records || []).map(normalizeMedicalRecord);
      return { records, total: records.length };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch student records'));
    }
  },

  async create(recordData) {
    try {
      const { data } = await api.post('/medical-records', toMedicalRecordPayload(recordData));
      return normalizeMedicalRecord(data.record || data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create medical record'));
    }
  },
};
