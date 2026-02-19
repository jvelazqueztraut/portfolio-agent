import type { Metadata } from 'next';
import './globals.css';
import Header from '@/sections/Header';
import { URLParamsProvider } from '@/contexts/URLParamsContext';
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata: Metadata = {
  title: 'Portfolio Agent by Javier Velazquez Traut',
  description:
    'A web-based, real-time 3D interactive experience a virtual character becomes an educator and storyteller, guiding users through the world of AI-powered creative and immersive experiences in a way that feels alive, reactive, and emotionally engaging.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <URLParamsProvider>
          <Header />
          {children}
        </URLParamsProvider>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
