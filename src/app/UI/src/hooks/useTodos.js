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
      setError('Could not load tasks.');
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

  const updateTodo = async (id, todoData) => {
    // Optimistic update
    const previousTodos = [...todos];
    setTodos(todos.map(t => t.id === id ? { ...t, ...todoData } : t));

    try {
      const updatedTodo = await api.updateTodo(id, todoData);
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
    } catch (err) {
      console.error('Failed to update todo:', err);
      setTodos(previousTodos); // Revert on failure
      setError('Failed to save changes.');
    }
  };

  const toggleComplete = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    // Optimistic update
    const previousTodos = [...todos];
    setTodos(todos.map(t => t.id === id ? { ...t, is_completed: !t.is_completed } : t));

    try {
      const updatedTodo = await api.completeTodo(id);
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
    } catch (err) {
      console.error('Failed to complete todo:', err);
      setTodos(previousTodos);
    }
  };

  const removeTodo = async (id) => {
    const previousTodos = [...todos];
    setTodos(todos.filter(t => t.id !== id));

    try {
      await api.deleteTodo(id);
    } catch (err) {
      console.error('Failed to delete todo:', err);
      setTodos(previousTodos);
    }
  };

  return { todos, loading, error, addTodo, toggleComplete, updateTodo, removeTodo, refresh: fetchTodos };
};
