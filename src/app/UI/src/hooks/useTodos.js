import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import * as api from '../services/api';

export const useTodos = (selectedDate) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

  const fetchTodos = useCallback(async () => {
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
  }, [formattedDate]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTodos();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchTodos]);

  const addTodo = async (todoData) => {
    try {
      const newTodo = await api.createTodo({
        ...todoData,
        date: formattedDate,
      });
      setTodos((currentTodos) => [...currentTodos, newTodo]);
      setError(null);
      return newTodo;
    } catch (err) {
      console.error('Failed to create todo:', err);
      setError('Failed to add task.');
      throw err;
    }
  };

  const updateTodo = async (id, todoData) => {
    const previousTodos = todos;
    setTodos((currentTodos) => currentTodos.map((todo) => (todo.id === id ? { ...todo, ...todoData } : todo)));

    try {
      const updatedTodo = await api.updateTodo(id, todoData);
      setTodos((currentTodos) => currentTodos.map((todo) => (todo.id === id ? updatedTodo : todo)));
      setError(null);
      return updatedTodo;
    } catch (err) {
      console.error('Failed to update todo:', err);
      setTodos(previousTodos);
      setError('Failed to save changes.');
      throw err;
    }
  };

  const toggleComplete = async (id) => {
    const previousTodos = todos;
    setTodos((currentTodos) => currentTodos.map((todo) => (todo.id === id ? { ...todo, is_completed: !todo.is_completed } : todo)));

    try {
      const updatedTodo = await api.completeTodo(id);
      setTodos((currentTodos) => currentTodos.map((todo) => (todo.id === id ? updatedTodo : todo)));
      setError(null);
      return updatedTodo;
    } catch (err) {
      console.error('Failed to complete todo:', err);
      setTodos(previousTodos);
      setError('Failed to update task status.');
      throw err;
    }
  };

  const removeTodo = async (id) => {
    const previousTodos = todos;
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));

    try {
      await api.deleteTodo(id);
      setError(null);
    } catch (err) {
      console.error('Failed to delete todo:', err);
      setTodos(previousTodos);
      setError('Failed to delete task.');
      throw err;
    }
  };

  return { todos, loading, error, addTodo, toggleComplete, updateTodo, removeTodo, refresh: fetchTodos };
};
