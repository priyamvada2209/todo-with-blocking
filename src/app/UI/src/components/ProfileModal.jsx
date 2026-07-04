import React, { useEffect, useMemo, useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  BookOpen,
  Check,
  ChartNoAxesCombined,
  ChevronRight,
  Clock3,
  Flame,
  Loader2,
  Lock,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PasswordField } from './PasswordField';
import { mapApiErrorToFormErrors } from '../utils/apiErrors';
import * as api from '../services/api';

const surfaceClass = 'bg-[#faf9f6] text-[#303330]';
const cardClass = 'rounded-[2rem] border border-[#ede8e4] bg-white shadow-[0_30px_60px_-40px_rgba(48,51,48,0.18)]';
const softCardClass = 'rounded-[2rem] bg-[#f4f4f0] shadow-[0_30px_60px_-40px_rgba(48,51,48,0.14)]';
const pillButtonClass =
  'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#e5aed6]/50';
const inputClass =
  'w-full rounded-2xl bg-[#f4f4f0] px-4 py-3 text-sm text-[#303330] outline-none transition focus:bg-white focus:ring-2 focus:ring-[#e5aed6]/50';
const settingsRowClass = `${cardClass} flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:-translate-y-0.5`;

const formatPercent = (value) => `${Math.round(value)}%`;

const getMomentumMessage = (completed, total) => {
  if (total === 0) {
    return "No tasks scheduled today yet. Add one when you're ready.";
  }

  if (completed === total) {
    return `You've completed all ${total} ${total === 1 ? 'ritual' : 'rituals'} today.`;
  }

  return `You've completed ${completed} out of ${total} ${total === 1 ? 'ritual' : 'rituals'} today.`;
};

