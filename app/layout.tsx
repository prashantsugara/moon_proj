import React from 'react';
import './globals.css';

export const metadata = {
  title: 'P2P Registry & Marketplace',
  description: 'Off-platform direct P2P payments with certified title registry transfer.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
