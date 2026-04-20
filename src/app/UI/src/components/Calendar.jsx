import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';

const Calendar = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const days = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  const startDay = getDay(monthStart);
  const emptySlots = startDay === 0 ? 6 : startDay - 1;

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm max-w-[320px] mx-auto lg:mx-0">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-lg font-black text-slate-800">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-1">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-brand-purple">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-brand-purple">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center text-slate-300 font-black text-[9px] uppercase tracking-wider">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {[...Array(emptySlots)].map((_, i) => <div key={`empty-${i}`} />)} 
        
        {days.map(day => {
          const isSelected = isSameDay(day, selectedDate);
          const dayNum = format(day, 'd');
          
          return (
            <div 
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={`relative flex items-center justify-center aspect-square cursor-pointer transition-all rounded-full text-xs font-bold ${
                isSelected 
                  ? 'bg-brand-purple text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-brand-purple'
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