const getTodoDate = (todo) => {
  if (!todo?.date) {
    return null;
  }

  const parsed = parseISO(todo.date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getTaskMeta = (todo) => {
  const taskDate = getTodoDate(todo);
  const meta = [];

  if (taskDate) {
    meta.push(format(taskDate, 'MMM d'));
  }

  if (todo.sites?.length) {
    meta.push(todo.sites.length === 1 ? '1 resource' : `${todo.sites.length} resources`);
  }

  if (meta.length === 0) {
    meta.push('Planned');
  }

  return meta.join(' • ');
};

const getTaskIcon = (todo) => {
  if (todo.sites?.length) {
    return BookOpen;
  }

  const taskDate = getTodoDate(todo);
  if (taskDate) {
    return Clock3;
  }

  return Sparkles;
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

const ProfileInsightCard = ({ icon: Icon, iconClassName, label, value }) => (
  <div className={`${cardClass} flex items-center gap-4 p-5`}>
    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-sm text-[#797b78]">{label}</p>
      <p className="text-xl font-bold text-[#303330]">{value}</p>
    </div>
  </div>
);

const ProfileTaskRow = ({ todo, onToggle }) => {
  const Icon = getTaskIcon(todo);

  return (
    <button
      type="button"
      onClick={() => onToggle(todo)}
      className={`${cardClass} flex w-full items-center justify-between gap-4 px-5 py-6 text-left transition hover:-translate-y-0.5`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#d9c5d3] bg-white text-transparent transition">
          <Check className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="break-words text-[1.15rem] font-medium leading-tight text-[#202422]">{todo.task}</p>
          <p className="mt-2 text-sm text-[#5d605c]">{getTaskMeta(todo)}</p>
        </div>
      </div>
      <Icon className="h-6 w-6 flex-shrink-0 text-[#b5afb2]" />
    </button>
  );
};

const CommitmentsSection = ({ title, tasks, onToggle, emptyLabel }) => (
  <section className="space-y-4">
    <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#514a51]">{title}</p>
    <div className="space-y-4">
      {tasks.length > 0 ? (
        tasks.map((todo) => <ProfileTaskRow key={todo.id} todo={todo} onToggle={onToggle} />)
      ) : (
        <div className={`${cardClass} px-5 py-6 text-sm text-[#797b78]`}>{emptyLabel}</div>
      )}
    </div>
  </section>
);

const SettingsRow = ({ icon: Icon, label, tone = 'default', onClick, endIcon = true }) => (
  <button
    type="button"
    onClick={onClick}
    className={`${settingsRowClass} ${tone === 'danger' ? 'text-[#cf302a]' : 'text-[#303330]'}`}
  >
    <div className="flex items-center gap-4">
      <Icon className={`h-6 w-6 ${tone === 'danger' ? 'text-[#cf302a]' : 'text-[#7e5073]'}`} />
      <span className="text-[1.05rem] font-medium">{label}</span>
    </div>
    {endIcon ? <ChevronRight className={`h-5 w-5 ${tone === 'danger' ? 'text-[#cf302a]' : 'text-[#7f777b]'}`} /> : null}
  </button>
);

export const ProfileModal = ({ isOpen, onClose, onTasksChanged }) => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayTasks, setTodayTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setEditName(user?.name || '');
  }, [user]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fetchProfileData = async () => {
      setScheduleLoading(true);
      setScheduleError('');

      const today = new Date();

      try {
        const [todayItems, everyTask] = await Promise.all([api.getTodos(format(today, 'yyyy-MM-dd')), api.getTodos()]);
        setTodayTasks(todayItems);
        setAllTasks(everyTask);
      } catch (error) {
        console.error('Failed to load profile schedule:', error);
        setScheduleError('Could not load your dashboard snapshot.');
      } finally {
        setScheduleLoading(false);
      }
    };

    fetchProfileData();
  }, [isOpen]);

  const openTasks = useMemo(() => allTasks.filter((todo) => !todo.is_completed), [allTasks]);

  const groupedTasks = useMemo(() => {
    const today = new Date();
    const todayOpen = todayTasks.filter((todo) => !todo.is_completed);
    const laterOpen = openTasks.filter((todo) => {
      const taskDate = getTodoDate(todo);
      return !taskDate || !isSameDay(taskDate, today);
    });

    return {
      todayOpen,
      laterOpen,
    };
  }, [openTasks, todayTasks]);

  const stats = useMemo(() => {
    const totalCompleted = allTasks.filter((todo) => todo.is_completed).length;
    const totalTasks = allTasks.length;
    const upcomingCount = openTasks.length;
    const todayCompleted = todayTasks.filter((todo) => todo.is_completed).length;
    const todayTotal = todayTasks.length;
    const completionRate = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;
    const dailyMomentum = todayTotal > 0 ? (todayCompleted / todayTotal) * 100 : 0;

    return {
      completionRate,
      dailyMomentum,
      todayCompleted,
      todayTotal,
      totalCompleted,
      upcomingCount,
    };
  }, [allTasks, openTasks.length, todayTasks]);

  if (!isOpen || !user) {
    return null;
  }

  const resetFeedback = () => {
    setErrors({});
    setSuccessMessage('');
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    resetFeedback();
    setIsSubmitting(true);

    try {
      await updateProfile(editName);
      setSuccessMessage('Name updated successfully.');
      setIsEditingName(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors(mapApiErrorToFormErrors(error, { fallbackMessage: 'Failed to update name' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    resetFeedback();

    if (currentPassword === newPassword) {
      setErrors({ password: 'New password cannot be the same as your current password' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ password: 'New passwords do not match' });
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword(currentPassword, newPassword);
      setSuccessMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors(
        mapApiErrorToFormErrors(error, {
          fallbackMessage: 'Failed to change password',
          detailToGeneralKeys: ['current_password'],
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTodo = async (todo) => {
    try {
      const updatedTodo = await api.completeTodo(todo.id);
      setTodayTasks((currentTasks) => currentTasks.map((item) => (item.id === todo.id ? updatedTodo : item)));
      setAllTasks((currentTasks) => currentTasks.map((item) => (item.id === todo.id ? updatedTodo : item)));
      onTasksChanged?.();
    } catch (error) {
      console.error('Failed to update task from profile modal:', error);
      setScheduleError('Could not update that task just now.');
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[rgba(48,51,48,0.12)] backdrop-blur-sm" onClick={onClose} />

      <div className={`fixed inset-0 z-50 overflow-y-auto ${surfaceClass}`}>
        <div className="min-h-full">
          <header className="sticky top-0 z-10 bg-[#faf9f6]/95 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-8 lg:px-10">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#7e5073] transition hover:bg-white"
                aria-label="Close profile dashboard"
              >
                <ArrowLeft className="h-7 w-7" />
              </button>

              <h2 className="flex-1 px-4 text-center text-[1.15rem] font-bold text-[#6d4463] sm:text-[1.8rem]">Profile &amp; Dashboard</h2>

            </div>
          </header>

          <div className="mx-auto w-full max-w-6xl px-6 pb-12 pt-4 sm:px-8 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_30rem] lg:items-start">
              <div className="space-y-8">
                <section className={`${cardClass} px-6 py-8 sm:px-8`}>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-[2rem] font-bold tracking-[-0.03em] text-[#202422]">Daily Momentum</h3>
                    <span className="text-[2rem] font-bold text-[#6d4463]">{formatPercent(stats.dailyMomentum)}</span>
                  </div>

                  <div className="mt-8 h-4 overflow-hidden rounded-full bg-[#e7e3e0]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#df9dd5] via-[#d995d1] to-[#c988bf] transition-all"
                      style={{ width: `${stats.dailyMomentum}%` }}
                    />
                  </div>

                  <p className="mt-8 max-w-2xl text-[1.1rem] leading-9 text-[#4f4b4d] sm:text-[1.2rem]">
                    {getMomentumMessage(stats.todayCompleted, stats.todayTotal)}
                    {stats.todayTotal > 0 && stats.todayCompleted < stats.todayTotal ? ' Keep the flow going!' : ''}
                  </p>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-[2.5rem] font-black tracking-[-0.05em] text-[#1f2321] sm:text-[3.5rem]">Your Commitments</h3>
                    <span className="pt-2 text-sm font-bold uppercase tracking-[0.16em] text-[#7e5073]">View All</span>
                  </div>

                  {scheduleLoading ? (
                    <div className={`${cardClass} flex items-center justify-center p-10`}>
                      <Loader2 className="h-8 w-8 animate-spin text-[#7e5073]" />
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <CommitmentsSection
                        title="Today"
                        tasks={groupedTasks.todayOpen}
                        onToggle={handleToggleTodo}
                        emptyLabel="No open rituals for today."
                      />
                      <CommitmentsSection
                        title={groupedTasks.laterOpen.length > 0 ? 'Open' : 'Later'}
                        tasks={groupedTasks.laterOpen}
                        onToggle={handleToggleTodo}
                        emptyLabel="No upcoming rituals waiting right now."
                      />
                    </div>
                  )}
                </section>
              </div>

              <aside className="space-y-6">
                <section className="flex items-center gap-4 px-2 py-1">
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e8d8cb] to-[#b78772] text-xl font-bold text-white shadow-[0_24px_50px_-35px_rgba(48,51,48,0.35)]">
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="break-words text-[2rem] font-bold tracking-[-0.04em] text-[#202422]">{user.name}</h3>
                    <p className="break-all text-[1.05rem] text-[#5d605c]">{user.email}</p>
                  </div>
                </section>

                <section className="space-y-4">
                  {isEditingName ? (
                    <form onSubmit={handleUpdateName} className={`${cardClass} space-y-4 p-5`}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={inputClass}
                        required
                      />
                      {errors.name && <p className="text-sm text-[#a8364b]">{errors.name}</p>}
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`${pillButtonClass} flex-1 bg-gradient-to-r from-[#7e5073] to-[#e5aed6] text-white disabled:opacity-60`}
                        >
                          {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingName(false);
                            setEditName(user.name);
                            resetFeedback();
                          }}
                          className={`${pillButtonClass} flex-1 bg-[#f4f4f0] text-[#7e5073]`}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingName(true);
                        resetFeedback();
                      }}
                      className={`${pillButtonClass} ${cardClass} w-full bg-white py-5 text-[#7e5073]`}
                    >
                      Edit Name
                    </button>
                  )}
                </section>

                <section className="space-y-4">
                  <p className="px-2 text-xs font-bold uppercase tracking-[0.3em] text-[#797b78]">Insights</p>
                  <ProfileInsightCard
                    icon={BadgeCheck}
                    iconClassName="bg-[#fddada] text-[#644c4c]"
                    label="Tasks completed"
                    value={stats.totalCompleted}
                  />
                  <ProfileInsightCard
                    icon={Flame}
                    iconClassName="bg-[#f3e9de] text-[#5c564e]"
                    label="Open tasks"
                    value={stats.upcomingCount}
                  />
                  <ProfileInsightCard
                    icon={ChartNoAxesCombined}
                    iconClassName="bg-[#f3bbe4] text-[#5f3557]"
                    label="Completion rate"
                    value={formatPercent(stats.completionRate)}
                  />
                </section>

                <section className="space-y-4">
                  <SettingsRow
                    icon={Lock}
                    label={isChangingPassword ? 'Cancel Password Update' : 'Change Password'}
                    onClick={() => {
                      setIsChangingPassword((current) => !current);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      resetFeedback();
                    }}
                  />

                  {isChangingPassword && (
                    <form onSubmit={handleChangePassword} className={`${cardClass} space-y-3 p-5`}>
                      <PasswordField
                        id="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current Password"
                        error={errors.current_password}
                        required
                        autoComplete="current-password"
                        ariaLabel="Current password"
                        className={inputClass}
                      />
                      <PasswordField
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password"
                        error={
                          Array.isArray(errors.new_password) ? (
                            <div className="space-y-1">
                              {errors.new_password.map((rule, idx) => (
                                <div key={idx}>- {rule}</div>
                              ))}
                            </div>
                          ) : (
                            errors.new_password
                          )
                        }
                        required
                        autoComplete="new-password"
                        ariaLabel="New password"
                        className={inputClass}
                      />
                      <PasswordField
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm New Password"
                        error={errors.password}
                        required
                        autoComplete="new-password"
                        ariaLabel="Confirm new password"
                        className={inputClass}
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`${pillButtonClass} w-full bg-gradient-to-r from-[#7e5073] to-[#e5aed6] text-white disabled:opacity-60`}
                      >
                        {isSubmitting ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  )}

                  <div className={`${settingsRowClass} cursor-default text-[#303330]/55`}>
                    <div className="flex items-center gap-4">
                      <Bell className="h-6 w-6 text-[#7e5073]" />
                      <span className="text-[1.05rem] font-medium">Notification Settings</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#7f777b]" />
                  </div>

                  <SettingsRow icon={LogOut} label="Logout" tone="danger" endIcon={false} onClick={handleLogout} />
                </section>

                {(successMessage || errors.general || scheduleError) && (
                  <section className={`${cardClass} space-y-2 p-5`}>
                    {successMessage && <p className="text-sm font-medium text-[#5f3557]">{successMessage}</p>}
                    {errors.general && <p className="text-sm font-medium text-[#a8364b]">{errors.general}</p>}
                    {scheduleError && <p className="text-sm font-medium text-[#a8364b]">{scheduleError}</p>}
                  </section>
                )}
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

