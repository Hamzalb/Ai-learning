import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo' });

export const metadata: Metadata = {
  title: 'Lebanese AI Learning Platform | منصة التعلم الذكية اللبنانية',
  description: 'AI-powered learning platform for Lebanese students. Upload PDFs, generate quizzes, chat with AI tutor in Arabic and Lebanese dialect.',
  keywords: ['Lebanon', 'AI', 'Learning', 'Education', 'Arabic', 'Quiz', 'PDF', 'Students'],
  authors: [{ name: 'Lebanese AI Learning' }],
  openGraph: {
    title: 'Lebanese AI Learning Platform',
    description: 'AI-powered education for Lebanese students',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className={`${inter.variable} ${cairo.variable} antialiased min-h-screen`}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'hsl(222 47% 11%)',
              color: 'hsl(213 31% 91%)',
              border: '1px solid hsl(222 47% 18%)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Cairo, Inter, sans-serif'
            },
            duration: 4000
          }}
        />
      </body>
    </html>
  );
}
