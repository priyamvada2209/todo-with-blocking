import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, isToday } from 'date-fns';

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
    <div className="mx-auto w-full max-w-[320px] rounded-[2rem] bg-white p-5 shadow-[0_30px_60px_-40px_rgba(48,51,48,0.28)] sm:max-w-none lg:mx-0 lg:max-w-[320px]">
      <div className="mb-3 flex items-center justify-between gap-3 px-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#797b78]">Planning View</p>
          <h2 className="mt-2 text-lg font-black text-[#303330]">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>
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

        {days.map((day) => {
          const selected = isSameDay(day, selectedDate);
          const today = isToday(day);
          const dayNum = format(day, 'd');

          return (
            <div
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-full text-xs font-bold transition-all ${
                selected
                  ? 'bg-[#f3bbe4] text-[#5f3557] shadow-[0_16px_30px_-20px_rgba(126,80,115,0.55)]'
                  : today
                    ? 'bg-[#faf9f6] text-[#7e5073] ring-1 ring-[#e5aed6]/60'
                    : 'text-[#5d605c] hover:bg-[#faf9f6] hover:text-[#7e5073]'
              }`}
            >
              {dayNum}
              {today && !selected && <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-[#7e5073]" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
