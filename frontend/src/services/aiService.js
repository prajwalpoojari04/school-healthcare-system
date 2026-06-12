import api from './api';

/**
 * POST /api/ai/recommend
 *
 * @param {string} studentId
 * @param {string} symptoms
 * @returns {Promise<Object>} — the unwrapped recommendation object
 *   { possibleCondition, reasoning, recommendedMedicines, medicinesToAvoid, urgencyLevel, disclaimer }
 */
export const getAIRecommendation = async (studentId, symptoms) => {
  // api.post() returns an axios response; response.data is the Express JSON body:
  // { success: true, data: { possibleCondition, ... } }
  const response = await api.post('/ai/recommend', {
    studentId,
    currentSymptoms: symptoms,
  });

  // Unwrap here so every caller receives the flat recommendation object directly.
  return response.data.data;
};
