import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getTodos = async (date) => {
  const response = await api.get('/todos', { params: { date } });
  return response.data.data;
};

export const createTodo = async (todoData) => {
  const response = await api.post('/todos', todoData);
  return response.data.data;
};

export const updateTodo = async (id, todoData) => {
  const response = await api.patch(`/todos/${id}`, todoData);
  return response.data.data;
};

export const deleteTodo = async (id) => {
  await api.delete(`/todos/${id}`);
};

export const completeTodo = async (id) => {
  const response = await api.patch(`/todos/${id}/complete`);
  return response.data.data;
};

export default api;
