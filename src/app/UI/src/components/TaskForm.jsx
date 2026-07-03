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
    setUrls(urls.filter((u) => u !== url));
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
    <div className="space-y-4 rounded-[2rem] bg-white p-6 shadow-[0_30px_60px_-40px_rgba(48,51,48,0.28)] lg:space-y-6 lg:p-8">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7e5073] lg:text-xs">New Task</h3>

      {error && (
        <div className="rounded-2xl bg-[#fff1f4] px-4 py-3 text-sm text-[#a8364b]">
          {error}
        </div>
      )}

      <div className="space-y-3 lg:space-y-4">
        <div className="space-y-2">
          <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[#797b78]">Task Name</label>
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What will you focus on?"
            className="w-full rounded-2xl bg-[#f4f4f0] p-4 text-sm text-[#303330] transition-all outline-none focus:bg-white focus:ring-2 focus:ring-[#e5aed6]/60 lg:text-base"
          />
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[#797b78]">Resources (URLs)</label>
          <div className="relative">
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Add a link..."
              className="w-full rounded-2xl bg-[#f4f4f0] p-4 pr-12 text-xs text-[#303330] transition-all outline-none focus:bg-white focus:ring-2 focus:ring-[#e5aed6]/60 lg:pr-14 lg:text-sm"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
            />
            <button
              onClick={handleAddUrl}
              type="button"
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-[#7e5073] to-[#e5aed6] text-white transition-all hover:scale-[1.02] lg:h-9 lg:w-9"
            >
              <Plus className="h-5 w-5 lg:h-6 lg:w-6" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {urls.map((url, i) => (
              <div key={i} className="flex items-center space-x-1 rounded-full bg-[#f3e9de] px-3 py-1 text-[10px] font-semibold text-[#5c564e]">
                <span className="max-w-[100px] truncate">{url}</span>
                <X onClick={() => removeUrl(url)} className="h-3 w-3 cursor-pointer" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-gradient-to-r from-[#7e5073] to-[#e5aed6] py-4 text-base font-bold text-white shadow-[0_24px_45px_-30px_rgba(126,80,115,0.6)] transition-all active:scale-95 disabled:opacity-70 lg:text-lg"
      >
        {isSubmitting ? 'Adding...' : 'Add to Tasks'}
      </button>
    </div>
  );
};

export default TaskForm;
