import { Geist, Geist_Mono } from "next/font/google";
import { UserProvider } from "@/src/app/components/additionals/userContext"; 
import ProtectedAdminRoute from "@/src/app/components/additionals/protetctedAdminRoute"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Admin Section",
  description: "Admin Section",
  other: {
    "google-adsense-account": "ca-pub-6540367254643393",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <ProtectedAdminRoute>
            
            <main className="pt-20 md:pt-[135px]">{children}</main>
          
          </ProtectedAdminRoute>
        </UserProvider>
      </body>
    </html>
  );
}