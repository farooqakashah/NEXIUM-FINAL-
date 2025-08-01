'use client';

import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="w-full fixed top-0 left-0 z-20 bg-white/90 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push('/dashboard')}
          >
            <Image
              src="https://cdn-icons-png.flaticon.com/512/1995/1995570.png"
              alt="Resume Icon"
              width={32}
              height={32}
              priority
            />
            <span className="text-2xl font-semibold text-green-700 dark:text-green-400">
              ResumeTailor
            </span>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-gray-800 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
