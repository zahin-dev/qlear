import type { Metadata } from "next";
import "@fontsource/dotgothic16/400.css";
import "@fontsource/silkscreen/400.css";
import "./globals.css";
import { AppProvider } from "@/frontend/stores/app-provider";

export const metadata: Metadata = {
  title: "QLEAR",
  description: "クエストであなたの目標を攻略！ AIが大きな目標を3つのクエストへ変えるタスク攻略アプリ。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <a className="skip-link" href="#main-content">メインコンテンツへ移動</a>
        <div className="rain-layer" aria-hidden="true" />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
