import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI記事要約アプリ",
  description: "URLから記事を要約するWebアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

