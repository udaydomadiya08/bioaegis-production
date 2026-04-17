"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ToxicityGaugeProps {
  percent: number;
}

const ToxicityGauge: React.FC<ToxicityGaugeProps> = ({ percent }) => {
  const radius = 140; // Scaled up massively
  const stroke = 24;  // Thicker stroke for presence
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const color = "#00f5a0"; // High-vibrancy Emerald

  return (
    <div className="relative flex items-center justify-center" style={{ width: radius * 2, height: radius * 2 }}>
      {/* Intense Emerald Pulsator */}
      <motion.div 
        animate={{ 
          opacity: [0.05, 0.15, 0.05],
          scale: [0.98, 1.02, 0.98]
        }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute inset-0 rounded-full blur-[60px] bg-[#00f5a0]"
      />
      
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 drop-shadow-[0_0_20px_rgba(0,245,160,0.3)]"
      >
        <circle
          stroke="rgba(255,255,255,0.03)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "circOut" }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ filter: `drop-shadow(0 0 15px ${color})` }}
        />
      </svg>

      {/* Synchronized Readout Core */}
      <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none z-10">
        <span className="text-7xl font-black italic tracking-tighter text-white leading-none">
          {percent.toFixed(1)}<span className="text-3xl ml-1">%</span>
        </span>
        <div className="text-[12px] uppercase tracking-[0.4em] font-black text-[#00f5a0] mt-4 italic border-t border-[#00f5a0]/30 pt-4 px-6">
          Threat Index
        </div>
      </div>
    </div>
  );
};

export default ToxicityGauge;
