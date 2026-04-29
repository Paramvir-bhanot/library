'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl: '/dashboard',
      });

      if (!result?.ok) {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setLoading(true);
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Logo/Brand Section */}
        <div className="brand-section">
          <div className="brand-icon">✦</div>
          <h1 className="brand-name">Premium</h1>
          <p className="brand-subtitle">Welcome Back</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">!</span>
            {error}
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-footer">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link href="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`login-button ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span>Or continue with</span>
        </div>

        {/* Social Login Buttons */}
        <div className="social-login">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="social-button google"
            aria-label="Sign in with Google"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('facebook')}
            disabled={loading}
            className="social-button facebook"
            aria-label="Sign in with Facebook"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="signup-link">
          Don't have an account?{' '}
          <Link href="/signup" className="signup-anchor">
            Create one
          </Link>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="gradient-blob blob-1"></div>
      <div className="gradient-blob blob-2"></div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary: #D4AF37;
          --secondary: #F5F5F5;
          --background: #000000;
          --surface: #111111;
          --accent: #C9A227;
          --text-primary: #FFFFFF;
          --text-secondary: #BFBFBF;
          --error: #E53935;
          --success: #4CAF50;
          --border-light: #333333;
          --border-highlight: #D4AF37;
        }

        .login-container {
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(135deg, var(--background) 0%, #0a0a0a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .login-wrapper {
          width: 100%;
          max-width: 420px;
          background: var(--surface);
          border: 1px solid var(--border-light);
          border-radius: 16px;
          padding: 48px 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
          position: relative;
          z-index: 10;
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Brand Section */
        .brand-section {
          text-align: center;
          margin-bottom: 40px;
          animation: fadeIn 0.8s ease-out 0.1s both;
        }

        .brand-icon {
          font-size: 32px;
          margin-bottom: 16px;
          color: var(--primary);
          letter-spacing: 8px;
        }

        .brand-name {
          font-size: 28px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
          letter-spacing: -0.5px;
        }

        .brand-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 400;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Error Message */
        .error-message {
          background: rgba(229, 57, 53, 0.1);
          border: 1px solid rgba(229, 57, 53, 0.3);
          color: #ff6b6b;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: shake 0.3s ease-out;
        }

        .error-icon {
          font-weight: bold;
          font-size: 16px;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        /* Form */
        .login-form {
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 8px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-light);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 14px;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-input:hover {
          border-color: rgba(212, 175, 55, 0.3);
          background: rgba(255, 255, 255, 0.05);
        }

        .form-input:focus {
          border-color: var(--primary);
          background: rgba(212, 175, 55, 0.05);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }

        .form-input::placeholder {
          color: var(--text-secondary);
        }

        .form-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Form Footer */
        .form-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          font-size: 13px;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: color 0.3s ease;
        }

        .remember-me:hover {
          color: var(--text-primary);
        }

        .remember-me input[type='checkbox'] {
          cursor: pointer;
          width: 14px;
          height: 14px;
          accent-color: var(--primary);
        }

        .forgot-password {
          color: var(--primary);
          text-decoration: none;
          transition: color 0.3s ease;
          font-weight: 500;
        }

        .forgot-password:hover {
          color: var(--accent);
        }

        /* Login Button */
        .login-button {
          width: 100%;
          padding: 13px 24px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
          color: #000000;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-transform: uppercase;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-button.loading {
          gap: 10px;
        }

        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: #000000;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          margin: 30px 0;
          color: var(--text-secondary);
          font-size: 13px;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-light);
        }

        .divider span {
          padding: 0 12px;
        }

        /* Social Login */
        .social-login {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .social-button {
          flex: 1;
          padding: 11px 0;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-light);
          color: var(--text-primary);
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .social-button:hover:not(:disabled) {
          border-color: rgba(212, 175, 55, 0.5);
          background: rgba(212, 175, 55, 0.08);
        }

        .social-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .social-button svg {
          width: 18px;
          height: 18px;
        }

        .social-button.google:hover:not(:disabled) {
          color: #4285F4;
        }

        .social-button.facebook:hover:not(:disabled) {
          color: #1877F2;
        }

        /* Sign Up Link */
        .signup-link {
          text-align: center;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .signup-anchor {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .signup-anchor:hover {
          color: var(--accent);
        }

        /* Decorative Blobs */
        .gradient-blob {
          position: absolute;
          opacity: 0.05;
          filter: blur(80px);
          border-radius: 50%;
          pointer-events: none;
        }

        .blob-1 {
          width: 400px;
          height: 400px;
          background: var(--primary);
          top: -100px;
          left: -100px;
          animation: float 6s ease-in-out infinite;
        }

        .blob-2 {
          width: 300px;
          height: 300px;
          background: var(--accent);
          bottom: -50px;
          right: -50px;
          animation: float 8s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(30px, -30px);
          }
        }

        /* Responsive */
        @media (max-width: 480px) {
          .login-wrapper {
            padding: 32px 24px;
          }

          .brand-name {
            font-size: 24px;
          }

          .form-footer {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .social-login {
            flex-direction: column;
          }

          .social-button {
            flex-direction: row;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}