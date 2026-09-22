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

    const promptText = `Kamu adalah AI Video Editor profesional. Analisis video YouTube berikut: ${videoUrl}. Hasilkan 3 rekomendasi klip pendek menarik (TikTok/Reels). Kembalikan JSON dengan struktur persis seperti ini: {"clips": [{"id":"1", "title":"Judul Klip", "startTime":"00:30", "endTime":"01:15", "viralScore": 90, "summary":"Rangkuman singkat", "reason":"Alasan viral"}]}`;

    // Menggunakan nama model gemini-3.6-flash sesuai petunjuk resmi Google API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || "Terjadi kesalahan pada Gemini API.";
      return NextResponse.json({ message: `Gemini Error: ${errorMsg}` }, { status: 500 });
    }

    if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      return NextResponse.json({ message: "Gemini tidak mengembalikan respons teks valid." }, { status: 500 });
    }

    const rawText = data.candidates[0].content.parts[0].text;
    const result = JSON.parse(rawText);

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
