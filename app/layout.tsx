import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Book Smith - AI 집필 도구",
  description: "AI와 함께 책을 집필하세요. 기획부터 출판까지, 당신의 이야기를 완성합니다.",
  keywords: ["AI", "집필", "책", "출판", "글쓰기", "작가"],
  authors: [{ name: "Book Smith" }],
  openGraph: {
    title: "Book Smith - AI 집필 도구",
    description: "AI와 함께 책을 집필하세요.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
