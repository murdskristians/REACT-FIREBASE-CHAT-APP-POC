import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../firebase/auth';
import './auth.css';

const ResetPassword: FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email format is incorrect');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword(email);
      // Navigate to a success page or show success message
      alert('Password reset email sent! Please check your inbox.');
      navigate('/auth/login');
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container-center">
        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="reset-password-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3398db" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>

          <div className="auth-form-header">
            <h2>Reset your password</h2>
            <p className="subtitle">
              Enter your email address and we'll send you password reset instructions.
            </p>
          </div>

          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="email">
                Registered Email <span className="required">*</span>
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className={error ? 'error' : ''}
              />
              {error && (
                <div className="error-message">
                  <span>⚠</span>
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="reset-password-buttons">
            <button
              type="submit"
              className="auth-button primary"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Recover password'}
            </button>

            <Link to="/auth/login">
              <button type="button" className="auth-button secondary">
                Back to login
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
