import React from 'react';
import './globals.css';

export const metadata = {
  title: 'MoonLandBuy | Lunar Novelty Registry',
  description: 'Explore the Moon and register a commemorative plot for US$5.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
