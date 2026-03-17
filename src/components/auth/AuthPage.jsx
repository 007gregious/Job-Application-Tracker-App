import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import { authService } from '../../services/authService';

const initialSignIn = { email: '', password: '' };
const initialSignUp = { name: '', email: '', password: '', confirmPassword: '' };

const AuthPage = ({ onAuthenticated }) => {
  const hasUsers = useMemo(() => authService.getUsers().length > 0, []);
  const [mode, setMode] = useState(hasUsers ? 'signin' : 'signup');
  const [signInData, setSignInData] = useState(initialSignIn);
  const [signUpData, setSignUpData] = useState(initialSignUp);
  const [errors, setErrors] = useState({});

  const clearErrors = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateSignUp = () => {
    const nextErrors = {};

    if (!signUpData.name.trim()) nextErrors.name = 'Name is required';
    if (!signUpData.email.trim()) nextErrors.email = 'Email is required';
    if (!signUpData.password.trim()) nextErrors.password = 'Password is required';
    if (signUpData.password.length < 6) nextErrors.password = 'Password should be at least 6 characters';
    if (signUpData.confirmPassword !== signUpData.password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    return nextErrors;
  };

  const handleSignIn = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!signInData.email.trim()) nextErrors.email = 'Email is required';
    if (!signInData.password.trim()) nextErrors.password = 'Password is required';

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      const user = authService.signIn(signInData);
      toast.success(`Welcome back, ${user.name}!`);
      onAuthenticated(user);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSignUp = (event) => {
    event.preventDefault();
    const nextErrors = validateSignUp();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      const user = authService.signUp(signUpData);
      toast.success('Account created successfully!');
      onAuthenticated(user);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const renderToggle = () => (
    <div className="auth-toggle" role="tablist" aria-label="Authentication mode">
      <button
        className={mode === 'signin' ? 'active' : ''}
        onClick={() => {
          setMode('signin');
          setErrors({});
        }}
        type="button"
      >
        Sign In
      </button>
      <button
        className={mode === 'signup' ? 'active' : ''}
        onClick={() => {
          setMode('signup');
          setErrors({});
        }}
        type="button"
      >
        Sign Up
      </button>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="auth-subtitle">
          {mode === 'signin'
            ? 'Sign in to continue tracking your applications.'
            : 'Sign up to start organizing your job search journey.'}
        </p>

        {renderToggle()}

        {mode === 'signin' ? (
          <form onSubmit={handleSignIn}>
            <Input
              label="Email"
              type="email"
              name="email"
              value={signInData.email}
              onChange={(e) => {
                setSignInData((prev) => ({ ...prev, email: e.target.value }));
                clearErrors('email');
              }}
              required
              error={errors.email}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={signInData.password}
              onChange={(e) => {
                setSignInData((prev) => ({ ...prev, password: e.target.value }));
                clearErrors('password');
              }}
              required
              error={errors.password}
              placeholder="Enter your password"
            />
            <Button type="submit" variant="primary">Sign In</Button>
          </form>
        ) : (
          <form onSubmit={handleSignUp}>
            <Input
              label="Full Name"
              name="name"
              value={signUpData.name}
              onChange={(e) => {
                setSignUpData((prev) => ({ ...prev, name: e.target.value }));
                clearErrors('name');
              }}
              required
              error={errors.name}
              placeholder="John Doe"
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={signUpData.email}
              onChange={(e) => {
                setSignUpData((prev) => ({ ...prev, email: e.target.value }));
                clearErrors('email');
              }}
              required
              error={errors.email}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={signUpData.password}
              onChange={(e) => {
                setSignUpData((prev) => ({ ...prev, password: e.target.value }));
                clearErrors('password');
              }}
              required
              error={errors.password}
              placeholder="At least 6 characters"
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={signUpData.confirmPassword}
              onChange={(e) => {
                setSignUpData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                clearErrors('confirmPassword');
              }}
              required
              error={errors.confirmPassword}
              placeholder="Re-enter password"
            />
            <Button type="submit" variant="primary">Create Account</Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
