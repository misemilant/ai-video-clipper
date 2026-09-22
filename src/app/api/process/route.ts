import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { videoUrl } = await req.json();

    if (!videoUrl) {
      return NextResponse.json({ message: "URL Video wajib diisi." }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: "GROQ_API_KEY belum dipasang di Environment Variables Vercel!" }, { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Kamu adalah AI Video Editor profesional. Diberikan URL video YouTube, buat 3 rekomendasi klip video pendek menarik. Kembalikan HANYA format JSON valid tanpa teks lain: {\"clips\": [{\"id\":\"1\", \"title\":\"Judul Klip\", \"startTime\":\"00:30\", \"endTime\":\"01:15\", \"viralScore\": 90, \"summary\":\"Rangkuman singkat\", \"reason\":\"Alasan viral\"}]}"
          },
          {
            role: "user",
            content: `Analisis video YouTube ini dan berikan 3 klip terbaik: ${videoUrl}`
          }
        ],
        temperature: 0.5
      })
    });

    const data = await response.json();

    if (!response.ok || !data.choices || !data.choices[0]) {
      const errorMsg = data?.error?.message || "Respons AI tidak valid atau API Key bermasalah.";
      return NextResponse.json({ message: `Groq Error: ${errorMsg}` }, { status: 500 });
    }

    let content = data.choices[0].message.content.trim();
    
    // Hapus format markdown json jika AI mengembalikannya dalam triple backticks
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
