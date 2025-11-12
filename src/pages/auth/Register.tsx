import type { FC } from 'react';
import RegistrationForm from '../../components/auth/RegistrationForm';
import './auth.css';

const Register: FC = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <RegistrationForm />
        </div>

        <footer className="auth-footer">
          <p>© 2024-{new Date().getFullYear()} FireChat. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Register;
