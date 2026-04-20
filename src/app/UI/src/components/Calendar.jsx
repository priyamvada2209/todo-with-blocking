import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, startOfWeek } from 'date-fns';

const Calendar = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const days = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  // Calculate empty slots at the beginning (assuming week starts on Monday)
  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  // If month starts on Sunday (0), we need 6 empty slots.
  // If month starts on Monday (1), we need 0 empty slots.
  const startDay = getDay(monthStart);
  const emptySlots = startDay === 0 ? 6 : startDay - 1;

  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <div className="p-4 lg:p-8 bg-white rounded-3xl shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 lg:gap-4 mb-4">
        {weekDays.map(day => (
          <div key={day} className="text-center text-gray-400 font-medium text-xs lg:text-sm">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2 lg:gap-y-6 gap-x-2 lg:gap-x-4 flex-1">
        {[...Array(emptySlots)].map((_, i) => <div key={`empty-${i}`} />)} 
        
        {days.map(day => {
          const isSelected = isSameDay(day, selectedDate);
          const dayNum = format(day, 'd');
          
          return (
            <div 
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={`relative flex items-center justify-center h-10 lg:h-12 cursor-pointer transition-all rounded-lg lg:rounded-xl text-sm lg:text-base ${
                isSelected ? 'bg-brand-lavender text-brand-deep font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {dayNum}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
