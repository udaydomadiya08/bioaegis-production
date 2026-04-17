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
  Globe,
  Radio
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
    <main className="min-h-screen relative flex flex-col p-6 md:p-12 gap-12 overflow-hidden">
      {/* Liquid Background Orbs */}
      <div className="bg-liquid fixed inset-0">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 60, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" 
        />
      </div>

      {/* Floating Header */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <motion.div 
             whileHover={{ scale: 1.1, rotate: 5 }}
             className="w-14 h-14 bg-white/5 backdrop-blur-3xl rounded-3xl flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
          >
            <ShieldAlert className="text-cyan-400 w-8 h-8 drop-shadow-[0_0_10px_#22d3ee]" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white font-display">BIOAEGIS <span className="text-cyan-400">X-ALPHA</span></h1>
            <div className="flex items-center gap-2 text-[10px] text-white/30 font-black uppercase tracking-[0.4em]">
               <Radio className="w-3 h-3 text-cyan-400 animate-pulse" /> Operational Core | Node 08
            </div>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-10">
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-2xl border border-white/5 px-6 py-2.5 rounded-full">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Live Synthesis Active</span>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto text-center space-y-8 py-12">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-mega text-white font-display"
        >
          ULTIMATE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-400">TOXICITY</span> CONTROL
        </motion.h2>
        <p className="text-xl text-white/40 max-w-2xl mx-auto leading-relaxed font-medium">
          Input molecular descriptors below for high-attraction GNN structural intelligence and real-time sentinel vision.
        </p>
      </section>

      {/* Main Grid Architecture */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-[1600px] mx-auto w-full">
        
        {/* Left Column: Neural Console */}
        <aside className="lg:col-span-4 flex flex-col gap-10">
          <section className="neon-card p-10 flex flex-col gap-8 neon-border-cyan group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                <Terminal className="text-cyan-400 w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest text-white/80 font-display">Neural Console</h3>
            </div>
            
            <div className="space-y-6 flex-1">
              <div className="space-y-4">
                <label className="text-[11px] uppercase tracking-[0.3em] font-black text-white/30 block">Structural SMILES Descriptor</label>
                <textarea 
                  value={smiles}
                  onChange={(e) => setSmiles(e.target.value)}
                  placeholder="Enter molecular string (e.g. CC(=O)Oc1ccccc1C(=O)O)..."
                  className="w-full h-48 bg-white/5 border border-white/10 rounded-[2rem] p-8 font-mono text-sm text-cyan-50 focus:border-cyan-400/50 transition-all outline-none shadow-inner"
                />
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full btn-neon-cyan relative overflow-hidden group/btn"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                   {isAnalyzing ? "SYNTESIZING..." : "EXECUTE ANALYSIS"} <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                </span>
                <motion.div 
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-white/20 skew-x-12 translate-y-[-50%] top-0 h-[200%]"
                />
              </button>

              <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
                <span className="text-[11px] uppercase tracking-[0.3em] font-black text-white/30 block">Structural Templates</span>
                <div className="grid grid-cols-2 gap-3">
                  {examples.map((ex) => (
                    <button 
                      key={ex.name}
                      onClick={() => setSmiles(ex.smiles)}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all text-left group"
                    >
                      <span className="text-xs font-bold text-white/60 group-hover:text-cyan-400">{ex.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 text-xs text-white/40 leading-relaxed italic">
             <div className="flex items-center gap-3 mb-3 text-indigo-400 not-italic font-black uppercase tracking-widest">
                <Cpu className="w-4 h-4" /> Inference Specs
             </div>
             Model Ver: Alpha-08 <br/>
             Core Accuracy: 94.25% <br/>
             Stability: Production Grade
          </div>
        </aside>

        {/* Right Column: Dynamic Visual Intelligence */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          <AnimatePresence mode="wait">
            {!result ? (
               <motion.section 
                 key="idle"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="neon-card flex-1 flex flex-col items-center justify-center p-24 text-center border-dashed border-white/10"
               >
                 <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center mb-10 border border-white/10 group animate-pulse">
                    <Globe className="w-16 h-16 text-white/10" />
                 </div>
                 <h2 className="text-title text-white/40 font-display italic tracking-tighter">AWAITING NEURAL ACTIVATION</h2>
                 <p className="text-lg text-white/20 mt-4 max-w-sm uppercase tracking-tighter font-bold">Input a compound to synthesize structural multi-pane intelligence.</p>
               </motion.section>
            ) : (
               <motion.div 
                 key="result"
                 initial={{ opacity: 0, y: 40 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex flex-col gap-10"
               >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <section className="neon-card p-10 neon-border-violet h-[650px] flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <Zap className="text-violet-400 w-6 h-6" />
                          <h3 className="text-lg font-black uppercase tracking-widest text-white/80 font-display">Sentinel Vision</h3>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setViewerMode("3D")}
                            className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${viewerMode === "3D" ? 'bg-violet-500 text-white' : 'bg-white/5 text-white/40 border border-white/5'}`}
                          >
                            3D Core
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 relative bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner overflow-hidden mb-8">
                         {viewerMode === "3D" ? (
                            <Molecule3D pdb={result.pdb || ""} atomScores={sentinelVision ? result.toxicity?.atom_scores : undefined} />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center p-12 invert brightness-[2] contrast-[1.5]">
                               <MoleculeViewer svg={result.svg || ""} />
                            </div>
                         )}
                      </div>

                      <button 
                        onClick={() => setSentinelVision(!sentinelVision)}
                        className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all border ${sentinelVision ? 'bg-violet-500/20 text-violet-400 border-violet-500/50' : 'bg-white/5 text-white/20 border-white/5'}`}
                      >
                         SENTINEL SENSOR: {sentinelVision ? 'ONLINE' : 'OFFLINE'}
                      </button>
                    </section>

                    <section className="neon-card p-10 flex flex-col gap-10 border-cyan-400/20 bg-cyan-400/[0.02]">
                       <div className="flex items-center gap-3">
                          <Layers className="text-cyan-400 w-6 h-6" />
                          <h3 className="text-lg font-black uppercase tracking-widest text-white/80 font-display">Inference Engine</h3>
                       </div>

                       <div className="flex flex-col items-center justify-center -mt-8">
                          <ToxicityGauge percent={result.toxicity?.toxicity_percent || 0} />
                       </div>

                       <div className="space-y-6">
                         <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 block mb-2">Dominant Cluster Match</span>
                            <div className="text-4xl font-black text-cyan-400 capitalize tracking-tighter italic">
                               {result.toxicity?.toxicity_class}
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            {[
                               { l: "LogP", v: result.properties?.logp.toFixed(2) },
                               { l: "TPSA", v: result.properties?.tpsa.toFixed(1) },
                               { l: "Mol Wt", v: result.properties?.mol_wt.toFixed(1) },
                               { l: "H-Donors", v: result.properties?.h_donors }
                            ].map((p, i) => (
                               <div key={i} className="p-5 rounded-2xl bg-black/40 border border-white/5">
                                  <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">{p.l}</div>
                                  <div className="text-xl font-black text-white">{p.v}</div>
                               </div>
                            ))}
                         </div>

                         <div className="p-6 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-[11px] text-white/60 leading-relaxed font-medium italic">
                            <Info className="w-5 h-5 text-violet-400 mb-2" />
                            AI Insight: Structural analysis of {result.smiles.slice(0, 15)}... indicates {(result.toxicity?.toxicity_percent || 0) > 70 ? 'CRITICAL' : (result.toxicity?.toxicity_percent || 0) > 30 ? 'ELEVATED' : 'STABLE'} risk parameters within the {result.toxicity?.toxicity_class} network.
                         </div>
                       </div>
                    </section>
                  </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Heavy Branding Footer */}
      <footer className="relative z-10 pt-12 pb-24 border-t border-white/5 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.5em] text-white/20 px-4">
        <div>© 2026 BIOAEGIS X-ALPHA SYSTEM | SECURE NEURAL ARCHITECTURE</div>
        <div className="flex gap-10">
          <span className="text-cyan-400/40">Status: Operational</span>
          <span>Cluster: 08-Alpha</span>
        </div>
      </footer>
    </main>
  );
}
