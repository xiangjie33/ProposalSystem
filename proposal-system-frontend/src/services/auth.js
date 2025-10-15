import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('permissions', JSON.stringify(response.data.permissions || []));
    }
    return response.data;
  },

  register: async (name, email, password, password_confirmation) => {
    const response = await api.post('/register', { name, email, password, password_confirmation });
    return response.data;
  },

  logout: async () => {
    await api.post('/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};
