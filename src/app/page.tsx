"use client";

import React, { useState } from "react";
import { MOCK_NODES, NodeData } from "@/data/mockNodes";

export default function Home() {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
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
          <div className="text-xs font-mono bg-neutral-900 border border-neutral-800 px-3 py-1 rounded text-neutral-400">
            STATUS: ACTIVE_NODE
          </div>
        </header>

        <div className="mb-10 bg-neutral-950 border border-neutral-900 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-neutral-200 mb-2">KAOS DEĞİL, MİMARİ. SIĞLIK DEĞİL, SİNYAL.</h2>
          <p className="text-sm text-neutral-400">
            Geleneksel gürültü formasyonları devre dışı bırakıldı. Yalnızca coğrafi eşik ve somut çıktı üreten düğümler listeleniyor.
          </p>
        </div>

        <section>
          <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-4">
            Detected Proximity Nodes (Ağ Çevresi)
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {MOCK_NODES.map((node) => (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-5 rounded-lg border transition-all cursor-pointer bg-neutral-950 ${
                  selectedNode?.id === node.id
                    ? "border-blue-600 bg-neutral-900/50"
                    : "border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono text-sm text-blue-400">{node.codename}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
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
            ))}
          </div>
        </section>
      </div>

      {selectedNode && (
        <div className="mt-8 border border-neutral-800 bg-neutral-950 p-6 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-xs font-mono text-neutral-500">SELECTED NODE CONTEXT</div>
            <div className="text-md font-semibold text-white mt-1">{selectedNode.codename} — Uyum Skoru: %{selectedNode.compatibilityScore}</div>
            <p className="text-xs text-neutral-400 mt-1">Çıktı: {selectedNode.output}</p>
          </div>
          <button
            onClick={() => handlePing(selectedNode.id)}
            className="w-full md:w-auto bg-white text-black hover:bg-neutral-200 text-xs font-mono px-6 py-3 rounded font-medium transition-colors"
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
