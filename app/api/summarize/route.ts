import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

// Gemini APIの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    // URLバリデーション
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "有効なURLを入力してください" },
        { status: 400 }
      );
    }

    // URLの形式チェック
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: "URLの形式が正しくありません" },
        { status: 400 }
      );
    }

    // Gemini APIキーのチェック
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini APIキーが設定されていません" },
        { status: 500 }
      );
    }
    
    console.log("API Key exists:", !!process.env.GEMINI_API_KEY);
    console.log("API Key length:", process.env.GEMINI_API_KEY?.length);
    console.log("API Key prefix:", process.env.GEMINI_API_KEY?.substring(0, 10));

    // URLからHTMLを取得
    let response;
    try {
      response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
        redirect: "follow",
      });
    } catch (fetchError: any) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        { error: `URLへの接続に失敗しました: ${fetchError.message}` },
        { status: 400 }
      );
    }

    if (!response.ok) {
      console.error("Response not OK:", response.status, response.statusText);
      return NextResponse.json(
        { error: `ページの取得に失敗しました (ステータス: ${response.status})` },
        { status: 400 }
      );
    }

    const html = await response.text();

    // JSDOMとReadabilityで本文を抽出
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      return NextResponse.json(
        { error: "記事の本文を抽出できませんでした" },
        { status: 400 }
      );
    }

    // テキストが短すぎる場合
    if (article.textContent.length < 100) {
      return NextResponse.json(
        { error: "記事の内容が短すぎます" },
        { status: 400 }
      );
    }

    // Gemini APIで要約（リトライ機能付き）
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `以下の記事を3つの要点で簡潔に要約してください。
各要点は1〜2文で簡潔にまとめてください。

【重要】入力されたテキストが英語やその他の言語であっても、必ず日本語で要約を作成してください。

記事タイトル: ${article.title || "タイトルなし"}

記事本文:
${article.textContent.slice(0, 50000)}

要約形式（必ず日本語で記述）:
1. （第一の要点）
2. （第二の要点）
3. （第三の要点）`;

    let summary;
    let retries = 3;
    
    for (let i = 0; i < retries; i++) {
      try {
        const result = await model.generateContent(prompt);
        summary = result.response.text();
        break;
      } catch (apiError: any) {
        if (i === retries - 1) throw apiError;
        if (apiError.message?.includes("overloaded") || apiError.message?.includes("503")) {
          // 過負荷エラーの場合、少し待ってリトライ
          await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        } else {
          throw apiError;
        }
      }
    }

    return NextResponse.json({
      success: true,
      title: article.title || "タイトルなし",
      summary: summary,
      url: url,
    });
  } catch (error: any) {
    console.error("Error in summarize API:", error);
    console.error("Error details:", {
      message: error.message,
      cause: error.cause,
      stack: error.stack,
    });
    
    // Gemini APIの過負荷エラー
    if (error.message?.includes("overloaded") || error.message?.includes("503")) {
      return NextResponse.json(
        { error: "AI APIが混雑しています。少し待ってから再度お試しください。（30秒〜1分後）" },
        { status: 503 }
      );
    }
    
    // Gemini APIエラー
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { error: "Gemini APIキーが無効です" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "要約処理中にエラーが発生しました。しばらく待ってから再度お試しください。" },
      { status: 500 }
    );
  }
}

