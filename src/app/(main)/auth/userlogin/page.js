'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      localStorage.setItem('user', JSON.stringify(session.user));
      router.push('/');
    }
  }, [session, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient ornament */}
      <div className="absolute inset-0 bg-gradient-radial from-[#D4AF37]/5 to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="bg-[#111111] border border-[#333333] rounded-2xl shadow-2xl backdrop-blur-sm p-8 relative z-10">
          {/* Logo / Brand */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-[#D4AF37] tracking-wide">
              AURA
            </h1>
            <p className="text-[#BFBFBF] mt-2 text-sm">
              Sign in to continue your journey
            </p>
          </motion.div>

          {/* Login Form */}
          <LoginForm />
        </div>
      </motion.div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Store user data after any successful login (handled in parent useEffect as well)
  const handleLoginSuccess = (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isMagicLink) {
        // Email (magic link) sign in
        const result = await signIn('email', {
          email,
          callbackUrl: '/',
          redirect: false,
        });
        if (result?.error) {
          setError('Failed to send magic link');
        } else {
          setError('');
          // Provide feedback to check email (NextAuth redirect doesn't happen with redirect: false, so we show message)
          setError({ type: 'success', message: 'Check your email for a magic link' });
        }
      } else {
        // Credentials sign in (email + password)
        const result = await signIn('credentials', {
          email,
          password,
          callbackUrl: '/',
          redirect: false,
        });

        if (result?.error) {
          setError(result.error);
        } else if (result?.ok) {
          // Success – session update will trigger redirection and localStorage storage
          setError('');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = (provider) => {
    signIn(provider, { callbackUrl: '/' });
  };

  // Input field animation variants
  const inputVariants = {
    rest: { borderColor: '#333333' },
    focus: { borderColor: '#D4AF37', boxShadow: '0 0 0 2px rgba(212,175,55,0.2)' },
  };

  return (
    <div>
      {/* OAuth Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3 mb-6"
      >
        <button
          onClick={() => handleOAuthSignIn('google')}
          className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white border border-[#333333] rounded-lg py-3 px-4 transition-all duration-300 font-medium"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <button
          onClick={() => handleOAuthSignIn('facebook')}
          className="w-full flex items-center justify-center gap-3 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-white border border-[#333333] rounded-lg py-3 px-4 transition-all duration-300 font-medium"
        >
          <FacebookIcon />
          Continue with Facebook
        </button>

        <button
          onClick={() => handleOAuthSignIn('github')}
          className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white border border-[#333333] rounded-lg py-3 px-4 transition-all duration-300 font-medium"
        >
          <GithubIcon />
          Continue with GitHub
        </button>
      </motion.div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-[#333333]" />
        <span className="text-sm text-[#BFBFBF]">or</span>
        <div className="flex-1 h-px bg-[#333333]" />
      </div>

      {/* Email Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        {/* Error Message */}
        {error && typeof error === 'string' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-[#E53935] bg-[#E53935]/10 rounded-lg p-3 border border-[#E53935]/20"
          >
            {error}
          </motion.div>
        )}
        {error?.type === 'success' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-sm text-[#4CAF50] bg-[#4CAF50]/10 rounded-lg p-3 border border-[#4CAF50]/20"
          >
            {error.message}
          </motion.div>
        )}

        {/* Email Input */}
        <div className="relative">
          <motion.input
            variants={inputVariants}
            initial="rest"
            whileFocus="focus"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full bg-transparent border border-[#333333] rounded-lg py-3 px-4 text-white placeholder-[#BFBFBF] focus:outline-none transition-all duration-300"
          />
          <MailIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#BFBFBF]" />
        </div>

        {/* Password Input (only for credentials) */}
        {!isMagicLink && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative"
          >
            <motion.input
              variants={inputVariants}
              initial="rest"
              whileFocus="focus"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent border border-[#333333] rounded-lg py-3 px-4 text-white placeholder-[#BFBFBF] focus:outline-none transition-all duration-300"
            />
            <LockIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#BFBFBF]" />
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02, backgroundColor: '#C9A227' }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#D4AF37] hover:bg-[#C9A227] text-black font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : isMagicLink ? (
            'Send Magic Link'
          ) : (
            'Sign In with Email'
          )}
        </motion.button>

        {/* Toggle between magic link and password */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsMagicLink(!isMagicLink);
              setPassword('');
              setError('');
            }}
            className="text-sm text-[#D4AF37] hover:text-[#C9A227] transition-colors"
          >
            {isMagicLink ? 'Sign in with password instead' : 'Sign in with a magic link'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

// Icon components (inline SVGs)
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function LockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}