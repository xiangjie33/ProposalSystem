import api from './api';

export const proposalService = {
  getAll: async () => {
    const response = await api.get('/proposals');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/proposals/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/proposals', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/proposals/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/proposals/${id}`);
    return response.data;
  },

  addPermission: async (proposalId, data) => {
    const response = await api.post(`/proposals/${proposalId}/permissions`, data);
    return response.data;
  },
};
