"use client"

import Script from "next/script"

export function TabTravelScript() {
  return (
    <Script id="tab-travel-widget-init" strategy="afterInteractive">
      {`
        (function() {
          window.widgetSettings = {
            businessCode: "vjwzd",
            baseURL: "https://checkout.tab.travel"
          };
          
          var t = document.createElement("script");
          t.type = "text/javascript";
          t.async = true;
          t.src = "https://checkout.tab.travel/widget.js";
          
          var e = document.getElementsByTagName("script")[0];
          if (e && e.parentNode) {
            e.parentNode.insertBefore(t, e);
          } else {
            document.head.appendChild(t);
          }
        })();
      `}
    </Script>
  )
}
