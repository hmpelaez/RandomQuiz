import React from 'react';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

export default function ExplanationPanel({
  selectedOption,
  correctAnswer,
  explanation
}) {
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
      </div>

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
