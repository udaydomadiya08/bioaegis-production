"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Terminal, 
  ShieldAlert, 
  Layers, 
  Box, 
  Info, 
  Zap, 
  Cpu, 
  ChevronRight,
  Database,
  Globe
} from "lucide-react";
import MoleculeViewer from "@/components/MoleculeViewer";
import Molecule3D from "@/components/Molecule3D";
import ToxicityGauge from "@/components/ToxicityGauge";

interface AnalysisResult {
  smiles: string;
  valid: boolean;
  toxicity?: {
    toxicity_percent: number;
    toxicity_class: string;
    confidence: number;
    top_classes?: Array<{ class: string; confidence: number }>;
    atom_scores?: number[];
  };
  properties?: {
    mol_wt: number;
    logp: number;
    tpsa: number;
    h_donors: number;
    h_acceptors: number;
    heavy_atoms: number;
  };
  svg?: string;
  pdb?: string;
  error?: string;
}

export default function Home() {
  const [smiles, setSmiles] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [viewerMode, setViewerMode] = useState<"2D" | "3D">("3D");
  const [sentinelVision, setSentinelVision] = useState(true);

  const handleAnalyze = async () => {
    if (!smiles) return;
    setIsAnalyzing(true);
    setResult(null);
    
    try {
      const response = await fetch("https://udaydomadiya-bioaegis-api.hf.space/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smiles })
      });
      const data = await response.json();
      if (data.valid) {
        setResult(data);
      } else {
        alert(data.error || "Neural Engine: Invalid Structure.");
      }
    } catch (err) {
      console.error(err);
      alert("Neural Bridge Offline.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const examples = [
    { name: "Aspirin", smiles: "CC(=O)Oc1ccccc1C(=O)O" },
    { name: "Caffeine", smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C" },
    { name: "Sarin", smiles: "CCP(=O)(F)OC(C)C" }
  ];

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col gap-6 bg-[#020617] text-slate-100 italic selection:bg-emerald-500/30">
      {/* Premium Header */}
      <header className="flex items-center justify-between bg-black/20 border border-white/5 px-8 py-4 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <ShieldAlert className="text-emerald-400 w-6 h-6" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">BioAegis X-Alpha</h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <Activity className="w-3 h-3 text-emerald-500" /> System Operational | Node 08-Alpha
            </div>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-2 text-emerald-400">
            <Database className="w-3 h-3" /> API Core Active
          </div>
        </nav>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 h-full">
        
        {/* Left Column */}
        <aside className="lg:col-span-3 flex flex-col gap-6">
          <section className="bg-black/20 border border-white/5 p-6 flex-1 flex flex-col rounded-3xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6 text-emerald-400">
              <Terminal className="w-5 h-5" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Neural Console</h2>
            </div>
            
            <div className="space-y-4 flex-1">
              <textarea 
                value={smiles}
                onChange={(e) => setSmiles(e.target.value)}
                placeholder="Enter chemical string..."
                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 resize-none font-mono text-sm focus:border-emerald-500/50 outline-none"
              />
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                {isAnalyzing ? <Activity className="animate-spin w-5 h-5" /> : <>Analyze Compound <ChevronRight className="w-4 h-4" /></>}
              </button>

              <div className="pt-6 border-t border-white/5 space-y-2">
                {examples.map((ex) => (
                  <button 
                    key={ex.name}
                    onClick={() => setSmiles(ex.smiles)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 text-left group"
                  >
                    <span className="text-xs font-bold text-slate-300 group-hover:text-emerald-400">{ex.name}</span>
                    <Box className="w-3 h-3 text-slate-600 group-hover:text-emerald-500" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        </aside>

        {/* Center Column */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <section className="bg-black/20 border border-white/5 overflow-hidden flex-1 relative flex flex-col min-h-[500px] rounded-3xl backdrop-blur-xl">
            <div className="absolute top-6 left-6 z-10 flex gap-2">
              <button onClick={() => setViewerMode("3D")} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${viewerMode === "3D" ? 'bg-emerald-500 text-slate-950' : 'bg-white/5 text-slate-400'}`}>3D Engine</button>
              <button onClick={() => setViewerMode("2D")} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${viewerMode === "2D" ? 'bg-emerald-500 text-slate-950' : 'bg-white/5 text-slate-400'}`}>2D Schematic</button>
            </div>

            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key={viewerMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col h-full">
                  <div className="flex-1 flex items-center justify-center p-8">
                    {viewerMode === "2D" ? (
                      <div className="w-full max-w-lg bg-black/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl">
                        <MoleculeViewer svg={result.svg || ""} />
                      </div>
                    ) : (
                      <div className="w-full h-full relative">
                        <Molecule3D pdb={result.pdb || ""} atomScores={sentinelVision ? result.toxicity?.atom_scores : undefined} />
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-white/5 flex items-center justify-between bg-slate-950/20">
                    <button onClick={() => setSentinelVision(!sentinelVision)} className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${sentinelVision ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800 text-slate-500'}`}>Sentinel Vision: {sentinelVision ? 'Active' : 'Offline'}</button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                  <Globe className="w-12 h-12 text-slate-600 mb-4 animate-pulse" />
                  <h3 className="text-xl font-bold uppercase italic tracking-tighter">Awaiting Signal</h3>
                </div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Right Column */}
        <aside className="lg:col-span-3 flex flex-col gap-6">
          <section className="bg-black/20 border border-white/5 p-6 flex-1 flex flex-col rounded-3xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6 text-emerald-400">
              <Layers className="w-5 h-5" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Intelligence Report</h2>
            </div>
            <AnimatePresence>
              {result && result.toxicity ? (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="flex justify-center -mt-4"><ToxicityGauge percent={result.toxicity.toxicity_percent} /></div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Dominant Syndrome</div>
                    <div className="text-xl font-bold text-emerald-400 capitalize italic">{result.toxicity.toxicity_class}</div>
                  </div>
                  <div className="space-y-4">
                     <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Neural Path Activation</span>
                     <div className="space-y-3">
                        {result.toxicity.top_classes?.slice(0, 3).map((cls, j) => (
                           <div key={j} className="space-y-1.5">
                              <div className="flex justify-between text-[10px] font-bold uppercase">
                                 <span className="text-slate-400">{cls.class}</span>
                                 <span className="text-slate-200">{(cls.confidence * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${cls.confidence * 100}%` }} className={`h-full ${j === 0 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-600 opacity-60'}`} />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 italic text-[10px] uppercase tracking-widest">Awaiting Neural Inference</div>
              )}
            </AnimatePresence>
          </section>
        </aside>
      </div>
      
      <footer className="footer bg-neutral-950 text-[10px] font-bold text-neutral-700 uppercase tracking-[0.3em] py-8 border-t border-white/5 px-6 flex justify-between">
        <div>© 2026 BioAegis X-Alpha Platform | Secure Neural Bridge</div>
        <div className="flex gap-8">
          <span>Node: Operational</span>
          <span>Cluster: 08-Alpha</span>
        </div>
      </footer>
    </main>
  );
}
