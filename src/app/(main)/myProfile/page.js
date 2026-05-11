// app/dashboard/page.js
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Dummy user data – replace with your actual fetch (e.g., from session or API)
const dummyUser = {
  name: 'Ava Sinclair',
  email: 'ava.sinclair@example.com',
  image: null, // will show initials instead
  provider: 'credentials',
  degree: 'Master',
  subject: 'Computer Science',
  medium: 'English',
  likedBooks: [
    'Clean Code',
    'The Pragmatic Programmer',
    'Design Patterns',
    'You Don’t Know JS',
  ],
  savedNotes: ['React Hooks Guide', 'MongoDB Aggregation Tips', 'Tailwind Cheat Sheet'],
  isSubscribed: true,
  applicantId: '65f1a2b3c4d5e6f7a8b9c0d1',
};

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setUser(dummyUser);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-t-2 border-[#D4AF37] rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-[#BFBFBF] text-lg">Failed to load user data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#F5F5F5] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#111111] border-2 border-[#D4AF37] flex items-center justify-center text-2xl font-bold text-[#D4AF37]">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-wide">
                Welcome back,{' '}
                <span className="text-[#D4AF37] font-medium">{user.name.split(' ')[0]}</span>
              </h1>
              <p className="text-sm text-[#BFBFBF]">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#111111] border border-[#333333] text-[#BFBFBF]">
              {user.provider === 'credentials' ? '🔐 Email/Password' : user.provider}
            </span>
            {user.isSubscribed && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#D4AF37] text-black border border-transparent">
                ⭐ Subscribed
              </span>
            )}
          </div>
        </motion.header>

        {/* Stats / Quick Info Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard icon="🎓" label="Degree" value={user.degree} />
          <StatCard icon="📚" label="Subject" value={user.subject || 'Not set'} />
          <StatCard icon="🌐" label="Language" value={user.medium} />
          <StatCard icon="📌" label="Applicant ID" value={user.applicantId ? user.applicantId.slice(-6) : 'N/A'} />
        </motion.div>

        {/* Liked Books & Saved Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Liked Books */}
          <motion.section
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-[#111111] border border-[#333333] rounded-xl p-5 hover:border-[#D4AF37] transition-colors duration-300"
          >
            <h2 className="text-xl font-semibold text-[#D4AF37] mb-4 flex items-center gap-2">
              📖 Liked Books
            </h2>
            {user.likedBooks.length > 0 ? (
              <ul className="space-y-3">
                {user.likedBooks.map((book, idx) => (
                  <motion.li
                    key={idx}
                    whileHover={{ x: 8 }}
                    className="flex items-center gap-3 text-[#F5F5F5] hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    <span className="w-1 h-1 bg-[#D4AF37] rounded-full" />
                    {book}
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-[#BFBFBF] text-sm italic">No liked books yet.</p>
            )}
          </motion.section>

          {/* Saved Notes */}
          <motion.section
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-[#111111] border border-[#333333] rounded-xl p-5 hover:border-[#D4AF37] transition-colors duration-300"
          >
            <h2 className="text-xl font-semibold text-[#D4AF37] mb-4 flex items-center gap-2">
              📝 Saved Notes
            </h2>
            {user.savedNotes.length > 0 ? (
              <ul className="space-y-3">
                {user.savedNotes.map((note, idx) => (
                  <motion.li
                    key={idx}
                    whileHover={{ x: 8 }}
                    className="flex items-center gap-3 text-[#F5F5F5] hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    <span className="w-1 h-1 bg-[#D4AF37] rounded-full" />
                    {note}
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-[#BFBFBF] text-sm italic">No saved notes yet.</p>
            )}
          </motion.section>
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-[#333333] mt-8"
        >
          Luxury Dashboard &middot; All your academic data at a glance
        </motion.p>
      </div>
    </div>
  );
}

/* Reusable Stat Card */
function StatCard({ icon, label, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, borderColor: '#D4AF37' }}
      className="bg-[#111111] border border-[#333333] rounded-xl p-4 flex items-center gap-4 transition-all duration-300"
    >
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-xs text-[#BFBFBF] uppercase tracking-wider">{label}</p>
        <p className="text-lg font-medium text-[#F5F5F5] truncate max-w-[160px]">{value}</p>
      </div>
    </motion.div>
  );
}