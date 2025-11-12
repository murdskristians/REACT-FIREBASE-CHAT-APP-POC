import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { signInWithEmailPassword } from '../../firebase/auth';
import './auth.css';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
    };

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email format is incorrect';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailPassword(email, password);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      setErrors({
        email: '',
        password: error.message || 'Invalid credentials',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="auth-form-header">
        <h2>Login to your account</h2>
      </div>

      <div className="form-fields">
        <div className="form-group">
          <label htmlFor="email">
            Email address <span className="required">*</span>
          </label>
          <input
            type="text"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your registered email"
            className={errors.email ? 'error' : ''}
          />
          {errors.email && (
            <div className="error-message">
              <span>⚠</span>
              {errors.email}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">
            Password <span className="required">*</span>
          </label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={errors.password ? 'error' : ''}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && (
            <div className="error-message">
              <span>⚠</span>
              {errors.password}
            </div>
          )}
        </div>

        <div className="form-actions-row">
          <label className="remember-me">
            <input type="checkbox" />
            <span>Remember Me</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="auth-button primary"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;
