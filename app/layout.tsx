import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Social Sim',
  description: 'A social simulation game — manage your sims, their needs, and watch them thrive.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
