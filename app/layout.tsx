import { REGISTRATION_PRICE } from '@/lib/registrationPrice';
import React from 'react';
import Script from 'next/script';
import './globals.css';

export const metadata = {
  title: 'MoonLandBuy | Lunar Novelty Registry',
  description: `Create a personalized commemorative Moon certificate from ${REGISTRATION_PRICE}. Choose a lunar spot and add a name and message for a symbolic gift.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);
          t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
          }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','1089586927432243');fbq('track','PageView');
        `}</Script>
        <noscript><img height="1" width="1" style={{ display: 'none' }} alt=""
          src="https://www.facebook.com/tr?id=1089586927432243&ev=PageView&noscript=1" /></noscript>
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
