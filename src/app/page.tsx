"use client";

import React, { useState } from "react";
import { MOCK_NODES, MY_NODE, NodeData } from "@/data/mockNodes";

export default function Home() {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [viewingSelf, setViewingSelf] = useState(false);
  const [pingSent, setPingSent] = useState<string | null>(null);

  const handlePing = (id: string) => {
    setPingSent(id);
    setTimeout(() => setPingSent(null), 3000);
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto flex flex-col justify-between">
      <div>
        <header className="flex justify-between items-center border-b border-neutral-800 pb-6 mb-8">
          <div>
            <h1 className="text-xl font-mono tracking-wider text-white">BORDERLINE // PROTOCOL</h1>
            <p className="text-xs text-neutral-500 mt-1">SYNCHRONIZATION & SIGNAL NETWORK</p>
          </div>
          <button
            onClick={() => { setViewingSelf(true); setSelectedNode(null); }}
            className="text-xs font-mono bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-2 rounded hover:bg-yellow-500/20 transition-colors cursor-pointer"
          >
            KENDİ KODUNU GÖR (NODE-0)
          </button>
        </header>

        <div className="mb-10 bg-neutral-950 border border-neutral-900 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-neutral-200 mb-2">KAOS DEĞİL, MİMARİ. SIĞLIK DEĞİL, SİNYAL.</h2>
          <p className="text-sm text-neutral-400">
            Tier 1 (Sarı/Yeşil) yakın çevre erişimi, Tier 2 (Sarı/Koyu Sarı) yüksek eşikli uzak koridorları temsil eder.
          </p>
        </div>

        <section>
          <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-4">
            Detected Proximity Nodes (Ağ Çevresi)
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {MOCK_NODES.map((node) => {
              const isTier1 = node.tier === 1;
              const borderColor = isTier1 ? "border-yellow-500/50 hover:border-green-400" : "border-yellow-600/40 hover:border-yellow-500";
              const badgeBg = isTier1 ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-yellow-950/40 text-yellow-500 border-yellow-700/50";
              const accentText = isTier1 ? "text-yellow-300" : "text-yellow-500";

              return (
                <div
                  key={node.id}
                  onClick={() => { setSelectedNode(node); setViewingSelf(false); }}
                  className={`p-5 rounded-lg border transition-all cursor-pointer bg-neutral-950 ${borderColor} ${
                    selectedNode?.id === node.id ? "ring-2 ring-yellow-400/50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`font-mono text-sm ${accentText}`}>{node.codename}</span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${badgeBg}`}>
                      Tier {node.tier} ({node.distanceKm} km)
                    </span>
                  </div>
                  <p className="text-sm text-neutral-300 mb-4">{node.output}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {node.techStack.map((tech, idx) => (
                      <span key={idx} className="text-[10px] font-mono bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {viewingSelf && (
        <div className="mt-8 border border-yellow-500/40 bg-neutral-950 p-6 rounded-lg relative">
          <button 
            onClick={() => setViewingSelf(false)} 
            className="absolute top-4 right-4 text-xs font-mono text-neutral-500 hover:text-white"
          >
            [KAPAT]
          </button>
          <div className="text-xs font-mono text-yellow-400 mb-1">LOCAL NODE CONFIGURATION (SENİN PROFİLİN)</div>
          <div className="text-md font-semibold text-white mt-1">{MY_NODE.codename} — Aktif Durum</div>
          <p className="text-xs text-neutral-300 mt-2">Çıktı: {MY_NODE.output}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {MY_NODE.techStack.map((tech, idx) => (
              <span key={idx} className="text-[10px] font-mono bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded">
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {selectedNode && !viewingSelf && (
        <div className="mt-8 border border-neutral-800 bg-neutral-950 p-6 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-xs font-mono text-neutral-500">SELECTED NODE CONTEXT</div>
            <div className="text-md font-semibold text-white mt-1">{selectedNode.codename} — Uyum Skoru: %{selectedNode.compatibilityScore}</div>
            <p className="text-xs text-neutral-400 mt-1">Çıktı: {selectedNode.output}</p>
          </div>
          <button
            onClick={() => handlePing(selectedNode.id)}
            className="w-full md:w-auto bg-yellow-500 text-black hover:bg-yellow-400 text-xs font-mono px-6 py-3 rounded font-medium transition-colors cursor-pointer"
          >
            {pingSent === selectedNode.id ? "PING GÖNDERİLDİ ✓" : "CONTEXTUAL PING GÖNDER"}
          </button>
        </div>
      )}

      <footer className="mt-16 border-t border-neutral-900 pt-6 text-center text-xs text-neutral-600 font-mono">
        BORDERLINE PROTOCOL // ZERO-NOISE ENVIRONMENT
      </footer>
    </main>
  );
}
