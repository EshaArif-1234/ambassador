import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import { UserProvider } from "@/contexts/UserContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { getSiteUrl } from "@/lib/siteUrl";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'Ambassador Commercial Kitchen',
    template: '%s | Ambassador Commercial Kitchen',
  },
  description:
    'Commercial kitchen equipment and professional food service solutions in Pakistan.',
  verification: {
    google: 'E2JREt5YU1IkSxG6kQBwwW4FrD9JKQjwz43hJkrNF78',
  },
};

const GA_MEASUREMENT_ID = 'G-Y951ZNMJX9';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <CartProvider>
          <UserProvider>
            <WishlistProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </WishlistProvider>
          </UserProvider>
        </CartProvider>
      </body>
    </html>
  );
}
