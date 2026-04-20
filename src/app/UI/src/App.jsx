import React, { useState } from 'react';
import Header from './components/Header';
import Calendar from './components/Calendar';
import TaskBoard from './components/TaskBoard';
import TaskForm from './components/TaskForm';
import { useTodos } from './hooks/useTodos';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { todos, loading, error, addTodo, toggleComplete, updateTodo, removeTodo } = useTodos(selectedDate);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Calendar + New Task (50%) */}
        <div className="w-1/2 flex flex-col h-full bg-slate-50/30 border-r border-gray-100 overflow-y-auto p-6 lg:p-12 space-y-10">
          <Calendar 
            selectedDate={selectedDate} 
            onDateSelect={setSelectedDate} 
          />
          <TaskForm 
            onAddTodo={addTodo} 
          />
        </div>
        
        {/* Right Column: Task List (50%) */}
        <main className="w-1/2 overflow-hidden bg-white">
          {error && (
            <div className="m-4 p-4 bg-red-50 text-red-500 rounded-xl text-center font-medium">
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
    </div>
  );
}

export default App;
