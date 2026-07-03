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
    <div className="mx-auto max-w-[320px] rounded-[2rem] bg-white p-5 shadow-[0_30px_60px_-40px_rgba(48,51,48,0.28)] lg:mx-0">
      <div className="mb-5 flex items-center justify-between px-2">
        <h2 className="text-lg font-black text-[#303330]">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-full bg-[#faf9f6] p-2 text-[#797b78] transition-colors hover:text-[#7e5073]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-full bg-[#faf9f6] p-2 text-[#797b78] transition-colors hover:text-[#7e5073]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center text-[9px] font-black uppercase tracking-wider text-[#b0b3ae]">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {[...Array(emptySlots)].map((_, i) => <div key={`empty-${i}`} />)}

        {days.map(day => {
          const isSelected = isSameDay(day, selectedDate);
          const dayNum = format(day, 'd');

          return (
            <div
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-full text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-[#f3bbe4] text-[#5f3557] shadow-[0_16px_30px_-20px_rgba(126,80,115,0.55)]'
                  : 'text-[#5d605c] hover:bg-[#faf9f6] hover:text-[#7e5073]'
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
