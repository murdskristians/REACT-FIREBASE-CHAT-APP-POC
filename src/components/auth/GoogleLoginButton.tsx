import { useState } from 'react';
import type { FC } from 'react';
import { signInWithGoogle } from '../../firebase/auth';
import './auth.css';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
}

const GoogleLoginButton: FC<GoogleLoginButtonProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="social-auth-button"
      onClick={handleGoogleLogin}
      disabled={loading}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M19.8055 10.2292C19.8055 9.55156 19.7501 8.86719 19.6325 8.19531H10.2002V12.0492H15.6014C15.3773 13.2911 14.6719 14.3898 13.6388 15.0875V17.5867H16.8617C18.7174 15.8461 19.8055 13.2728 19.8055 10.2292Z"
          fill="#4285F4"
        />
        <path
          d="M10.2002 20.0008C12.9527 20.0008 15.2721 19.1039 16.8653 17.5867L13.6424 15.0875C12.7608 15.6977 11.6124 16.0437 10.2037 16.0437C7.5479 16.0437 5.28936 14.2836 4.51545 11.9094H1.19385V14.4828C2.82051 17.7211 6.37148 20.0008 10.2002 20.0008Z"
          fill="#34A853"
        />
        <path
          d="M4.51184 11.9094C4.06512 10.6676 4.06512 9.33594 4.51184 8.09414V5.52078H1.19389C-0.204387 8.3157 -0.204387 11.6883 1.19389 14.4832L4.51184 11.9094Z"
          fill="#FBBC04"
        />
        <path
          d="M10.2002 3.95781C11.6866 3.93594 13.1233 4.47187 14.2126 5.46875L17.0761 2.60547C15.1825 0.826563 12.7332 -0.168359 10.2002 -0.143359C6.37148 -0.143359 2.82051 2.13633 1.19385 5.52109L4.51181 8.09445C5.28209 5.71641 7.54427 3.95781 10.2002 3.95781Z"
          fill="#EA4335"
        />
      </svg>
      {loading ? 'Signing in...' : 'Google'}
    </button>
  );
};

export default GoogleLoginButton;
