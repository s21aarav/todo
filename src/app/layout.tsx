import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StarfieldBackground from "@/components/StarfieldBackground";
import { AuthProvider } from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orbit Planner",
  description: "A focused daily planning workspace for tasks, time blocks, and deep work.",
  appleWebApp: {
    capable: true,
    title: "Orbit",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#020202",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full overflow-hidden flex flex-col text-gray-100 selection:bg-emerald-300/30 selection:text-white">
        <AuthProvider>
          <StarfieldBackground />
          <main className="min-h-0 flex-1 flex flex-col z-10 relative">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
