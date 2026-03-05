import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SocialSim',
  description: 'Practice real-life conversations with AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
