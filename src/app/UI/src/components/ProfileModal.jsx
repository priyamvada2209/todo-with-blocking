import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PasswordField } from './PasswordField';

export const ProfileModal = ({ isOpen, onClose }) => {
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
  const navigate = useNavigate();

  if (!isOpen || !user) {
    return null;
  }

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await updateProfile(editName);
      setSuccessMessage('Name updated successfully');
      setIsEditingName(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const errorData = error.response?.data?.error;
      if (errorData?.details) {
        setErrors(errorData.details);
      } else {
        setErrors({ name: errorData?.message || 'Failed to update name' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

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
      setSuccessMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const errorData = error.response?.data?.error;
      if (errorData?.details) {
        setErrors(errorData.details);
      } else {
        setErrors({ password: errorData?.message || 'Failed to change password' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
            <button
              onClick={onClose}
              className="text-2xl leading-none text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {successMessage && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {errors.general && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Account Information</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                {isEditingName ? (
                  <form onSubmit={handleUpdateName} className="flex gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingName(false);
                        setEditName(user.name);
                        setErrors({});
                      }}
                      className="rounded-lg bg-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900">{user.name}</p>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                )}
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <p className="rounded-lg bg-gray-50 px-3 py-2 text-gray-600">{user.email}</p>
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t pt-6">
            {!isChangingPassword ? (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700"
              >
                Change Password
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-3">
                <h4 className="font-medium text-gray-900">Change Password</h4>

                <PasswordField
                  id="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                  error={errors.current_password}
                  required
                  autoComplete="current-password"
                  ariaLabel="Current password"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-12 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                />

                <PasswordField
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  error={
                    Array.isArray(errors.new_password) ? (
                      <div className="space-y-1">
                        {errors.new_password.map((rule, idx) => <div key={idx}>- {rule}</div>)}
                      </div>
                    ) : (
                      errors.new_password
                    )
                  }
                  required
                  autoComplete="new-password"
                  ariaLabel="New password"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-12 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-12 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                />

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:bg-indigo-400"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setErrors({});
                    }}
                    className="flex-1 rounded-lg bg-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <button
              onClick={handleLogout}
              className="w-full rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};