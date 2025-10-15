import api from './api';

export const groupService = {
  // 获取所有工作组
  getAll: async () => {
    const response = await api.get('/groups');
    return response.data;
  },

  // 获取单个工作组详情
  getById: async (id) => {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },

  // 创建工作组
  create: async (data) => {
    const response = await api.post('/groups', data);
    return response.data;
  },

  // 更新工作组
  update: async (id, data) => {
    const response = await api.put(`/groups/${id}`, data);
    return response.data;
  },

  // 删除工作组
  delete: async (id) => {
    const response = await api.delete(`/groups/${id}`);
    return response.data;
  },

  // 添加用户到工作组
  addUser: async (groupId, userId) => {
    const response = await api.post(`/groups/${groupId}/users/${userId}`);
    return response.data;
  },

  // 从工作组移除用户
  removeUser: async (groupId, userId) => {
    const response = await api.delete(`/groups/${groupId}/users/${userId}`);
    return response.data;
  },
};

export default groupService;
