import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PasswordField } from '../components/PasswordField';
import { mapApiErrorToFormErrors } from '../utils/apiErrors';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (error) {
      setErrors(
        mapApiErrorToFormErrors(error, {
          fallbackMessage: 'Login failed. Please try again.',
          detailToGeneralKeys: ['credentials'],
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf9f6] px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(243,187,228,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(229,174,214,0.18),transparent_28%)]" />
      <div className="glass relative w-full max-w-md rounded-[2rem] p-8 shadow-[0_40px_70px_-45px_rgba(48,51,48,0.35)]">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#e5aed6] to-transparent" />
        <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-[0.3em] text-[#7e5073]">Welcome Back</p>
        <h1 className="mb-2 text-center text-3xl font-bold text-[#303330]">Login</h1>
        {/* <p className="mb-6 text-center text-[#5d605c]">Step back into your daily ritual.</p> */}

        {errors.general && (
          <div className="mb-4 rounded-2xl bg-[#fff1f4] p-4 text-sm text-[#a8364b]">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#5d605c]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full rounded-2xl bg-[#f4f4f0] px-4 py-3 text-[#303330] transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e5aed6]/60"
              required
            />
            {errors.email && <p className="mt-1 text-sm text-[#a8364b]">{errors.email}</p>}
          </div>

          <PasswordField
            id="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            error={errors.password}
            required
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-[#7e5073] to-[#e5aed6] py-3 font-semibold text-white shadow-[0_24px_45px_-30px_rgba(126,80,115,0.6)] transition duration-200 hover:scale-[1.01] disabled:opacity-60"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-[#5d605c]">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[#7e5073] hover:text-[#5f3557]">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
