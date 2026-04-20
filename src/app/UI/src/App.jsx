import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Calendar from './components/Calendar';
import RitualBoard from './components/RitualBoard';
import { useTodos } from './hooks/useTodos';

function App() {
  // Default to today's date
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { todos, loading, error, addTodo, toggleComplete } = useTodos(selectedDate);

  return (
    <div className="flex flex-col h-screen bg-[#f8f7ff] overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - hidden on mobile, visible on lg screens */}
        <div className="hidden lg:block">
          <Sidebar onNewRitual={() => console.log('New Ritual Clicked')} />
        </div>
        
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full">
          {/* Calendar Section */}
          <div className="w-full lg:w-[45%] p-4 lg:p-10 overflow-y-auto border-b lg:border-b-0 lg:border-r border-gray-100">
            <Calendar 
              selectedDate={selectedDate} 
              onDateSelect={setSelectedDate} 
            />
          </div>
          
          {/* Rituals Section */}
          <div className="w-full lg:w-[55%] overflow-y-auto bg-gray-50/50">
            {error && (
              <div className="m-4 p-4 bg-red-50 text-red-500 rounded-xl text-center font-medium">
                {error} - Make sure the backend is running on port 5001
              </div>
            )}
            <RitualBoard 
              selectedDate={selectedDate}
              todos={todos}
              onToggleComplete={toggleComplete}
              onAddTodo={addTodo}
              loading={loading}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
