import React, { useState } from 'react';

import Header from '../components/Header';
import Calendar from '../components/Calendar';
import TaskBoard from '../components/TaskBoard';
import TaskForm from '../components/TaskForm';
import { ProfileModal } from '../components/ProfileModal';

import { useTodos } from '../hooks/useTodos';

export const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { todos, loading, error, addTodo, toggleComplete, updateTodo, removeTodo, refresh } = useTodos(selectedDate);

  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f6] font-sans text-[#303330] lg:h-screen lg:overflow-hidden">
      <Header onProfileClick={() => setIsProfileOpen(true)} />
      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        <div className="flex w-full flex-col space-y-8 bg-[#f4f4f0] p-4 sm:p-6 lg:h-full lg:w-1/2 lg:space-y-10 lg:overflow-y-auto lg:p-12">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
          <TaskForm onAddTodo={addTodo} />
        </div>

        <main className="w-full bg-[#faf9f6] lg:w-1/2 lg:overflow-hidden">
          {error && (
            <div className="m-4 rounded-2xl bg-[#fff1f4] p-4 text-center font-medium text-[#a8364b]">
              {error} - Make sure the backend is running on port 5001
            </div>
          )}
          <TaskBoard
            selectedDate={selectedDate}
            todos={todos}
            onToggleComplete={toggleComplete}
            onUpdateTask={updateTodo}
            onDeleteTask={removeTodo}
            loading={loading}
          />
        </main>
      </div>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onTasksChanged={refresh}
      />
    </div>
  );
};
