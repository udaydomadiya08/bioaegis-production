"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Settings, 
  Terminal, 
  Zap, 
  ShieldAlert, 
  Layers, 
  Box, 
  Database,
  Activity,
  Globe,
  Radio,
  Share2,
  ChevronRight,
  User,
  LogOut
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
  const [activeNav, setActiveNav] = useState("Dashboard");

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

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Neural Hub", icon: Zap },
    { name: "Structural AI", icon: Box },
    { name: "API Vault", icon: Database },
    { name: "Command Center", icon: Terminal }
  ];

  return (
    <div className="flex min-h-screen bg-[#0d1117] text-[#c9d1d9] overflow-hidden">
      {/* Structural Sidebar */}
      <aside className="w-[var(--sidebar-w)] bg-[#0b0e14] border-r border-white/5 flex flex-col z-50">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00f5a0] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,245,160,0.4)]">
             <ShieldAlert className="text-[#0b0e14] w-6 h-6" />
          </div>
          <span className="font-extrabold italic text-xl text-white tracking-tighter uppercase">BioAegis</span>
        </div>

        <nav className="flex-1 mt-6">
          {navItems.map((item) => (
            <div 
              key={item.name}
              onClick={() => setActiveNav(item.name)}
              className={`nav-item ${activeNav === item.name ? 'nav-item-active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 overflow-hidden">
               <User className="text-white/40 w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">uday_cluster</div>
              <div className="text-[10px] text-[#8b949e]">Operator Node</div>
            </div>
            <LogOut className="w-4 h-4 text-[#8b949e] ml-auto hover:text-white cursor-pointer" />
          </div>
          
          <div className="bg-[#161b22] p-4 rounded-xl border border-white/5">
             <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#8b949e] mb-2">
                <span>Industrial Power</span>
                <Info className="w-3 h-3" />
             </div>
             <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                <div className="h-full w-[80%] bg-[#00f5a0] shadow-[0_0_10px_#00f5a0]" />
             </div>
             <button className="w-full mt-4 py-2 border border-[#00f5a0]/30 rounded-lg text-[10px] font-black uppercase text-[#00f5a0] hover:bg-[#00f5a0]/5 transition-all">Upgrade Node</button>
          </div>
        </div>
      </aside>

      {/* Main Command Deck */}
      <main className="flex-1 relative flex flex-col radial-center-glow overflow-y-auto scroll-hide">
        {/* Top Operational bar */}
        <header 
          className="px-10 py-6 flex items-center justify-between pointer-events-none sticky top-0 bg-[#0d1117]/80 z-40 border-b border-white/5"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-4">
             <div className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 font-black uppercase tracking-widest text-[#00f5a0]">Vantix Node v1.1.0</div>
             <div className="h-4 w-px bg-white/10" />
             <div className="flex items-center gap-2 text-[10px] text-[#8b949e] font-black uppercase tracking-widest">
                <Radio className="w-3 h-3 text-[#00f5a0] animate-pulse" /> Synthesis Cluster Active
             </div>
          </div>
          <Settings className="w-5 h-5 text-[#8b949e] cursor-pointer pointer-events-auto hover:text-white" />
        </header>

        {/* Content Section */}
        <div className="px-12 py-12 space-y-12">
          {/* Industrial Hero */}
          <section className="space-y-4">
            <motion.h1 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-industrial text-white"
            >
              BioAegis <br/> <span className="text-[#00f5a0]">Industrial</span>
            </motion.h1>
            <p className="text-lg text-[#8b949e] max-w-2xl leading-relaxed italic">
               Orchestrate high-throughput structural synthesis with zero latency. <br/>
               The world's most advanced autonomous toxicity predictor.
            </p>
          </section>

          {/* Synthesis Input Group */}
          <section className="command-card p-1 items-center flex overflow-hidden group focus-within:border-[#00f5a0]/30 transition-all">
             <textarea 
               value={smiles}
               onChange={(e) => setSmiles(e.target.value)}
               placeholder="Input topic, chemical vector, or research identifier..."
               className="flex-1 bg-transparent px-8 py-8 text-xl text-white outline-none resize-none font-bold placeholder:text-white/10 h-24 scroll-hide"
             />
             <div className="pr-4">
               <button 
                 onClick={handleAnalyze}
                 disabled={isAnalyzing}
                 className="btn-vantix"
               >
                 {isAnalyzing ? "Processing..." : "Initiate Connection"}
               </button>
             </div>
          </section>

          <AnimatePresence>
            {result ? (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10"
              >
                {/* 3D Visualizer */}
                <div className="lg:col-span-12">
                   <div className="flex items-center gap-3 mb-6 text-[#00f5a0]">
                      <Radio className="w-5 h-5 animate-pulse" />
                      <h3 className="text-sm font-black uppercase tracking-widest italic leading-none">Active Production Stream</h3>
                   </div>
                    <div className="command-card relative h-[600px] overflow-hidden group">
                      <div 
                        className="absolute top-6 left-6 z-10 flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/5"
                        style={{ backdropFilter: 'blur(12px)' }}
                      >
                         <div className="w-2 h-2 bg-[#00f5a0] rounded-full animate-ping" />
                         <span className="text-[10px] font-black uppercase text-white tracking-widest italic">Neural Visualizer Active</span>
                      </div>
                      <Molecule3D pdb={result.pdb || ""} atomScores={result.toxicity?.atom_scores} />
                   </div>
                </div>

                {/* Data Points */}
                <div className="lg:col-span-8 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="command-card p-8 flex items-center justify-between group">
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-[#00f5a0]/10 rounded-2xl flex items-center justify-center border border-[#00f5a0]/20">
                               <Layers className="text-[#00f5a0] w-8 h-8" />
                            </div>
                            <div>
                               <div className="text-[10px] font-black uppercase text-[#8b949e] tracking-widest mb-1">Syndrome Class</div>
                               <div className="text-2xl font-black text-white capitalize italic">{result.toxicity?.toxicity_class}</div>
                            </div>
                         </div>
                         <ChevronRight className="text-[#8b949e] group-hover:translate-x-1 transition-all" />
                      </div>
                      <div className="command-card p-8 flex items-center justify-between group">
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-[#00d2ff]/10 rounded-2xl flex items-center justify-center border border-[#00d2ff]/20">
                               <Database className="text-[#00d2ff] w-8 h-8" />
                            </div>
                            <div>
                               <div className="text-[10px] font-black uppercase text-[#8b949e] tracking-widest mb-1">Molecular Index</div>
                               <div className="text-2xl font-black text-white italic">{result.properties?.mol_wt.toFixed(1)} MW</div>
                            </div>
                         </div>
                         <ChevronRight className="text-[#8b949e] group-hover:translate-x-1 transition-all" />
                      </div>
                   </div>

                   <div className="command-card p-10 flex items-start gap-8">
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                         <Share2 className="text-[#8b949e] w-6 h-6" />
                      </div>
                      <div className="space-y-6 flex-1">
                         <span className="text-[10px] font-black uppercase text-[#8b949e] tracking-widest block">Structural Latent Space</span>
                         <div className="space-y-4">
                            {result.toxicity?.top_classes?.slice(0, 3).map((cls, j) => (
                               <div key={j} className="space-y-2">
                                  <div className="flex justify-between text-xs font-bold uppercase">
                                     <span className="text-white/40">{cls.class}</span>
                                     <span className="text-[#00f5a0]">{(cls.confidence * 100).toFixed(1)}%</span>
                                  </div>
                                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                     <motion.div initial={{ width: 0 }} animate={{ width: `${cls.confidence * 100}%` }} className="h-full bg-[#00f5a0] shadow-[0_0_10px_#00f5a0]" />
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>

                {/* Right Rail: Gauge */}
                <div className="lg:col-span-4 h-full">
                   <div className="command-card p-10 h-full flex flex-col items-center justify-center">
                      <ToxicityGauge percent={result.toxicity?.toxicity_percent || 0} />
                      <div className="mt-12 p-6 bg-white/5 border border-white/5 rounded-2xl text-xs text-[#8b949e] leading-relaxed italic text-center">
                         Neural analysis confirms structural motifs in the {result.toxicity?.toxicity_class.toLowerCase()} cluster. Sentinel vision has identified high-attribution atoms for production review.
                      </div>
                   </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 opacity-20 border-2 border-dashed border-white/5 rounded-[4rem]">
                 <Globe className="w-32 h-32 mb-8" />
                 <h2 className="text-4xl font-black italic tracking-tighter text-white">System Idle</h2>
                 <p className="text-[#8b949e] uppercase font-bold tracking-[0.4em] mt-4">Initiate Connection to Synthesize Results</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Branding Footer */}
        <footer className="px-12 py-12 flex items-center justify-between text-[11px] font-bold text-[#8b949e] uppercase tracking-[0.4em]">
           <div>© 2026 BioAegis X-Alpha Platform | Secure Neural Bridge</div>
           <div className="flex gap-10">
              <span className="text-[#00f5a0]/40">Node: Operational</span>
              <span>Cluster: 08-Alpha</span>
           </div>
        </footer>
      </main>
    </div>
  );
}
