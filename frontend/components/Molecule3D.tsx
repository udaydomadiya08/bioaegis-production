"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Maximize2, RotateCcw, Box } from "lucide-react";

interface Molecule3DProps {
  pdb: string;
  isAnalyzing?: boolean;
  sentinelVision?: boolean;
  atomScores?: number[];
}

export default function Molecule3D({ pdb, isAnalyzing, sentinelVision }: Molecule3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Interaction & Animation State
  const autoRotateRef = useRef<boolean>(true);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Dynamically load 3Dmol.js from CDN
    if (typeof window === "undefined") return;
    
    const handleInteraction = () => {
      autoRotateRef.current = false;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        autoRotateRef.current = true;
      }, 3000);
    };

    if ((window as any).$3Dmol) {
        initViewer(handleInteraction);
        return;
    }

    const script = document.createElement("script");
    script.src = "https://3Dmol.org/build/3Dmol-min.js";
    script.async = true;
    script.onload = () => {
      if (containerRef.current && pdb) {
        initViewer(handleInteraction);
      }
    };
    document.head.appendChild(script);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (pdb && (window as any).$3Dmol) {
      initViewer(() => {
        autoRotateRef.current = false;
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
          autoRotateRef.current = true;
        }, 3000);
      });
    }
  }, [pdb, sentinelVision]);

  const initViewer = (onInteract: () => void) => {
    const $3Dmol = (window as any).$3Dmol;
    if (!$3Dmol || !containerRef.current) return;

    // Clear previous viewer
    containerRef.current.innerHTML = "";
    
    const viewer = $3Dmol.createViewer(containerRef.current, {
      backgroundColor: "transparent",
    });
    
    viewerRef.current = viewer;
    viewer.addModel(pdb, "pdb");
    
    if (sentinelVision) {
        const gradientScheme = { prop: 'b', gradient: 'rwb', min: 0.1, max: 0.8 };
        viewer.setStyle({}, { 
            stick: { colorscheme: gradientScheme, radius: 0.2 },
            sphere: { colorscheme: gradientScheme, scale: 0.3 }
        });
        viewer.addSurface($3Dmol.SurfaceType.VDW, {
            opacity: 0.4,
            colorscheme: gradientScheme
        });
    } else {
        viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { scale: 0.25 } });
        viewer.addSurface($3Dmol.SurfaceType.VDW, {
            opacity: 0.2,
            color: 'white'
        });
    }

    // Set Industrial Zoom Guards: Expanded (0.01 - 10.0) for Absolute Navigational Freedom
    if (viewer.setZoomLimits) {
        viewer.setZoomLimits(0.01, 10.0);
    }

    viewer.zoomTo(0.7); // Fit to 70% of viewport for full visibility
    viewer.render();
    setIsLoaded(true);

    // Bind Interaction Shield
    const canvas = containerRef.current.querySelector('canvas');
    if (canvas) {
        ['mousedown', 'wheel', 'touchstart', 'mousemove'].forEach(evt => {
            canvas.addEventListener(evt, onInteract, { passive: true });
        });
    }

    // Launch Harmonic Auto-Rotation Loop
    const animate = () => {
        if (autoRotateRef.current && viewerRef.current) {
            // Smooth randomized orbital movement
            viewerRef.current.rotate(0.3, 'y');
            viewerRef.current.rotate(0.1, 'x');
            viewerRef.current.render();
        }
        animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleReset = () => {
    if (viewerRef.current) {
      viewerRef.current.zoomTo();
      autoRotateRef.current = true;
    }
  };

  return (
    <div className="relative glass-card min-h-[400px] w-full group overflow-hidden bg-black/40">
      {!pdb || isAnalyzing ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-mono">
            {isAnalyzing ? "Calculating Conformer..." : "Awaiting 3D Data"}
          </p>
        </div>
      ) : null}

      <div 
        ref={containerRef} 
        className={`w-full h-[400px] transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
      />

      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={handleReset}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md border border-white/10 transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4 text-white/60" />
        </button>
        <button 
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md border border-white/10 transition-colors"
          title="Full Context"
        >
          <Box className="w-4 h-4 text-primary" />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 flex gap-2 items-center">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#00ffcc]" />
        <span className="text-[10px] uppercase tracking-widest text-primary/80 font-mono font-bold">
            {isLoaded && autoRotateRef.current ? "Orbital Auto-Discovery Active" : "Tactical Manual Audit Active"}
        </span>
      </div>
    </div>
  );
}
