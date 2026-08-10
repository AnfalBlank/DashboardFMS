import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/lib/auth';
import { AppWrapper } from '@/components/layout/AppWrapper';

export const metadata: Metadata = {
  title: 'SPBP Polda Papua Barat — Fuel Monitoring',
  description: 'Fuel Monitoring & Management System — SPBP Polda Papua Barat Manokwari',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <ToastProvider>
            <AppWrapper>{children}</AppWrapper>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
