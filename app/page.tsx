import { Suspense } from "react";
import SummaryPage from "./components/SummaryPage";

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">読み込み中...</div>}>
      <SummaryPage />
    </Suspense>
  );
}

