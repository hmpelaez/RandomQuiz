import React, { useState } from 'react';
import { CheckCircle, XCircle, Lightbulb, Sparkles, Brain, BookOpen, Bot } from 'lucide-react';
import { getThemeClasses } from '../utils/theme';

export default function ExplanationPanel({
  selectedOption,
  correctAnswer,
  explanation,
  accentTheme = 'cyan'
}) {
  const [showCopilot, setShowCopilot] = useState(false);
  const theme = getThemeClasses(accentTheme);
  const isCorrect = selectedOption === correctAnswer;

  return (
    <div className={`mt-6 border rounded-xl p-6 transition-all duration-500 ease-out transform translate-y-0 opacity-100 cyber-scanline w-full ${
      isCorrect
        ? 'border-neon-green/60 bg-emerald-950/20 shadow-neon-green'
        : 'border-neon-red/60 bg-rose-950/20 shadow-neon-red'
    }`}>
      
      {/* Explanation Header */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-cyber-border">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-lg border ${
            isCorrect
              ? 'bg-emerald-950 text-neon-green border-neon-green/40 shadow-neon-green'
              : 'bg-rose-950 text-neon-red border-neon-red/40 shadow-neon-red'
          }`}>
            {isCorrect ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-mono text-sm font-bold tracking-wider ${
                isCorrect ? 'text-neon-green text-glow-green' : 'text-neon-red text-glow-red'
              }`}>
                {isCorrect ? 'EVALUACIÓN: CORRECTO' : 'EVALUACIÓN: INCORRECTO'}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              {isCorrect 
                ? `Respuesta seleccionada (${selectedOption}) verificada correctamente.` 
                : `Respuesta seleccionada: (${selectedOption}). Respuesta correcta: (${correctAnswer}).`}
            </p>
          </div>
        </div>

        {/* AI HackHint Copilot Toggle Button */}
        <button
          onClick={() => setShowCopilot(!showCopilot)}
          className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0 ${
            showCopilot
              ? `${theme.badge} ${theme.glow}`
              : 'bg-cyber-950 border-cyber-border text-slate-300 hover:border-neon-cyan/60 hover:text-neon-cyan'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${showCopilot ? 'text-neon-cyan animate-pulse' : 'text-slate-400'}`} />
          <span>HackHint Copilot</span>
        </button>
      </div>

      {/* Collapsible Glassmorphism AI Copilot Drawer */}
      {showCopilot && (
        <div className="mb-5 p-4 rounded-xl border border-neon-cyan/30 bg-cyber-900/80 backdrop-blur-md shadow-[0_0_20px_rgba(0,255,255,0.1)] space-y-4 font-sans animate-in fade-in duration-300">
          
          {/* Drawer Header Badge */}
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <div className="flex items-center space-x-2 font-mono text-xs font-bold">
              <Bot className="w-4 h-4 text-neon-cyan" />
              <span className={`px-2.5 py-1 rounded border tracking-wider font-mono text-xs ${theme.badge}`}>
                CYBER AI COPILOT :: HACKHINT STUDY ASSISTANT
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-cyber-950 px-2 py-0.5 rounded border border-cyber-border">
              CEH v12 ASSISTANT
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Card 1: REGLA NEMOTÉCNICA */}
            <div className="bg-cyber-950/80 border border-neon-cyan/30 rounded-lg p-4 space-y-2 relative overflow-hidden shadow-inner">
              <div className="flex items-center space-x-2 font-mono text-xs font-bold text-neon-yellow">
                <Brain className="w-4 h-4 text-neon-yellow" />
                <span>REGLA NEMOTÉCNICA:</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                <strong className="text-neon-cyan font-mono">Tip de Examen:</strong> Para preguntas CEH v12 asociadas a esta temática, recuerda asociar la respuesta correcta <span className="text-neon-green font-mono font-bold">({correctAnswer})</span> con la palabra clave y el vector de ataque principal. Diferencia siempre si la técnica opera a nivel activo (tráfico generado) o pasivo (reconocimiento sin firmas).
              </p>
            </div>

            {/* Card 2: CONCEPTOS CLAVE */}
            <div className="bg-cyber-950/80 border border-neon-magenta/30 rounded-lg p-4 space-y-2 relative overflow-hidden shadow-inner">
              <div className="flex items-center space-x-2 font-mono text-xs font-bold text-neon-magenta">
                <BookOpen className="w-4 h-4 text-neon-magenta" />
                <span>CONCEPTOS CLAVE:</span>
              </div>
              <div className="text-sm text-slate-300 leading-relaxed font-sans space-y-1.5">
                <div className="flex items-start space-x-2">
                  <span className="text-neon-magenta font-mono font-bold">•</span>
                  <span><strong className="text-slate-200 font-mono">Opción Válida:</strong> Opción ({correctAnswer})</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-neon-magenta font-mono font-bold">•</span>
                  <span><strong className="text-slate-200 font-mono">Desglose Téorico:</strong> {explanation ? explanation.replace(/\n/g, ' ') : 'Análisis detallado de protocolo y vectores de ataque.'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Didactic Context Body */}
      <div className="space-y-3 w-full">
        <div className="flex items-center space-x-2 text-neon-cyan font-mono text-xs font-semibold">
          <Lightbulb className="w-4 h-4 text-neon-yellow" />
          <span>EXPLICACIÓN TÉCNICA:</span>
        </div>

        {/* Contenedor w-full con text-justify, font-sans, leading-relaxed y border-l-4 border-neon-cyan */}
        <div className="w-full bg-cyber-950/80 border border-cyber-border rounded-lg p-4 font-sans text-base text-slate-300 leading-relaxed text-justify border-l-4 border-neon-cyan pl-4 shadow-inner">
          {explanation ? explanation.replace(/\n/g, ' ') : 'Sin explicación detallada registrada para esta pregunta.'}
        </div>
      </div>

    </div>
  );
}

