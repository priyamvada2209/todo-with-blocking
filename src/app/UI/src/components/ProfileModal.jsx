import React, { useEffect, useMemo, useState } from 'react';
import { addDays, format } from 'date-fns';
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  ChartNoAxesCombined,
  Flame,
  Loader2,
  LogOut,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PasswordField } from './PasswordField';
import { mapApiErrorToFormErrors } from '../utils/apiErrors';
import * as api from '../services/api';

const surfaceClass = 'bg-[#faf9f6] text-[#303330]';
const cardClass = 'rounded-[2rem] bg-white shadow-[0_30px_60px_-40px_rgba(48,51,48,0.25)]';
const softCardClass = 'rounded-[2rem] bg-[#f4f4f0] shadow-[0_30px_60px_-40px_rgba(48,51,48,0.18)]';
const pillButtonClass =
  'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#e5aed6]/50';
const inputClass =
  'w-full rounded-2xl bg-[#f4f4f0] px-4 py-3 text-sm text-[#303330] outline-none transition focus:bg-white focus:ring-2 focus:ring-[#e5aed6]/50';

const formatTodoMeta = (todo) => {
  if (todo.is_completed) {
    return 'Done';
  }

  if (todo.sites?.length) {
    return `${todo.sites.length} ${todo.sites.length === 1 ? 'link' : 'links'}`;
  }

  return 'Planned';
};

const formatPercent = (value) => `${Math.round(value)}%`;

const ProfileInsightCard = ({ icon: Icon, iconClassName, label, value }) => (
  <div className={`${cardClass} flex items-center gap-4 p-5`}>
    <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconClassName}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-sm text-[#797b78]">{label}</p>
      <p className="text-xl font-bold text-[#303330]">{value}</p>
    </div>
  </div>
);

