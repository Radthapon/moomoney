import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Thai } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

const notoThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-thai',
});

export const metadata: Metadata = {
  title: 'กระเป๋าเงิน — จัดการการเงินส่วนตัว',
  description: 'ติดตามรายรับ รายจ่าย หนี้สิน และงบประมาณส่วนตัว',
};

export const viewport: Viewport = {
  themeColor: '#f3f4f8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={notoThai.variable}>
      <body className="font-sans antialiased text-ink" style={{ background: 'var(--color-page)' }}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
