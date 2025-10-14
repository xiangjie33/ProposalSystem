import api from './api';

export const directoryService = {
  getTree: async () => {
    const response = await api.get('/directories/tree');
    return response.data;
  },

  getDirectories: async (parentId = null) => {
    const response = await api.get('/directories', { params: { parent_id: parentId } });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/directories', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/directories/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/directories/${id}`);
    return response.data;
  },
};
