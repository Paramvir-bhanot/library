// pages/profile/[id].js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function UserProfileById() {
  const router = useRouter();
  const { id } = router.query; // dynamic user id from URL

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulate current logged‑in user ID (replace with real auth)
  const currentUserId = 'current-user-placeholder'; // get from session/context

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/user/${id}`);
        if (!res.ok) throw new Error('User not found');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (!id || loading) return <ProfileSkeleton />;
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center p-8">
          <p className="text-red-400 text-xl mb-4">⚠️ {error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#C9A227] transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  const isOwner = user._id === currentUserId; // adjust comparison based on your IDs
  const avatar = user?.image;
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const providerLabel =
    user?.provider === 'google'
      ? 'Google'
      : user?.provider === 'facebook'
      ? 'Facebook'
      : 'Credentials';

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.8s ease-out forwards; }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
      `}</style>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button + header */}
        <div className="flex items-center gap-4 mb-10 animate-fade-in">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-[#111] transition text-[#BFBFBF]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight">
              {isOwner ? 'My ' : `${user?.name}'s `}
              <span className="text-[#D4AF37] font-medium">Profile</span>
            </h1>
            <div className="h-px w-20 bg-[#D4AF37] mt-3"></div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN – Profile Card */}
          <div className="lg:col-span-1 animate-slide-up">
            <div className="bg-[#111111] border border-[#333333] rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="w-28 h-28 mb-5 rounded-full bg-[#222] border-2 border-[#D4AF37] flex items-center justify-center overflow-hidden">
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt={user?.name}
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-4xl font-semibold text-[#D4AF37]">
                      {initials}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-medium text-white">{user?.name}</h2>
                <p className="text-[#BFBFBF] text-sm mt-1">{user?.email}</p>

                {/* Provider badge */}
                <span className="inline-block mt-3 px-3 py-1 text-xs rounded-full bg-[#222] text-[#BFBFBF] border border-[#333]">
                  {providerLabel}
                </span>

                {/* Subscription badge */}
                <div className="mt-4">
                  {user?.isSubscribed ? (
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4AF37] text-black text-sm font-semibold rounded-full animate-pulse">
                      ✦ Premium
                    </span>
                  ) : (
                    <span className="px-4 py-1.5 text-sm bg-transparent border border-[#333] text-[#BFBFBF] rounded-full">
                      Free Plan
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons – only for owner */}
              {isOwner && (
                <div className="mt-8 space-y-3">
                  <button className="w-full py-2.5 bg-[#D4AF37] text-black font-medium rounded-lg hover:bg-[#C9A227] transition-all duration-200 transform hover:scale-[1.02] active:scale-95">
                    Edit Profile
                  </button>
                  <button className="w-full py-2.5 border border-[#D4AF37] text-[#D4AF37] font-medium rounded-lg hover:bg-[#D4AF37]/10 transition-all duration-200">
                    Change Password
                  </button>
                </div>
              )}
            </div>

            {/* Applicant link (if applicable) */}
            {user?.applicantId && (
              <div className="mt-4 bg-[#111] border border-[#333] rounded-2xl p-4 text-center animate-slide-up stagger-1">
                <p className="text-sm text-[#BFBFBF]">
                  View their{' '}
                  <a href="#" className="text-[#D4AF37] underline font-medium">
                    Applicant Profile
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN – Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Education & Preferences */}
            <div className="bg-[#111111] border border-[#333333] rounded-2xl p-6 animate-slide-up stagger-2">
              <h3 className="text-xl font-medium text-[#D4AF37] mb-5 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Education
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField label="Degree" value={user?.degree} />
                <InfoField label="Medium" value={user?.medium} />
                <InfoField label="Subject" value={user?.subject} />
              </div>
            </div>

            {/* Liked Books */}
            <div className="bg-[#111111] border border-[#333333] rounded-2xl p-6 animate-slide-up stagger-3">
              <h3 className="text-xl font-medium text-[#D4AF37] mb-4 flex items-center gap-2">
                ❤️ Liked Books
              </h3>
              {user?.likedBooks?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.likedBooks.map((book, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#222] border border-[#333] rounded-full text-sm text-white hover:border-[#D4AF37] cursor-default transition"
                    >
                      {book}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[#BFBFBF] text-sm italic">No books liked yet.</p>
              )}
            </div>

            {/* Saved Notes */}
            <div className="bg-[#111111] border border-[#333333] rounded-2xl p-6 animate-slide-up stagger-3">
              <h3 className="text-xl font-medium text-[#D4AF37] mb-4 flex items-center gap-2">
                📝 Saved Notes
              </h3>
              {user?.savedNotes?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.savedNotes.map((note, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#222] border border-[#333] rounded-full text-sm text-white hover:border-[#D4AF37] cursor-default transition"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[#BFBFBF] text-sm italic">No notes saved yet.</p>
              )}
            </div>

            {/* Account Info */}
            <div className="bg-[#111111] border border-[#333333] rounded-2xl p-6 animate-slide-up">
              <h3 className="text-xl font-medium text-[#D4AF37] mb-3">Account</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <InfoField label="Email" value={user?.email} />
                <InfoField label="Provider" value={providerLabel} />
                <InfoField label="Member Since" value={formatDate(user?.createdAt)} />
                <InfoField label="Subscription" value={user?.isSubscribed ? 'Premium' : 'Free'} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Reusable info field
function InfoField({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-[#BFBFBF] text-xs uppercase tracking-wider">{label}</p>
      <p className="text-white text-sm font-medium break-words">{value || '—'}</p>
    </div>
  );
}

// Format date helper
function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Skeleton loader mirrored from the profile page
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-4 mb-10">
          <div className="w-6 h-6 bg-[#111] rounded-full animate-pulse"></div>
          <div className="h-8 w-40 bg-[#111] rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-[#111] border border-[#333] rounded-2xl p-6 flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-[#222] animate-pulse"></div>
              <div className="h-6 w-32 bg-[#222] rounded mt-4 animate-pulse"></div>
              <div className="h-4 w-48 bg-[#222] rounded mt-2 animate-pulse"></div>
              <div className="h-8 w-20 bg-[#222] rounded-full mt-4 animate-pulse"></div>
              <div className="w-full mt-8 space-y-3">
                <div className="h-10 w-full bg-[#222] rounded-lg animate-pulse"></div>
                <div className="h-10 w-full bg-[#222] rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#111] border border-[#333] rounded-2xl p-6">
                <div className="h-6 w-32 bg-[#222] rounded animate-pulse mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-4 bg-[#222] rounded animate-pulse"></div>
                  <div className="h-4 bg-[#222] rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}