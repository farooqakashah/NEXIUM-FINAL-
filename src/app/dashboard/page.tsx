'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Navbar from '../../components/Navbar';

interface Resume {
  _id: string;
  userId: string;
  resumeInput: string | null;
  jobDescription: string | null;
  tailoredResume: string | null;
  createdAt: string;
}

export default function Dashboard() {
  const [latestResume, setLatestResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isJobDescriptionExpanded, setIsJobDescriptionExpanded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchLatestResume() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          console.error('Auth error or no user:', authError?.message);
          setMessage('Please log in to view your resume');
          router.push('/');
          return;
        }

        console.log('Fetching latest resume for userId:', user.id);
        const response = await fetch(`/api/get-resumes?userId=${user.id}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch resumes: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched resumes:', data);

        if (!Array.isArray(data)) {
          throw new Error('Invalid response format: Expected an array of resumes');
        }

        if (data.length > 0) {
          setLatestResume(data[0]);
        } else {
          setMessage('No resumes found. Create one on the home page!');
        }
      } catch (error) {
        console.error('Error in fetchLatestResume:', error);
        setMessage(`Error fetching resume: ${(error as Error).message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchLatestResume();
  }, [router]);

  const toggleJobDescription = () => {
    setIsJobDescriptionExpanded((prev) => !prev);
  };

  return (
    <>
      <Head>
        <title>Resume Tailor Dashboard</title>
        <meta name="description" content="View your latest tailored resume" />
      </Head>

      <div className="min-h-screen flex flex-col items-center p-6">
        <div className="w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Latest Resume</h1>

          <button
            onClick={() => router.push('/home')}
            className="mb-6 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>

          {loading ? (
            <p className="text-gray-600 text-lg">Loading...</p>
          ) : latestResume ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Resume from {new Date(latestResume.createdAt).toLocaleDateString()}
              </h2>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-700">Original Resume ({latestResume.resumeInput?.length || 0} characters)</h3>
                <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-gray-600 text-sm whitespace-pre-wrap overflow-auto max-h-96">
                  {latestResume.resumeInput || 'Not available'}
                </pre>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-700">Job Description</h3>
                <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-gray-600 text-sm whitespace-pre-wrap">
                  {latestResume.jobDescription ? (
                    isJobDescriptionExpanded ? (
                      latestResume.jobDescription
                    ) : (
                      <>
                        {latestResume.jobDescription.substring(0, 100)}...
                        <button
                          onClick={toggleJobDescription}
                          className="text-blue-600 hover:underline ml-2 font-medium"
                        >
                          {isJobDescriptionExpanded ? 'Show Less' : 'Show More'}
                        </button>
                      </>
                    )
                  ) : (
                    'Not available'
                  )}
                </pre>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700">Tailored Resume ({latestResume.tailoredResume?.length || 0} characters)</h3>
                <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-gray-600 text-sm whitespace-pre-wrap overflow-auto max-h-96">
                  {latestResume.tailoredResume || 'Not available'}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-lg">No resumes found. Create one on the home page!</p>
          )}

          {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
        </div>
      </div>
    </>
  );
}