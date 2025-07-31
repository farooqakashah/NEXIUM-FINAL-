'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Navbar from '../../components/Navbar';

export default function Home() {
  const [resumeInput, setResumeInput] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        setMessage('Please log in to tailor your resume');
        router.push('/');
      }
    }
    checkAuth();
  }, [router]);

  const handleTailorResume = async () => {
    setLoading(true);
    setMessage('');
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Please log in to tailor your resume');

      const response = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeInput, jobDescription, userId: user.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to tailor resume');

      router.push('/dashboard');
    } catch (error) {
      setMessage('Error tailoring resume: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Resume Tailor - Home</title>
        <meta name="description" content="Tailor your resume with AI" />
      </Head>
      <Navbar/>
      <div
        className="relative min-h-screen bg-cover bg-center flex items-center justify-center p-4"
        style={{
          backgroundImage:
            "url('https://static.vecteezy.com/system/resources/previews/026/481/532/large_2x/serenity-and-peace-with-this-breathtaking-4k-wallpaper-depicting-a-tranquil-natural-landscape-free-photo.jpg')",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50 z-0" />

        {/* Main content */}
        <div className="relative z-10 w-full max-w-3xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 mt-15">


          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-black mb-2">Paste Your Resume</h2>
              <textarea
                value={resumeInput}
                onChange={(e) => setResumeInput(e.target.value)}
                placeholder="Paste your resume here in form of a pragraph..."
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={5}
                disabled={loading}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black mb-2">Paste Job Description</h2>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here..."
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={5}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={handleTailorResume}
                disabled={loading}
                className="w-full bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    <span>Tailoring...</span>
                  </div>
                ) : (
                  'Tailor Resume'
                )}
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-gray-600 text-white font-semibold py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>

            {message && <p className="mt-2 text-center text-sm text-red-600">{message}</p>}
          </div>
        </div>
      </div>
    </>
  );
}
