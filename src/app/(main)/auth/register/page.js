'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hover, setHover] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // ----- Theme tokens -----
  const theme = {
    primary: '#D4AF37',
    primaryHover: '#C9A227',
    secondary: '#F5F5F5',
    background: '#000000',
    surface: '#111111',
    textPrimary: '#FFFFFF',
    textSecondary: '#BFBFBF',
    textHighlight: '#D4AF37',
    borderLight: '#333333',
    borderHighlight: '#D4AF37',
    success: '#4CAF50',
    error: '#E53935',
    warning: '#FFB300',
    info: '#2196F3',
    black: '#000000',
  };

  // ----- Inline style objects -----
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: theme.background,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1rem',
    },
    bgAccent1: {
      position: 'absolute',
      top: '-10%',
      left: '-10%',
      width: '500px',
      height: '500px',
      borderRadius: '50%',
      background: `radial-gradient(circle, ${theme.primary}15, transparent 70%)`,
      zIndex: 0,
    },
    bgAccent2: {
      position: 'absolute',
      bottom: '-10%',
      right: '-10%',
      width: '400px',
      height: '400px',
      borderRadius: '50%',
      background: `radial-gradient(circle, ${theme.primary}10, transparent 70%)`,
      zIndex: 0,
    },
    formWrapper: {
      position: 'relative',
      zIndex: 1,
      width: '100%',
      maxWidth: '420px',
      background: theme.surface,
      borderRadius: '12px',
      padding: '2rem 2rem 1.5rem',
      boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.15)',
      border: `1px solid ${theme.borderLight}`,
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    title: {
      color: theme.textPrimary,
      fontSize: '1.75rem',
      fontWeight: 600,
      margin: 0,
      letterSpacing: '-0.5px',
    },
    subtitle: {
      color: theme.textSecondary,
      margin: '0.5rem 0 0',
      fontSize: '0.95rem',
    },
    successMessage: {
      textAlign: 'center',
      padding: '2rem 0',
    },
    successIcon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      background: theme.success,
      color: theme.black,
      fontSize: '1.8rem',
      fontWeight: 'bold',
      marginBottom: '1.25rem',
    },
    redirectText: {
      color: theme.textSecondary,
      fontSize: '0.85rem',
      marginTop: '0.5rem',
      fontStyle: 'italic',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
    },
    label: {
      color: theme.textSecondary,
      fontSize: '0.85rem',
      fontWeight: 500,
      letterSpacing: '0.3px',
    },
    input: {
      background: theme.background,
      border: `1px solid ${theme.borderLight}`,
      borderRadius: '6px',
      padding: '0.75rem 0.9rem',
      fontSize: '0.95rem',
      color: theme.textPrimary,
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      boxSizing: 'border-box',
    },
    inputFocus: {
      borderColor: theme.primary,
      boxShadow: `0 0 0 1px ${theme.primary}`,
    },
    errorMessage: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      background: `${theme.error}10`,
      border: `1px solid ${theme.error}40`,
      borderRadius: '6px',
      padding: '0.65rem 0.9rem',
      color: theme.error,
      fontSize: '0.85rem',
      fontWeight: 500,
    },
    errorIcon: {
      fontSize: '1.1rem',
    },
    submitBtn: {
      width: '100%',
      padding: '0.8rem',
      background: hover && !loading ? theme.primaryHover : theme.primary,
      color: theme.black,
      border: 'none',
      borderRadius: '6px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1,
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      marginTop: '0.25rem',
    },
    spinner: {
      width: '18px',
      height: '18px',
      border: '2px solid rgba(0,0,0,0.3)',
      borderTop: `2px solid ${theme.black}`,
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
    },
    loginLink: {
      textAlign: 'center',
      color: theme.textSecondary,
      fontSize: '0.9rem',
      marginTop: '0.25rem',
    },
    link: {
      color: theme.primary,
      textDecoration: 'none',
      fontWeight: 500,
      cursor: 'pointer',
    },
    footer: {
      textAlign: 'center',
      color: theme.textSecondary,
      fontSize: '0.75rem',
      marginTop: '1.5rem',
      lineHeight: 1.5,
    },
    footerLink: {
      color: theme.primary,
      textDecoration: 'none',
      cursor: 'pointer',
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Registration failed');
        setLoading(false);
        return;
      }
      setSuccess(true);
      setFormData({ name: '', email: '', password: '' });
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Inject keyframes for the spinner (inline styles cannot contain keyframes)
  const keyframeStyle = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{keyframeStyle}</style>
      <div style={styles.container}>
        <div style={styles.bgAccent1} />
        <div style={styles.bgAccent2} />
        <div style={styles.formWrapper}>
          <div style={styles.header}>
            <h1 style={styles.title}>Create Account</h1>
            <p style={styles.subtitle}>Join us today. It takes less than a minute.</p>
          </div>

          {success ? (
            <div style={styles.successMessage}>
              <div style={styles.successIcon}>✓</div>
              <h2 style={{ color: theme.textPrimary, margin: '0 0 0.5rem' }}>Welcome!</h2>
              <p style={{ color: theme.textSecondary, margin: 0 }}>
                Your account has been created successfully.
              </p>
              <p style={styles.redirectText}>Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label htmlFor="name" style={styles.label}>Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  style={styles.input}
                  disabled={loading}
                  autoFocus
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.primary;
                    e.target.style.boxShadow = `0 0 0 1px ${theme.primary}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.borderLight;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="email" style={styles.label}>Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  style={styles.input}
                  disabled={loading}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.primary;
                    e.target.style.boxShadow = `0 0 0 1px ${theme.primary}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.borderLight;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="password" style={styles.label}>Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  style={styles.input}
                  disabled={loading}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.primary;
                    e.target.style.boxShadow = `0 0 0 1px ${theme.primary}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.borderLight;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {error && (
                <div style={styles.errorMessage}>
                  <span style={styles.errorIcon}>⚠</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                style={styles.submitBtn}
                disabled={loading}
                onMouseEnter={() => !loading && setHover(true)}
                onMouseLeave={() => setHover(false)}
              >
                {loading ? (
                  <>
                    <div style={styles.spinner} />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <div style={styles.loginLink}>
                Already have an account?{' '}
                <a href="/login" style={styles.link}>Sign in here</a>
              </div>
            </form>
          )}

          <p style={styles.footer}>
            By registering, you agree to our{' '}
            <a href="#" style={styles.footerLink}>Terms of Service</a> and{' '}
            <a href="#" style={styles.footerLink}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </>
  );
}