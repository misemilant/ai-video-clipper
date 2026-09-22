import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { videoUrl } = await req.json();

    if (!videoUrl) {
      return NextResponse.json({ message: "URL Video wajib diisi." }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: "GROQ_API_KEY belum dipasang di Vercel!" }, { status: 500 });
    }

    // Panggil LLM Groq untuk menganalisis dan merekomendasikan klip berdasarkan URL
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Kamu adalah AI Video Editor profesional. Diberikan URL video YouTube, analisis potensi kontennya dan hasilkan 3 rekomendasi klip video pendek (TikTok/Reels). Kembalikan HANYA format JSON valid tanpa teks lain seperti ini: {\"clips\": [{\"id\":\"1\", \"title\":\"Judul\", \"startTime\":\"00:30\", \"endTime\":\"01:15\", \"viralScore\": 90, \"summary\":\"Rangkuman singkat\", \"reason\":\"Alasan viral\"}]}"
          },
          {
            role: "user",
            content: `Analisis video YouTube ini dan buatkan 3 rekomendasi klip pendek: ${videoUrl}`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

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
