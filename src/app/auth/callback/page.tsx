'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('User authenticated in callback:', session.user.id);
        router.push('/home');
      } else {
        console.error('No session found in callback');
        router.push('/');
      }
    }
    handleCallback();
  }, [router]);

  return <div className="min-h-screen bg-black/50 flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-8 text-center">
      <p className="text-gray-600 text-lg">Authenticating...</p>
    </div>
  </div>;
}