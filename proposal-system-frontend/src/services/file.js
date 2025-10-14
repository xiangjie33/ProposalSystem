import api from './api';

export const fileService = {
  getFiles: async (directoryId) => {
    const response = await api.get('/files', { params: { directory_id: directoryId } });
    return response.data;
  },

  upload: async (file, directoryId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('directory_id', directoryId);
    
    const response = await api.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/files/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
  },

  download: async (id) => {
    const response = await api.get(`/files/${id}/download`, { responseType: 'blob' });
    return response.data;
  },
};
