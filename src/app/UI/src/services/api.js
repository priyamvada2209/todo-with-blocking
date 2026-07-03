import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
);

export const register = async (userData) => {
  const response = await api.post('/api/v1/auth/register', userData);
  return response.data.data;
};

export const login = async (credentials) => {
  const response = await api.post('/api/v1/auth/login', credentials);
  return response.data.data;
};

export const logout = async () => {
  await api.post('/api/v1/auth/logout');
};

export const refreshToken = async () => {
  const response = await api.post('/api/v1/auth/refresh');
  return response.data.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/v1/users/me');
  return response.data.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.patch('/api/v1/users/me', profileData);
  return response.data.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.patch('/api/v1/users/me/password', passwordData);
  return response.data.data;
};

export const getTodos = async (date) => {
  const params = date ? { date } : {};
  const response = await api.get('/api/v1/todos', { params });
  return response.data.data;
};

export const createTodo = async (todoData) => {
  const response = await api.post('/api/v1/todos', todoData);
  return response.data.data;
};

export const updateTodo = async (id, todoData) => {
  const response = await api.patch(`/api/v1/todos/${id}`, todoData);
  return response.data.data;
};

export const deleteTodo = async (id) => {
  await api.delete(`/api/v1/todos/${id}`);
};

export const completeTodo = async (id) => {
  const response = await api.patch(`/api/v1/todos/${id}/complete`);
  return response.data.data;
};

export default api;
