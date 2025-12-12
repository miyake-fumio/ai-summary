"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";

interface SummaryResult {
  success: boolean;
  title?: string;
  summary?: string;
  url?: string;
  error?: string;
}

export default function SummaryPage() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState("");

  // URLクエリパラメータがある場合は自動実行
  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam && !loading && !result) {
      setUrl(urlParam);
      handleSummarize(urlParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSummarize = async (targetUrl?: string) => {
    const urlToSummarize = targetUrl || url;

    if (!urlToSummarize.trim()) {
      setError("URLを入力してください");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: urlToSummarize }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "エラーが発生しました");
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError("ネットワークエラーが発生しました: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSummarize();
  };

  const handleReset = () => {
    setUrl("");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            📝 AI記事要約アプリ
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            記事のURLを入力すると、AIが3つの要点で要約します
          </p>
        </div>

        {/* 入力フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                記事のURL
              </label>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    要約中...
                  </span>
                ) : (
                  "要約する"
                )}
              </button>

              {(result || error) && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  リセット
                </button>
              )}
            </div>
          </form>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}

        {/* 結果表示 */}
        {result && result.success && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {result.title}
              </h2>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm break-all"
              >
                {result.url}
              </a>
            </div>

            <div className="prose prose-sm sm:prose-base max-w-none">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                📌 要約
              </h3>
              <div className="text-gray-700 leading-relaxed">
                <ReactMarkdown>{result.summary}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* 使い方 */}
        {!result && !error && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3 text-base sm:text-lg">
              💡 使い方
            </h3>
            <ul className="space-y-2 text-blue-800 text-sm sm:text-base">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>記事のURLを入力フォームに貼り付けます</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>「要約する」ボタンをクリックします</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>AIが記事を読み込んで、3つの要点で要約します</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">💡</span>
                <span>
                  URLクエリパラメータ(?url=...)でも使用できます
                </span>
              </li>
            </ul>
          </div>
        )}

        {/* フッター */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Powered by Gemini API (gemini-2.5-flash)</p>
        </div>
      </div>
    </div>
  );
}

