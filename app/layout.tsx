import React from 'react';

export const metadata = {
  title: 'P2P Registry & Marketplace',
  description: 'Off-platform P2P land registry and marketplace platform.',
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
      <body style={{ margin: 0, padding: 0, backgroundColor: '#090d16', color: '#fff' }}>
        {children}
      </body>
    </html>
  );
}
