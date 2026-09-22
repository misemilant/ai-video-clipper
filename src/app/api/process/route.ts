import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { videoUrl } = await req.json();

    if (!videoUrl) {
      return NextResponse.json({ message: "URL Video wajib diisi." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: "GEMINI_API_KEY belum dipasang di Environment Variables Vercel!" }, { status: 500 });
    }

    const promptText = `Kamu adalah AI Video Editor profesional. Analisis video YouTube berikut: ${videoUrl}. Hasilkan 3 rekomendasi klip pendek menarik (TikTok/Reels). Kembalikan HANYA format JSON valid seperti ini tanpa markdown: {"clips": [{"id":"1", "title":"Judul Klip", "startTime":"00:30", "endTime":"01:15", "viralScore": 90, "summary":"Rangkuman singkat", "reason":"Alasan viral"}]}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();

    if (!response.ok || !data.candidates || !data.candidates[0]) {
      const errorMsg = data?.error?.message || "Respons Gemini AI tidak valid atau API Key salah.";
      return NextResponse.json({ message: `Gemini Error: ${errorMsg}` }, { status: 500 });
    }

    let content = data.candidates[0].content.parts[0].text.trim();
    
    if (content.startsWith("```json")) {
      content = content.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (content.startsWith("```")) {
      content = content.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const result = JSON.parse(content);

    return NextResponse.json({
      success: true,
      videoUrl,
      clips: result.clips || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memproses AI: " + error.message },
      { status: 500 }
    );
  }
}
