import React, { useEffect, useState } from 'react';
import { RotateCcw, Upload, CheckCircle2, XCircle, ChevronDown, ChevronUp, ShieldCheck, ShieldAlert, Sparkles, BarChart2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../utils/sound';

export default function StatsPanel({
  questions,
  userAnswers,
  elapsedTime,
  onResetExam,
  onLoadNew,
  onRetryIncorrect
}) {
  const [filter, setFilter] = useState('all'); // 'all', 'incorrect', 'correct'
  const [expandedId, setExpandedId] = useState(null);

  const totalQuestions = questions.length;
  
  let correctCount = 0;
  let incorrectCount = 0;

  questions.forEach((q, idx) => {
    const userAns = userAnswers[idx];
    if (userAns === q.correctAnswer) {
      correctCount++;
    } else if (userAns) {
      incorrectCount++;
    }
  });

  const percentage = Math.round((correctCount / totalQuestions) * 100) || 0;
  const isPassed = percentage >= 70;

  useEffect(() => {
    soundFx.playFinish();
    if (isPassed) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }
  }, [isPassed]);

  const filteredQuestions = questions.map((q, idx) => ({
    ...q,
    originalIndex: idx,
    userAnswer: userAnswers[idx]
  })).filter(q => {
    if (filter === 'correct') return q.userAnswer === q.correctAnswer;
    if (filter === 'incorrect') return q.userAnswer && q.userAnswer !== q.correctAnswer;
    return true;
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Top Victory / Score Summary Card */}
      <div className={`border rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-cyber-card ${
        isPassed
          ? 'border-neon-green/60 bg-emerald-950/30 shadow-neon-green'
          : 'border-neon-red/60 bg-rose-950/30 shadow-neon-red'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center space-x-5">
            <div className={`p-4 rounded-2xl border ${
              isPassed 
                ? 'bg-emerald-950 text-neon-green border-neon-green/50 shadow-neon-green'
                : 'bg-rose-950 text-neon-red border-neon-red/50 shadow-neon-red'
            }`}>
              {isPassed ? <ShieldCheck className="w-12 h-12" /> : <ShieldAlert className="w-12 h-12" />}
            </div>
            <div>
              <span className={`text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border ${
                isPassed ? 'bg-emerald-950 text-neon-green border-neon-green/40' : 'bg-rose-950 text-neon-red border-neon-red/40'
              }`}>
                {isPassed ? 'EVALUACIÓN: APROBADO' : 'EVALUACIÓN: NO APROBADO'}
              </span>
              <h1 className="text-3xl font-mono font-bold text-slate-100 mt-2">
                PUNTAJE FINAL: <span className={isPassed ? 'text-neon-green text-glow-green' : 'text-neon-red text-glow-red'}>{percentage}%</span>
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Tiempo de ejecución: <strong className="text-neon-cyan">{formatTime(elapsedTime)}</strong> | Requerido para aprobar: 70%
              </p>
            </div>
          </div>

          {/* Quick Metrics Pills */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto font-mono text-center">
            <div className="bg-cyber-950/80 border border-cyber-border rounded-xl p-3">
              <span className="text-xs text-slate-400 block">CORRECTAS</span>
              <span className="text-xl font-bold text-neon-green">{correctCount}</span>
            </div>
            <div className="bg-cyber-950/80 border border-cyber-border rounded-xl p-3">
              <span className="text-xs text-slate-400 block">INCORRECTAS</span>
              <span className="text-xl font-bold text-neon-red">{incorrectCount}</span>
            </div>
            <div className="bg-cyber-950/80 border border-cyber-border rounded-xl p-3">
              <span className="text-xs text-slate-400 block">TOTAL</span>
              <span className="text-xl font-bold text-neon-cyan">{totalQuestions}</span>
            </div>
          </div>

        </div>

        {/* CTAs */}
        <div className="mt-6 pt-6 border-t border-cyber-border/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={onResetExam}
              className="px-4 py-2.5 rounded-xl border border-neon-cyan/40 bg-cyan-950/30 text-neon-cyan hover:bg-cyan-900/50 font-mono text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REINICIAR TODO EL EXAMEN</span>
            </button>

            {incorrectCount > 0 && (
              <button
                onClick={onRetryIncorrect}
                className="px-4 py-2.5 rounded-xl border border-neon-magenta/40 bg-rose-950/30 text-neon-magenta hover:bg-rose-900/50 font-mono text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>REINTENTAR SOLO INCORRECTAS ({incorrectCount})</span>
              </button>
            )}
          </div>

          <button
            onClick={onLoadNew}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-cyber-900 text-slate-300 hover:border-slate-500 font-mono text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>CARGAR OTRO EXAMEN</span>
          </button>
        </div>
      </div>

      {/* Review Section con Tipografía Limpia (font-sans, leading-relaxed, padding adecuado) */}
      <div className="bg-cyber-900/80 border border-cyber-border rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyber-border pb-4">
          <div className="flex items-center space-x-2 font-mono">
            <BarChart2 className="w-5 h-5 text-neon-cyan" />
            <h2 className="text-lg font-bold text-slate-100">REVISIÓN DETALLADA DE PREGUNTAS</h2>
          </div>

          {/* Filter Pills - Estilo Neon Glow */}
          <div className="flex items-center space-x-2 font-mono text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded transition-all duration-200 cursor-pointer active:scale-95 ${
                filter === 'all'
                  ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.2)] font-bold tracking-wide'
                  : 'bg-cyber-950 text-slate-400 border border-cyber-border hover:border-neon-cyan/50 hover:text-neon-cyan hover:bg-neon-cyan/5'
              }`}
            >
              Todas ({totalQuestions})
            </button>
            
            <button
              onClick={() => setFilter('incorrect')}
              className={`px-3 py-1.5 rounded transition-all duration-200 cursor-pointer active:scale-95 ${
                filter === 'incorrect'
                  ? 'bg-neon-red/10 text-neon-red border border-neon-red shadow-[0_0_10px_rgba(255,0,0,0.2)] font-bold tracking-wide'
                  : 'bg-cyber-950 text-slate-400 border border-cyber-border hover:border-neon-red/50 hover:text-neon-red hover:bg-neon-red/5'
              }`}
            >
              Incorrectas ({incorrectCount})
            </button>
            
            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1.5 rounded transition-all duration-200 cursor-pointer active:scale-95 ${
                filter === 'correct'
                  ? 'bg-neon-green/10 text-neon-green border border-neon-green shadow-[0_0_10px_rgba(0,255,0,0.2)] font-bold tracking-wide'
                  : 'bg-cyber-950 text-slate-400 border border-cyber-border hover:border-neon-green/50 hover:text-neon-green hover:bg-neon-green/5'
              }`}
            >
              Correctas ({correctCount})
            </button>
          </div>
        </div>

        {/* Lista de Preguntas con Formato de Texto Mejorado */}
        <div className="space-y-3">
          {filteredQuestions.map((q) => {
            const isCorrect = q.userAnswer === q.correctAnswer;
            const isExpanded = expandedId === q.originalIndex;

            return (
              <div
                key={q.originalIndex}
                className={`border rounded-xl font-sans transition-all overflow-hidden ${
                  isCorrect ? 'border-emerald-950 bg-cyber-950/60' : 'border-rose-950 bg-cyber-950/60'
                }`}
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : q.originalIndex)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-cyber-900/60 font-mono"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded ${
                      isCorrect ? 'bg-emerald-950 text-neon-green' : 'bg-rose-950 text-neon-red'
                    }`}>
                      {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-bold text-slate-300">
                      #{q.originalIndex + 1}. {q.question.substring(0, 75)}{q.question.length > 75 ? '...' : ''}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs shrink-0 font-mono">
                    <span className="text-slate-400">
                      Tu Rpta: <strong className={isCorrect ? 'text-neon-green' : 'text-neon-red'}>{q.userAnswer || 'N/A'}</strong> | Correcta: <strong className="text-neon-green">{q.correctAnswer}</strong>
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Detalle extendido con legibilidad optimizada */}
                {isExpanded && (
                  <div className="p-5 border-t border-cyber-border bg-cyber-900/40 text-sm space-y-4 font-sans">
                    {/* Texto de Pregunta limpia con interlineado */}
                    <p className="text-gray-200 font-semibold text-base leading-relaxed">
                      {q.question}
                    </p>

                    {/* Opciones con padding p-3.5 adecuado */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {q.options.map((opt) => (
                        <div
                          key={opt.letter}
                          className={`p-3.5 rounded-lg border flex items-center space-x-2.5 transition-all ${
                            opt.letter === q.correctAnswer
                              ? 'border-neon-green/50 bg-emerald-950/40 text-neon-green font-bold shadow-neon-green'
                              : opt.letter === q.userAnswer
                              ? 'border-neon-red/50 bg-rose-950/40 text-neon-red font-bold shadow-neon-red'
                              : 'border-cyber-border text-slate-400 bg-cyber-950/50'
                          }`}
                        >
                          <span className="font-mono font-bold text-slate-200 border border-cyber-border px-2 py-0.5 rounded bg-cyber-900">
                            {opt.letter}
                          </span>
                          <span className="leading-snug">{opt.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Explicación Técnica destacada */}
                    <div className="bg-cyber-950 p-4 rounded-lg border border-cyber-border text-slate-300 text-xs md:text-sm leading-relaxed border-l-4 border-neon-cyan text-justify">
                      <span className="text-neon-cyan font-mono font-bold block mb-1">
                        EXPLICACIÓN TÉCNICA:
                      </span>
                      <p className="text-slate-300 leading-relaxed font-sans">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
