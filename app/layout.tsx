import type { Metadata } from "next";
import { Noto_Serif_KR, IBM_Plex_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSerifKR = Noto_Serif_KR({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexSansKR = IBM_Plex_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
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
        className={`${notoSerifKR.variable} ${ibmPlexSansKR.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
