import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Resume Tailor',
  description: 'Tailor your resume to match job descriptions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 bg-cover bg-fixed bg-center bg-[url('https://static.vecteezy.com/system/resources/previews/026/481/532/large_2x/serenity-and-peace-with-this-breathtaking-4k-wallpaper-depicting-a-tranquil-natural-landscape-free-photo.jpg')]">
        {children}
      </body>
    </html>
  );
}