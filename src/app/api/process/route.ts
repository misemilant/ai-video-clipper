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

    // Daftar nama model Gemini yang dicoba berturut-turut jika salah satu tidak tersedia
    const candidateModels = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-1.5-flash"
    ];

    let lastErrorMsg = "";
    let resultJson = null;

    for (const model of candidateModels) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        });

        const data = await response.json();

        if (response.ok && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          let content = data.candidates[0].content.parts[0].text.trim();
          
          if (content.startsWith("```json")) {
            content = content.replace(/^```json/, "").replace(/```$/, "").trim();
          } else if (content.startsWith("```")) {
            content = content.replace(/^```/, "").replace(/```$/, "").trim();
          }

          resultJson = JSON.parse(content);
          break; // Berhasil, keluar dari loop
        } else {
          lastErrorMsg = data?.error?.message || `Model ${model} gagal memproses.`;
        }
      } catch (e: any) {
        lastErrorMsg = e.message;
      }
    }

    if (!resultJson) {
      return NextResponse.json({ message: `Gemini Error: ${lastErrorMsg}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      videoUrl,
      clips: resultJson.clips || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memproses AI: " + error.message },
      { status: 500 }
    );
  }
}
