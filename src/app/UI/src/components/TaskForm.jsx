import React from 'react';
import { Plus, X } from 'lucide-react';

const TaskForm = ({ onAddTodo }) => {
  const [newTask, setNewTask] = React.useState('');
  const [newUrl, setNewUrl] = React.useState('');
  const [urls, setUrls] = React.useState([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleAddUrl = () => {
    if (newUrl && !urls.includes(newUrl)) {
      setUrls([...urls, newUrl]);
      setNewUrl('');
    }
  };

  const removeUrl = (url) => {
    setUrls(urls.filter(u => u !== url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onAddTodo({ task: newTask.trim(), sites: urls });
      setNewTask('');
      setUrls([]);
      setNewUrl('');
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to add task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 lg:p-8 rounded-[2rem] space-y-4 lg:space-y-6 border border-gray-100 shadow-sm">
      <h3 className="text-brand-deep font-bold tracking-wider uppercase text-[10px] lg:text-xs">New Task</h3>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3 lg:space-y-4">
        <div className="space-y-1 lg:space-y-2">
          <label className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Task Name</label>
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What will you focus on?"
            className="w-full p-4 lg:p-4 rounded-xl lg:rounded-2xl bg-gray-50 border border-transparent focus:border-brand-lavender focus:bg-white transition-all text-sm lg:text-base outline-none"
          />
        </div>

        <div className="space-y-1 lg:space-y-2">
          <label className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Resources (URLs)</label>
          <div className="relative">
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Add a link..."
              className="w-full p-4 lg:p-4 rounded-xl lg:rounded-2xl bg-gray-50 border border-transparent focus:border-brand-lavender focus:bg-white transition-all pr-12 lg:pr-14 text-xs lg:text-sm outline-none"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
            />
            <button
              onClick={handleAddUrl}
              type="button"
              className="absolute right-2 top-2 w-8 h-8 lg:w-9 lg:h-9 bg-brand-lavender rounded-lg lg:rounded-xl flex items-center justify-center text-white hover:bg-brand-purple transition-all"
            >
              <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {urls.map((url, i) => (
              <div key={i} className="bg-orange-50 text-orange-400 px-2 py-1 rounded-full text-[10px] font-semibold flex items-center space-x-1">
                <span className="max-w-[100px] truncate">{url}</span>
                <X onClick={() => removeUrl(url)} className="w-3 h-3 cursor-pointer" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-4 lg:py-4 bg-gradient-to-r from-brand-lavender to-brand-purple text-white rounded-xl lg:rounded-2xl text-base lg:text-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-70"
      >
        {isSubmitting ? 'Adding...' : 'Add to Tasks'}
      </button>
    </div>
  );
};

export default TaskForm;
