import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { format } from 'date-fns';

export const useTodos = (selectedDate) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const data = await api.getTodos(formattedDate);
      setTodos(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch todos:', err);
      setError('Could not load rituals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [formattedDate]);

  const addTodo = async (todoData) => {
    try {
      const newTodo = await api.createTodo({
        ...todoData,
        date: formattedDate
      });
      setTodos([...todos, newTodo]);
    } catch (err) {
      console.error('Failed to create todo:', err);
    }
  };

  const toggleComplete = async (id) => {
    try {
      const updatedTodo = await api.completeTodo(id);
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
    } catch (err) {
      console.error('Failed to complete todo:', err);
    }
  };

  const removeTodo = async (id) => {
    try {
      await api.deleteTodo(id);
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  };

  return { todos, loading, error, addTodo, toggleComplete, removeTodo, refresh: fetchTodos };
};
