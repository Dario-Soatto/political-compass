import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Political Compass - Soatto.com',
  description: 'Analyze Twitter users political leanings based on their tweets using AI',
};

export default function CompassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
