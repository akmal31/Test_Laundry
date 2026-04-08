import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { LaundryProvider } from '@/lib/LaundryContext';

export const metadata: Metadata = {
  title: 'Laundry Management System',
  description: 'Laundry Management System',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <LaundryProvider>
          {children}
        </LaundryProvider>
      </body>
    </html>
  );
}