const ProfileTaskRow = ({ todo, onToggle }) => (
  <button
    type="button"
    onClick={() => onToggle(todo)}
    className={`${cardClass} flex w-full items-center justify-between gap-4 p-5 text-left transition hover:-translate-y-0.5`}
  >
    <div className="flex min-w-0 items-center gap-4">
      <span
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
          todo.is_completed
            ? 'border-[#7e5073] bg-[#7e5073] text-white'
            : 'border-[#e5aed6] bg-white text-transparent'
        }`}
      >
        <Check className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p
          className={`truncate text-base font-semibold ${
            todo.is_completed ? 'text-[#797b78] line-through' : 'text-[#303330]'
          }`}
        >
          {todo.task}
        </p>
        {todo.sites?.length > 0 && (
          <p className="mt-1 text-xs text-[#797b78]">
            {todo.sites.length} {todo.sites.length === 1 ? 'resource attached' : 'resources attached'}
          </p>
        )}
      </div>
    </div>
    <span className="flex-shrink-0 text-sm font-medium text-[#797b78]">{formatTodoMeta(todo)}</span>
  </button>
);

const ProfileTaskSection = ({ label, accentClassName, tasks, onToggle }) => {
  const visibleTasks = tasks.slice(0, 3);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <span className={`h-2 w-2 rounded-full ${accentClassName}`} />
        <h3 className="text-lg font-medium text-[#5d605c]">{label}</h3>
      </div>

      <div className="space-y-4">
        {visibleTasks.length > 0 ? (
          <>
            {visibleTasks.map((todo) => (
              <ProfileTaskRow key={todo.id} todo={todo} onToggle={onToggle} />
            ))}
            {tasks.length > visibleTasks.length && (
              <p className="px-5 text-sm font-medium text-[#7e5073]">
                +{tasks.length - visibleTasks.length} more {tasks.length - visibleTasks.length === 1 ? 'task' : 'tasks'}
              </p>
            )}
          </>
        ) : (
          <div className={`${cardClass} p-5 text-sm text-[#797b78]`}>Nothing scheduled yet.</div>
        )}
      </div>
    </section>
  );
};

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
  const [schedule, setSchedule] = useState({ today: [], tomorrow: [] });
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

    const fetchSchedule = async () => {
      setScheduleLoading(true);
      setScheduleError('');

      const today = new Date();
      const tomorrow = addDays(today, 1);

      try {
        const [todayTasks, tomorrowTasks, everyTask] = await Promise.all([
          api.getTodos(format(today, 'yyyy-MM-dd')),
          api.getTodos(format(tomorrow, 'yyyy-MM-dd')),
          api.getTodos(),
        ]);

        setSchedule({ today: todayTasks, tomorrow: tomorrowTasks });
        setAllTasks(everyTask);
      } catch (error) {
        console.error('Failed to load profile schedule:', error);
        setScheduleError('Could not load your dashboard snapshot.');
      } finally {
        setScheduleLoading(false);
      }
    };

    fetchSchedule();
  }, [isOpen]);

  const stats = useMemo(() => {
    const totalCompleted = allTasks.filter((todo) => todo.is_completed).length;
    const totalTasks = allTasks.length;
    const upcomingCount = allTasks.filter((todo) => !todo.is_completed).length;
    const todayCompleted = schedule.today.filter((todo) => todo.is_completed).length;
    const todayTotal = schedule.today.length;
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
  }, [allTasks, schedule]);

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
      setErrors(
        mapApiErrorToFormErrors(error, {
          fallbackMessage: 'Failed to update name',
        })
      );
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

      setSchedule((currentSchedule) => ({
        today: currentSchedule.today.map((item) => (item.id === todo.id ? updatedTodo : item)),
        tomorrow: currentSchedule.tomorrow.map((item) => (item.id === todo.id ? updatedTodo : item)),
      }));
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
      <div className="fixed inset-0 z-40 bg-[rgba(48,51,48,0.18)] backdrop-blur-sm" onClick={onClose} />

      <div className={`fixed inset-0 z-50 overflow-y-auto ${surfaceClass}`}>
        <div className="min-h-full">
          <header className="sticky top-0 z-10 border-b border-white/40 bg-[#faf9f6]/90 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-2 text-sm font-medium text-[#5d605c] transition hover:text-[#7e5073]"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back
                </button>
                <h2 className="text-lg font-bold text-[#7e5073] sm:text-2xl">Profile &amp; Dashboard</h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-[#7e5073] shadow-[0_20px_40px_-30px_rgba(48,51,48,0.35)] transition hover:scale-[1.02]"
                aria-label="Close profile dashboard"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-10 lg:py-10">
            <div className="space-y-8">
              <section className={`${cardClass} relative overflow-hidden p-6 sm:p-8`}>
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#f3bbe4]/25 blur-3xl" />
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#797b78]">Daily Momentum</p>
                    <div className="mt-3 flex items-baseline gap-3">
                      <span className="text-3xl font-black text-[#303330] sm:text-4xl">
                        {stats.todayCompleted} / {stats.todayTotal}
                      </span>
                      <span className="text-base text-[#5d605c] sm:text-xl">Tasks completed today</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-3xl font-black text-[#7e5073] sm:text-4xl">
                      {formatPercent(stats.dailyMomentum)}
                    </span>
                  </div>
                </div>

                <div className="mt-8 h-4 rounded-full bg-[#f4f4f0]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7e5073] to-[#e5aed6] transition-all"
                    style={{ width: `${stats.dailyMomentum}%` }}
                  />
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-[#303330]">Your Commitments</h3>
                  <MoreHorizontal className="h-5 w-5 text-[#797b78]" />
                </div>

                {scheduleLoading ? (
                  <div className={`${cardClass} flex items-center justify-center p-10`}>
                    <Loader2 className="h-8 w-8 animate-spin text-[#7e5073]" />
                  </div>
                ) : (
                  <div className="space-y-8">
                    <ProfileTaskSection
                      label="Today"
                      accentClassName="bg-[#7e5073]"
                      tasks={schedule.today}
                      onToggle={handleToggleTodo}
                    />
                    <ProfileTaskSection
                      label="Tomorrow"
                      accentClassName="bg-[#645e56]"
                      tasks={schedule.tomorrow}
                      onToggle={handleToggleTodo}
                    />
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-6">
              <section className={`${softCardClass} p-6 text-center`}>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#303330]">{user.name}</h3>
                  <p className="text-sm text-[#5d605c]">{user.email}</p>
                </div>

                <div className="mt-6">
                  {isEditingName ? (
                    <form onSubmit={handleUpdateName} className="space-y-3 text-left">
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
                          className={`${pillButtonClass} flex-1 bg-white text-[#7e5073]`}
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
                      className={`${pillButtonClass} w-full bg-white text-[#7e5073] shadow-[0_20px_40px_-30px_rgba(48,51,48,0.35)]`}
                    >
                      Edit Name
                    </button>
                  )}
                </div>
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

              <section className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword((current) => !current);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    resetFeedback();
                  }}
                  className={`${pillButtonClass} w-full bg-transparent text-[#5d605c] ring-1 ring-[#b0b3ae]/30 hover:bg-white/70`}
                >
                  {isChangingPassword ? 'Cancel Password Update' : 'Change Password'}
                </button>

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

                <button
                  type="button"
                  onClick={handleLogout}
                  className={`${pillButtonClass} w-full gap-2 bg-[#fddada] text-[#644c4c] hover:opacity-90`}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
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
    </>
  );
};
