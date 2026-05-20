'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const PROFILE_CACHE_KEY = 'my_profile_v2';

const emptyProfile = {
  _id: null,
  name: '',
  email: '',
  image: '',
  gender: '',
  schoolCollegeUniversityName: '',
  session: '',
  degreeOrClass: '',
  languagesLearning: [],
  images: [],
  applicantId: null,
  createdAt: null,
  updatedAt: null,
};

function toListText(value) {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'string') return value;
  return '';
}

function parseList(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeProfile(payload, sessionUser) {
  const data = payload?.profile ?? payload ?? {};

  return {
    _id: data._id ?? null,
    name: data.name || sessionUser?.name || '',
    email: data.email || sessionUser?.email || '',
    image: data.image || sessionUser?.image || '',
    gender: data.gender || '',
    schoolCollegeUniversityName: data.schoolCollegeUniversityName || '',
    session: data.session || '',
    degreeOrClass: data.degreeOrClass || '',
    languagesLearning: Array.isArray(data.languagesLearning) ? data.languagesLearning : [],
    images: Array.isArray(data.images) ? data.images : [],
    applicantId: data.applicantId || null,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
}

function formFromProfile(profile) {
  return {
    name: profile.name || '',
    email: profile.email || '',
    image: profile.image || '',
    gender: profile.gender || '',
    schoolCollegeUniversityName: profile.schoolCollegeUniversityName || '',
    session: profile.session || '',
    degreeOrClass: profile.degreeOrClass || '',
    languagesLearning: toListText(profile.languagesLearning),
    images: toListText(profile.images),
  };
}

function initials(name) {
  return (name || 'User')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(formFromProfile(emptyProfile));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const cached = window.localStorage.getItem(PROFILE_CACHE_KEY);
      if (!cached) return;

      const parsed = normalizeProfile(JSON.parse(cached), session?.user);
      setProfile(parsed);
      setForm(formFromProfile(parsed));
    } catch (cacheError) {
      console.warn('Failed to read cached profile', cacheError);
    }
  }, [session?.user]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/userlogin');
      return;
    }

    if (status !== 'authenticated' || !session?.user) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/adminorder/profile', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const payload = await response.json();
        const normalized = normalizeProfile(payload, session.user);

        setProfile(normalized);
        setForm(formFromProfile(normalized));
        setError(null);

        try {
          window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(normalized));
        } catch (storageError) {
          console.warn('Failed to cache profile', storageError);
        }
      } catch (fetchError) {
        console.error('Error fetching profile:', fetchError);
        const fallbackProfile = normalizeProfile(emptyProfile, session.user);
        setProfile(fallbackProfile);
        setForm(formFromProfile(fallbackProfile));
        setError('Unable to load profile data right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [status, session, router]);

  useEffect(() => {
    if (!profile) return;
    setForm(formFromProfile(profile));
  }, [profile]);

  async function handleSave() {
    if (!session?.user) return;

    const payload = {
      name: form.name || session.user.name || '',
      email: form.email || session.user.email || '',
      image: form.image || session.user.image || '',
      gender: form.gender,
      schoolCollegeUniversityName: form.schoolCollegeUniversityName,
      session: form.session,
      degreeOrClass: form.degreeOrClass,
      languagesLearning: parseList(form.languagesLearning),
      images: parseList(form.images),
      provider: session.user.provider,
    };

    try {
      setSaving(true);
      setError(null);

      const method = profile?._id ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/adminorder/profile', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let responseData = null;
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }

      if (!response.ok) {
        if (method === 'POST' && responseData?.error?.toLowerCase().includes('exists')) {
          const retryResponse = await fetch('/api/admin/adminorder/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!retryResponse.ok) {
            throw new Error(responseData?.error || 'Failed to save profile');
          }

          responseData = await retryResponse.json();
        } else {
          throw new Error(responseData?.error || 'Failed to save profile');
        }
      }

      const normalized = normalizeProfile(responseData, session.user);
      setProfile(normalized);
      setForm(formFromProfile(normalized));

      try {
        window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(normalized));
      } catch (storageError) {
        console.warn('Failed to cache profile', storageError);
      }

      setEditing(false);
    } catch (saveError) {
      console.error('Save failed', saveError);
      setError(saveError.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (profile) {
      setForm(formFromProfile(profile));
    }
    setEditing(false);
    setError(null);
  }

  const displayName = profile?.name || session?.user?.name || 'User';
  const displayEmail = profile?.email || session?.user?.email || '';
  const displayImage = profile?.image || session?.user?.image || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="h-12 w-12 rounded-full border-2 border-[#D4AF37] border-t-transparent"
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center px-4">
        <p className="text-[#BFBFBF] text-lg">Failed to load profile data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 rounded-3xl border border-[#232323] bg-[#0C0C0C] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-[#141414] text-xl font-semibold text-[#D4AF37]">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt={displayName}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials(displayName)
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#D4AF37]">My Profile</p>
              <h1 className="mt-2 text-2xl font-light sm:text-3xl">
                {displayName}
              </h1>
              <p className="mt-1 text-sm text-[#BFBFBF]">{displayEmail}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#2E2E2E] bg-[#111111] px-3 py-1 text-xs font-medium text-[#BFBFBF]">
              {profile._id ? 'Saved profile' : 'New profile'}
            </span>
            <span className="rounded-full border border-[#2E2E2E] bg-[#111111] px-3 py-1 text-xs font-medium text-[#BFBFBF]">
              {session?.user?.provider || 'auth'}
            </span>
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-full bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-[1.01]"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-full bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-full border border-[#2E2E2E] bg-[#111111] px-4 py-2 text-sm font-semibold text-[#E5E5E5] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </motion.header>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {editing && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl border border-[#232323] bg-[#0C0C0C] p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#D4AF37]">Edit Profile</h2>
                <p className="mt-1 text-sm text-[#9E9E9E]">Update the profile fields exposed by the API.</p>
              </div>
              <span className="rounded-full border border-[#2E2E2E] bg-[#111111] px-3 py-1 text-xs text-[#BFBFBF]">
                GET / POST / PUT
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <ProfileInput
                label="Name"
                value={form.name}
                onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
                placeholder="Full name"
              />
              <ProfileInput
                label="Email"
                value={form.email}
                onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
                placeholder="Email address"
              />
              <ProfileInput
                label="Image URL"
                value={form.image}
                onChange={(value) => setForm((prev) => ({ ...prev, image: value }))}
                placeholder="https://..."
              />
              <ProfileInput
                label="Gender"
                value={form.gender}
                onChange={(value) => setForm((prev) => ({ ...prev, gender: value }))}
                placeholder="Gender"
              />
              <ProfileInput
                label="School / College / University"
                value={form.schoolCollegeUniversityName}
                onChange={(value) => setForm((prev) => ({ ...prev, schoolCollegeUniversityName: value }))}
                placeholder="Institution name"
              />
              <ProfileInput
                label="Session"
                value={form.session}
                onChange={(value) => setForm((prev) => ({ ...prev, session: value }))}
                placeholder="2025-2026"
              />
              <ProfileInput
                label="Degree / Class"
                value={form.degreeOrClass}
                onChange={(value) => setForm((prev) => ({ ...prev, degreeOrClass: value }))}
                placeholder="Degree or class"
              />
              <ProfileInput
                label="Languages Learning"
                value={form.languagesLearning}
                onChange={(value) => setForm((prev) => ({ ...prev, languagesLearning: value }))}
                placeholder="Hindi, English, Punjabi"
                helperText="Comma-separated list."
              />
              <ProfileInput
                label="Images"
                value={form.images}
                onChange={(value) => setForm((prev) => ({ ...prev, images: value }))}
                placeholder="Image URLs separated by commas"
                helperText="Use comma-separated URLs or upload paths."
              />
            </div>
          </motion.section>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard label="Gender" value={profile.gender || 'Not set'} />
          <StatCard label="Institution" value={profile.schoolCollegeUniversityName || 'Not set'} />
          <StatCard label="Session" value={profile.session || 'Not set'} />
          <StatCard label="Degree / Class" value={profile.degreeOrClass || 'Not set'} />
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ProfilePanel title="Languages Learning" delay={0.2}>
            {profile.languagesLearning?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.languagesLearning.map((language, index) => (
                  <span
                    key={`${language}-${index}`}
                    className="rounded-full border border-[#313131] bg-[#111111] px-3 py-1 text-sm text-[#E5E5E5]"
                  >
                    {language}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-[#9E9E9E]">No languages added yet.</p>
            )}
          </ProfilePanel>

          <ProfilePanel title="Images" delay={0.28}>
            {profile.images?.length > 0 ? (
              <div className="space-y-2">
                {profile.images.map((imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    className="rounded-2xl border border-[#2B2B2B] bg-[#111111] px-3 py-2 text-sm text-[#E5E5E5] break-all"
                  >
                    {imageUrl}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-[#9E9E9E]">No images added yet.</p>
            )}
          </ProfilePanel>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.35 }}
          className="pb-2 text-center text-xs uppercase tracking-[0.3em] text-[#4C4C4C]"
        >
          Profile dashboard
        </motion.p>
      </div>
    </div>
  );
}

function ProfileInput({ label, value, onChange, placeholder, helperText }) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.22em] text-[#AFAFAF]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm text-[#F5F5F5] outline-none transition-colors placeholder:text-[#666] focus:border-[#D4AF37]"
      />
      {helperText ? <p className="text-xs text-[#7D7D7D]">{helperText}</p> : null}
    </label>
  );
}

function StatCard({ label, value }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-3xl border border-[#232323] bg-[#0E0E0E] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
    >
      <p className="text-xs uppercase tracking-[0.24em] text-[#9E9E9E]">{label}</p>
      <p className="mt-2 truncate text-lg font-medium text-[#F5F5F5]">{value}</p>
    </motion.div>
  );
}

function ProfilePanel({ title, delay, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-3xl border border-[#232323] bg-[#0C0C0C] p-5"
    >
      <h2 className="text-xl font-semibold text-[#D4AF37]">{title}</h2>
      <div className="mt-4">{children}</div>
    </motion.section>
  );
}
