import React, { useState } from 'react';
import { Check, Loader2, Pencil, Trash2, X, Save } from 'lucide-react';
import { format } from 'date-fns';

const getSiteLabel = (site) => {
  try {
    return new URL(site).hostname;
  } catch {
    return site;
  }
};

const formatCompletedDate = (value) => {
  if (!value) {
    return null;
  }

  const completedDate = new Date(value);
  if (Number.isNaN(completedDate.getTime())) {
    return null;
  }

  return format(completedDate, 'MMM d, yyyy');
};

const TaskBoard = ({ selectedDate, todos, onToggleComplete, onUpdateTask, onDeleteTask, loading }) => {
  const [editingId, setEditingId] = useState(null);
  const [editTask, setEditTask] = useState('');

  const handleEdit = (todo) => {
    if (todo.is_completed) {
      return;
    }

    setEditingId(todo.id);
    setEditTask(todo.task);
  };

  const handleSave = (todo) => {
    if (todo.is_completed) {
      setEditingId(null);
      return;
    }

    if (editTask.trim()) {
      onUpdateTask(todo.id, { task: editTask.trim() });
      setEditingId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col space-y-6 bg-[#faf9f6] p-4 sm:p-6 lg:h-full lg:space-y-8 lg:p-10">
      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#797b78]">Daily Focus</p>
        <h2 className="text-3xl font-black tracking-tight text-[#303330] sm:text-4xl">
          {format(selectedDate, 'EEEE, MMM d')}
        </h2>
        <div className="flex items-center space-x-2 text-[#797b78]">
          <div className={`h-2.5 w-2.5 rounded-full ${todos.length > 0 ? 'bg-[#7e5073]' : 'bg-[#d9dbd6]'} shadow-sm`} />
          <span className="text-sm font-bold lg:text-base">
            {todos.length} {todos.length === 1 ? 'Task' : 'Tasks'} scheduled
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-4 lg:-mr-2 lg:overflow-y-auto lg:pr-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#7e5073]" />
          </div>
        ) : todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2rem] bg-white py-20 shadow-[0_30px_60px_-40px_rgba(48,51,48,0.22)]">
            <p className="px-6 text-center text-2xl font-bold text-[#5d605c]">
              All clear for this day
            </p>
            <p className="mt-2 px-6 text-center text-sm text-[#797b78]">
              Add a new task when you're ready for the next ritual.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {todos.map((todo) => {
              const completedLabel = formatCompletedDate(todo.completed_at);

              return (
                <div
                  key={todo.id}
                  className={`group task-card flex flex-col gap-4 rounded-[1.5rem] p-4 transition-all sm:flex-row sm:items-center sm:justify-between lg:rounded-[2rem] lg:p-6 ${
                    todo.is_completed
                      ? 'bg-[#f4f4f0] opacity-75'
                      : 'bg-white shadow-[0_24px_45px_-38px_rgba(48,51,48,0.28)] hover:bg-[#fffdfd]'
                  }`}
                >
                  <div className="flex flex-1 items-center space-x-4 lg:space-x-6">
                    <button
                      type="button"
                      onClick={() => {
                        if (editingId === todo.id) {
                          setEditingId(null);
                        }
                        onToggleComplete(todo.id);
                      }}
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all lg:h-10 lg:w-10 ${
                        todo.is_completed
                          ? 'border-[#7e5073] bg-[#7e5073] text-white'
                          : 'border-[#e5aed6] bg-white text-transparent hover:border-[#7e5073]'
                      }`}
                    >
                      {todo.is_completed && <Check className="h-4 w-4 lg:h-5 lg:w-5" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      {editingId === todo.id ? (
                        <div className="flex w-full items-center space-x-2">
                          <input
                            value={editTask}
                            onChange={(e) => setEditTask(e.target.value)}
                            className="flex-1 rounded-2xl bg-[#f4f4f0] p-3 font-bold text-[#303330] outline-none focus:bg-white focus:ring-2 focus:ring-[#e5aed6]/60"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSave(todo)}
                          />
                          <button
                            type="button"
                            onClick={() => handleSave(todo)}
                            className="flex-shrink-0 rounded-xl p-2 text-[#5f3557] transition-transform hover:bg-[#f3bbe4]/30 active:scale-90"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="flex-shrink-0 rounded-xl p-2 text-[#a8364b] transition-transform hover:bg-[#fff1f4] active:scale-90"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className={`break-words text-base font-extrabold leading-tight lg:text-lg ${todo.is_completed ? 'text-[#797b78] line-through' : 'text-[#303330]'}`}>
                            {todo.task}
                          </h3>
                          {todo.is_completed && completedLabel && (
                            <p className="mt-1 text-xs font-semibold text-[#797b78] lg:text-sm">
                              Completed on {completedLabel}
                            </p>
                          )}
                          {todo.sites && todo.sites.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {todo.sites.map((site, i) => (
                                <span key={i} className="rounded-full bg-[#f3e9de] px-3 py-1 text-[10px] font-bold text-[#5c564e]">
                                  {getSiteLabel(site)}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {!todo.is_completed && editingId !== todo.id && (
                    <div className="flex items-center self-end space-x-1 opacity-100 transition-opacity sm:ml-4 lg:space-x-2 lg:opacity-0 lg:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleEdit(todo)}
                        title="Edit task"
                        className="rounded-xl p-2 text-[#797b78] transition-all hover:bg-[#f3bbe4]/20 hover:text-[#7e5073]"
                      >
                        <Pencil className="h-4 w-4 lg:h-5 lg:w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTask(todo.id)}
                        className="rounded-xl p-2 text-[#797b78] transition-all hover:bg-[#fff1f4] hover:text-[#a8364b]"
                      >
                        <Trash2 className="h-4 w-4 lg:h-5 lg:w-5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskBoard;
