import React from 'react';
import { Terminal, Shield, Volume2, VolumeX, RotateCcw, Upload, Activity, Clock } from 'lucide-react';
import { soundFx } from '../utils/sound';

export default function CyberHeader({ 
  soundEnabled, 
  setSoundEnabled, 
  onResetExam, 
  onLoadNew, 
  questionsCount, 
  currentIndex,
  score,
  elapsedTime,
  mode
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleSound = () => {
    const newState = soundFx.toggleSound();
    setSoundEnabled(newState);
  };

  return (
    <header className="sticky top-0 z-50 bg-cyber-950/90 backdrop-blur-md border-b border-cyber-border px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & System Status */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-950/50 border border-neon-cyan/50 rounded text-neon-cyan shadow-neon-cyan animate-pulse-fast">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg text-slate-100 tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-neon-cyan" />
                CYBER<span className="text-neon-cyan text-glow-cyan">Q&A</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-neon-green border border-neon-green/30">
                v2.4 ONLINE
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">
              SIMULADOR DE EXAMEN :: TERMINAL SECURE MODE
            </p>
          </div>
        </div>

        {/* Live Counters (Only in Exam Mode) */}
        {mode === 'quiz' && (
          <div className="flex items-center space-x-6 font-mono text-xs bg-cyber-900/80 px-4 py-2 rounded border border-cyber-border">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">PROGRESO:</span>
              <span className="text-neon-cyan font-bold">
                {currentIndex + 1} / {questionsCount}
              </span>
            </div>
            <div className="h-4 w-px bg-cyber-border" />
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">ACIERTOS:</span>
              <span className="text-neon-green font-bold">{score.correct}</span>
              <span className="text-slate-500">/</span>
              <span className="text-neon-red font-bold">{score.incorrect}</span>
            </div>
            <div className="h-4 w-px bg-cyber-border hidden sm:block" />
            <div className="hidden sm:flex items-center space-x-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-neon-cyan" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? "Desactivar Sonido" : "Activar Sonido Cyber"}
            className={`p-2 rounded border font-mono text-xs flex items-center transition-all ${
              soundEnabled
                ? 'border-neon-cyan/40 text-neon-cyan bg-cyan-950/20 hover:bg-cyan-900/40 shadow-neon-cyan'
                : 'border-slate-700 text-slate-500 bg-cyber-900 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
}
