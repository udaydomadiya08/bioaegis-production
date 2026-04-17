"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ToxicityGaugeProps {
  percent: number;
}

const ToxicityGauge: React.FC<ToxicityGaugeProps> = ({ percent }) => {
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const getColor = (val: number) => {
    if (val > 80) return '#ef4444'; // Danger Red
    if (val > 40) return '#f59e0b'; // Warning Orange
    return '#10b981'; // Safe Emerald
  };

  const color = getColor(percent);

  return (
    <div className="relative flex items-center justify-center w-60 h-60">
      {/* Outer Glow Ring */}
      <div 
        className="absolute inset-0 rounded-full opacity-10 blur-2xl transition-all duration-1000"
        style={{ backgroundColor: color }}
      />
      
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
      >
        {/* Background Track */}
        <circle
          stroke="rgba(255,255,255,0.05)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        
        {/* Progress Arc */}
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ filter: `drop-shadow(0 0 5px ${color})` }}
        />
      </svg>

      {/* Probability Readout */}
      <div className="absolute flex flex-col items-center">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold tracking-tighter"
          style={{ color }}
        >
          {percent.toFixed(1)}%
        </motion.span>
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mt-1">
          Threat Index
        </span>
      </div>
    </div>
  );
};

export default ToxicityGauge;
