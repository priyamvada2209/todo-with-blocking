import React, { useState } from 'react';
import { Check, Loader2, Pencil, Trash2, X, Save } from 'lucide-react';
import { format } from 'date-fns';

const RitualBoard = ({ selectedDate, todos, onToggleComplete, onUpdateTask, onDeleteTask, loading }) => {
  const [editingId, setEditingId] = useState(null);
  const [editTask, setEditTask] = useState('');

  const handleEdit = (todo) => {
    setEditingId(todo.id);
    setEditTask(todo.task);
  };

  const handleSave = (id) => {
    if (editTask.trim()) {
      onUpdateTask(id, { task: editTask });
      setEditingId(null);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-10 flex flex-col space-y-6 lg:space-y-8 h-full bg-white">
      <div className="space-y-2">
        <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          {format(selectedDate, 'EEEE, MMM d')}
        </h2>
        <div className="flex items-center text-slate-400 space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${todos.length > 0 ? 'bg-brand-purple' : 'bg-slate-200'} shadow-sm`} />
          <span className="font-bold text-sm lg:text-base">
            {todos.length} {todos.length === 1 ? 'Task' : 'Tasks'} scheduled
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-brand-purple animate-spin" />
          </div>
        ) : todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50/30 rounded-[2rem] border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-bold text-base text-center px-6">
              No tasks for this day.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {todos.map(todo => (
              <div 
                key={todo.id} 
                className={`group p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-between transition-all border ${
                  todo.is_completed 
                    ? 'bg-slate-50 border-transparent opacity-60' 
                    : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-brand-lavender/40'
                }`}
              >
                <div className="flex items-center space-x-4 lg:space-x-6 flex-1">
                  <button 
                    onClick={() => onToggleComplete(todo.id)}
                    className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      todo.is_completed 
                        ? 'bg-brand-deep border-brand-deep text-white' 
                        : 'border-slate-200 bg-white hover:border-brand-purple'
                    }`}
                  >
                    {todo.is_completed && <Check className="w-4 h-4 lg:w-5 lg:h-5" />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    {editingId === todo.id ? (
                      <div className="flex items-center space-x-2 w-full">
                        <input 
                          value={editTask}
                          onChange={(e) => setEditTask(e.target.value)}
                          className="flex-1 bg-slate-50 p-2 rounded-lg border border-brand-lavender outline-none font-bold text-slate-800"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleSave(todo.id)}
                        />
                        <button 
                          type="button"
                          onClick={() => handleSave(todo.id)} 
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg flex-shrink-0 transition-transform active:scale-90"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setEditingId(null)} 
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0 transition-transform active:scale-90"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className={`text-base lg:text-lg font-extrabold leading-tight truncate ${todo.is_completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {todo.task}
                        </h3>
                        {todo.sites && todo.sites.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {todo.sites.map((site, i) => (
                              <span key={i} className="bg-brand-light text-brand-purple px-2 py-0.5 rounded-full text-[9px] lg:text-[10px] font-bold border border-brand-lavender/10">
                                {new URL(site).hostname}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {editingId !== todo.id && (
                  <div className="flex items-center space-x-1 lg:space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(todo)}
                      className="p-2 text-slate-400 hover:text-brand-purple hover:bg-brand-light rounded-xl transition-all"
                    >
                      <Pencil className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                    <button 
                      onClick={() => onDeleteTask(todo.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RitualBoard;
