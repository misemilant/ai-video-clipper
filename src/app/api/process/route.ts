import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { videoUrl } = await req.json();

    if (!videoUrl) {
      return NextResponse.json({ message: "URL Video wajib diisi." }, { status: 400 });
    }

    // Simulasi jeda pemrosesan AI
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockClips = [
      {
        id: "1",
        title: "Poin Paling Penting & Kejutan Utama",
        startTime: "01:15",
        endTime: "02:05",
        viralScore: 95,
        summary: "Pembahasan krusial mengenai strategi masa depan yang langsung menarik perhatian penonton.",
        reason: "Memiliki hook suara yang tinggi di 3 detik pertama."
      },
      {
        id: "2",
        title: "Tips Praktis & Solusi Cepat",
        startTime: "04:30",
        endTime: "05:15",
        viralScore: 88,
        summary: "Penjelasan mengenai langkah demi langkah menyelesaikan masalah teknis secara sederhana.",
        reason: "Sangat edukatif dan mudah dibagikan (shareable)."
      },
      {
        id: "3",
        title: "Kesimpulan & Call to Action",
        startTime: "08:10",
        endTime: "09:00",
        viralScore: 82,
        summary: "Pesan penutup yang memberikan inspirasi dan arahan tindak lanjut.",
        reason: "Cocok untuk outro video pendek."
      }
    ];

    return NextResponse.json({
      success: true,
      videoUrl,
      clips: mockClips,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan server saat memproses video." },
      { status: 500 }
    );
  }
}
