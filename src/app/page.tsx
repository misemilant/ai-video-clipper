"use client";

import { useState } from "react";
import { Video, Sparkles, Download, Play, RefreshCw, Layers } from "lucide-react";

interface Clip {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  viralScore: number;
  reason: string;
  summary: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [clips, setClips] = useState<Clip[]>([]);
  const [error, setError] = useState("");

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setClips([]);

    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memproses video");
      }

      setClips(data.clips);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" /> AI-Powered Video Shorts Generator
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
          Ubah Video Panjang Jadi Klip Viral
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Tempelkan URL video YouTube, dan biarkan AI mengekstrak momen-momen terbaik berdurasi pendek secara otomatis.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl shadow-xl max-w-2xl mx-auto mb-16">
        <form onSubmit={handleProcess} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Video className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Memproses...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Generasi Klip
              </>
            )}
          </button>
        </form>

        {error && (
          <p className="text-red-400 text-sm mt-3 text-center bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
            {error}
          </p>
        )}
      </div>

      {/* Results Section */}
      {clips.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-400" /> Hasil Rekomendasi Klip AI
            </h2>
            <span className="text-sm text-slate-400">{clips.length} Klip Ditemukan</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clips.map((clip) => (
              <div
                key={clip.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="bg-indigo-500/10 text-indigo-400 text-xs font-semibold px-2.5 py-1 rounded-md border border-indigo-500/20">
                      Score: {clip.viralScore}%
                    </span>
                    <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      {clip.startTime} - {clip.endTime}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-slate-100 group-hover:text-indigo-300 transition-colors">
                    {clip.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3">
                    {clip.summary}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center gap-2">
                  <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                    <Play className="w-4 h-4" /> Preview
                  </button>
                  <button className="flex-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 border border-indigo-500/30 transition-colors">
                    <Download className="w-4 h-4" /> Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
