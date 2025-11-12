import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Button from './components/Button';
import Channel from './components/Channel';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import './App.css';

import {
  type FirebaseUser,
  getCurrentUser,
  signOut,
  subscribeToAuthChanges,
} from './firebase/auth';

function App() {
  const [user, setUser] = useState<FirebaseUser | null>(() => getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error((error as Error).message);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route
          path="/auth/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/auth/register"
          element={user ? <Navigate to="/" replace /> : <Register />}
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            user ? (
              <div className="app-container">
                <div className="app-header">
                  <h1>Welcome to chat</h1>
                  <Button onClick={handleSignOut} className="header-sign-out-button">
                    Sign out.
                  </Button>
                </div>
                <div className="chat-container">
                  <Channel user={user} />
                </div>
              </div>
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
