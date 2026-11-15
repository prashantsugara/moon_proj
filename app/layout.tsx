import { REGISTRATION_PRICE } from '@/lib/registrationPrice';
import React from 'react';
import Script from 'next/script';
import './globals.css';

export const metadata = {
  title: 'MoonLandBuy | Lunar Novelty Registry',
  description: `Explore the Moon and register a commemorative plot from ${REGISTRATION_PRICE}.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Script id="openai-ads-pixel" strategy="afterInteractive">
          {`!function(w,d,s,u){
            if(w.oaiq)return;
            var q=function(){q.q.push(arguments)};
            q.q=[];
            w.oaiq=q;
            var j=d.createElement(s);
            j.async=true;
            j.src=u;
            var f=d.getElementsByTagName(s)[0];
            f.parentNode.insertBefore(j,f);
          }(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");
          oaiq("init",{pixelId:"CVSg6zyrTwnTkxWxeFvqgE"});`}
        </Script>
        {children}
      </body>
    </html>
  );
}
