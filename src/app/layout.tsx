import type { Metadata } from 'next';
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
      <body>{children}</body>
    </html>
  );
}
