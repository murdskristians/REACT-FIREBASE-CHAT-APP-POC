import { useState, useMemo } from 'react';
import type { FC, FormEvent } from 'react';
import { signUpWithEmailPassword } from '../../firebase/auth';
import { useNavigate } from 'react-router-dom';
import './auth.css';

const RegistrationForm: FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name);
  };

  const validateField = (name: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'firstName':
        if (!formData.firstName) {
          newErrors.firstName = 'First name is required';
        } else if (formData.firstName.length < 2) {
          newErrors.firstName = 'First name must be at least 2 characters';
        } else {
          newErrors.firstName = '';
        }
        break;
      case 'lastName':
        if (!formData.lastName) {
          newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.length < 2) {
          newErrors.lastName = 'Last name must be at least 2 characters';
        } else {
          newErrors.lastName = '';
        }
        break;
      case 'email':
        if (!formData.email) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email format is incorrect';
        } else {
          newErrors.email = '';
        }
        break;
      case 'password':
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else {
          newErrors.password = '';
        }
        if (touched.confirmPassword && formData.confirmPassword !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else if (touched.confirmPassword) {
          newErrors.confirmPassword = '';
        }
        break;
      case 'confirmPassword':
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Confirm password is required';
        } else if (formData.confirmPassword !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          newErrors.confirmPassword = '';
        }
        break;
    }

    setErrors(newErrors);
  };

  const isFormValid = useMemo(() => {
    const allFieldsFilled = Object.values(formData).every((value) => value.trim() !== '');
    if (!allFieldsFilled) return false;

    const hasErrors = Object.entries(formData).some(([name]) => {
      if (name === 'firstName' && formData.firstName.length < 2) return true;
      if (name === 'lastName' && formData.lastName.length < 2) return true;
      if (name === 'email' && !/\S+@\S+\.\S+/.test(formData.email)) return true;
      if (name === 'password' && formData.password.length < 8) return true;
      if (name === 'confirmPassword' && formData.confirmPassword !== formData.password) return true;
      return false;
    });

    return !hasErrors;
  }, [formData]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signUpWithEmailPassword(formData.email, formData.password);

      // Update the user profile with display name
      if (userCredential.user) {
        await userCredential.user.updateProfile({
          displayName: `${formData.firstName} ${formData.lastName}`,
        });
      }

      navigate('/');
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: error.message || 'Registration failed',
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="auth-form-header">
        <h2>Create your account</h2>
        <p className="subtitle">Join us and get started with your chat experience</p>
      </div>

      <div className="form-fields">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">
              First name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Robert"
              className={errors.firstName && touched.firstName ? 'error' : ''}
            />
            {touched.firstName && errors.firstName && (
              <div className="error-message">
                <span>⚠</span>
                {errors.firstName}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">
              Last name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Cooper"
              className={errors.lastName && touched.lastName ? 'error' : ''}
            />
            {touched.lastName && errors.lastName && (
              <div className="error-message">
                <span>⚠</span>
                {errors.lastName}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">
            Email address <span className="required">*</span>
          </label>
          <input
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="robert.cooper@example.com"
            className={errors.email && touched.email ? 'error' : ''}
          />
          {touched.email && errors.email && (
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
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              className={errors.password && touched.password ? 'error' : ''}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {touched.password && errors.password && (
            <div className="error-message">
              <span>⚠</span>
              {errors.password}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">
            Confirm Password <span className="required">*</span>
          </label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              className={errors.confirmPassword && touched.confirmPassword ? 'error' : ''}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <div className="error-message">
              <span>⚠</span>
              {errors.confirmPassword}
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="auth-button primary"
        disabled={!isFormValid || loading}
      >
        {loading ? 'Creating account...' : 'Create account'}
      </button>

      <button
        type="button"
        className="auth-button secondary"
        onClick={() => navigate('/auth/login')}
      >
        Back to login
      </button>
    </form>
  );
};

export default RegistrationForm;
