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
    <nav className="w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-md fixed top-0 left-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand with image icon */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => router.push('/dashboard')}
          >
            <Image
              src="https://cdn-icons-png.flaticon.com/512/1995/1995570.png"
              alt="Resume Icon"
              width={32}
              height={32}
              priority
              className="h-8 w-8 text-primary"
            />
            <span className="text-xl font-bold text-green-700 dark:text-green-400">
              ResumeTailor
            </span>
          </div>

          {/* Navigation buttons */}
          <div className="flex space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 font-medium"
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 font-medium"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
