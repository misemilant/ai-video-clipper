import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const promptText = `Kamu adalah AI Video Editor profesional. Analisis video YouTube berikut: ${videoUrl}. Hasilkan 3 rekomendasi klip pendek menarik (TikTok/Reels). Kembalikan JSON dengan struktur persis seperti ini: {"clips": [{"id":"1", "title":"Judul Klip", "startTime":"00:30", "endTime":"01:15", "viralScore": 90, "summary":"Rangkuman singkat", "reason":"Alasan viral"}]}`;

    const result = await model.generateContent(promptText);
    const responseText = result.response.text();

    const data = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      videoUrl,
      clips: data.clips || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memproses AI: " + error.message },
      { status: 500 }
    );
  }
}
