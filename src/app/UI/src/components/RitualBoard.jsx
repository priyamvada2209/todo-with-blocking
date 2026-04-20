import React from 'react';
import { Check, Plus, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const RitualBoard = ({ selectedDate, todos, onToggleComplete, onAddTodo, loading }) => {
  const [newTask, setNewTask] = React.useState('');
  const [newUrl, setNewUrl] = React.useState('');
  const [urls, setUrls] = React.useState([]);

  const handleAddUrl = () => {
    if (newUrl && !urls.includes(newUrl)) {
      setUrls([...urls, newUrl]);
      setNewUrl('');
    }
  };

  const removeUrl = (url) => {
    setUrls(urls.filter(u => u !== url));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTask) {
      onAddTodo({ task: newTask, sites: urls });
      setNewTask('');
      setUrls([]);
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-8 flex flex-col space-y-6 lg:space-y-8 h-full">
      <div className="space-y-2">
        <h2 className="text-3xl lg:text-5xl font-black text-gray-800 tracking-tight">
          {format(selectedDate, 'EEEE, MMM d')}
        </h2>
        <div className="flex items-center text-gray-500 space-x-2">
          <div className={`w-2 h-2 rounded-full ${todos.length > 0 ? 'bg-brand-purple' : 'bg-gray-300'}`} />
          <span className="font-medium text-sm">
            {todos.length} {todos.length === 1 ? 'Ritual' : 'Rituals'} scheduled
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No rituals for this day yet.</p>
          </div>
        ) : (
          todos.map(todo => (
            <div key={todo.id} className="ritual-card glass p-4 lg:p-6 rounded-2xl lg:rounded-[2rem] flex items-center justify-between shadow-sm border border-white">
              <div className="flex items-center space-x-4 lg:space-x-6">
                <button 
                  onClick={() => onToggleComplete(todo.id)}
                  className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    todo.is_completed 
                      ? 'bg-brand-deep border-brand-deep text-white' 
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {todo.is_completed && <Check className="w-4 h-4 lg:w-5 lg:h-5" />}
                </button>
                <div>
                  <h3 className={`text-lg lg:text-xl font-bold break-words ${todo.is_completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    {todo.task}
                  </h3>
                  {todo.sites && todo.sites.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {todo.sites.map((site, i) => (
                        <span key={i} className="bg-orange-50 text-orange-400 px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-[10px] lg:text-xs font-semibold max-w-[150px] truncate">
                          {new URL(site).hostname}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Ritual Form */}
      <div className="bg-white/70 backdrop-blur-md p-6 lg:p-8 rounded-2xl lg:rounded-[2.5rem] space-y-4 lg:space-y-6 border border-white shadow-lg sticky bottom-0">
        <h3 className="text-brand-deep font-bold tracking-wider uppercase text-[10px] lg:text-xs">New Ritual</h3>
        
        <div className="space-y-3 lg:space-y-4">
          <div className="space-y-1 lg:space-y-2">
            <label className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Task Name</label>
            <input 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What will you focus on?"
              className="w-full p-4 lg:p-6 rounded-xl lg:rounded-3xl bg-white border border-gray-100 text-base lg:text-lg shadow-inner focus:border-brand-lavender transition-all"
            />
          </div>

          <div className="space-y-1 lg:space-y-2">
            <label className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Resources (URLs)</label>
            <div className="relative">
              <input 
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Add a link..."
                className="w-full p-4 lg:p-6 rounded-xl lg:rounded-3xl bg-white border border-gray-100 shadow-inner focus:border-brand-lavender transition-all pr-12 lg:pr-16 text-sm lg:text-base"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
              />
              <button 
                onClick={handleAddUrl}
                type="button"
                className="absolute right-2 lg:right-3 top-2 lg:top-3 w-8 h-8 lg:w-10 lg:h-10 bg-brand-lavender rounded-lg lg:rounded-xl flex items-center justify-center text-white hover:bg-brand-purple transition-all"
              >
                <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 max-h-24 overflow-y-auto">
              {urls.map((url, i) => (
                <div key={i} className="bg-orange-50 text-orange-400 px-2 py-1 rounded-full text-[10px] font-semibold flex items-center space-x-1">
                  <span className="max-w-[100px] truncate">{url}</span>
                  <X onClick={() => removeUrl(url)} className="w-3 h-3 cursor-pointer hover:text-orange-600" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full py-4 lg:py-6 bg-gradient-to-r from-brand-lavender to-brand-purple text-white rounded-xl lg:rounded-[2rem] text-lg lg:text-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          Add to Rituals
        </button>
      </div>
    </div>
  );
};

export default RitualBoard;
