import type { Metadata } from 'next';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastContainer } from '@/components';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShadowVest - Portfolio Tracker',
  description: 'AI-augmented personal stock portfolio dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
