import React from 'react';
import { HelpCircle, Check, X, Terminal, Cpu } from 'lucide-react';
import { soundFx } from '../utils/sound';

export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedOption,
  onSelectOption
}) {
  const isAnswered = selectedOption !== null;

  const handleOptionClick = (letter) => {
    if (isAnswered) return; // Prevent changing answer after evaluation

    const isCorrect = letter === question.correctAnswer;
    if (isCorrect) {
      soundFx.playCorrect();
    } else {
      soundFx.playWrong();
    }

    onSelectOption(letter);
  };

  return (
    <div className="bg-cyber-900/90 border border-cyber-border rounded-xl p-6 md:p-8 shadow-cyber-card relative overflow-hidden transition-all duration-300">
      
      {/* Background Cyber Accent Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header & Badges */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-cyber-border">
        <div className="flex items-center space-x-2 font-mono">
          <span className="px-2.5 py-1 rounded bg-cyan-950/80 text-neon-cyan border border-neon-cyan/40 text-xs font-bold shadow-neon-cyan">
            PREGUNTA #{currentIndex + 1}
          </span>
          <span className="text-slate-500 text-xs">/ {totalQuestions}</span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-neon-magenta" />
        </div>
      </div>

      {/* Question Prompt Enunciado */}
      <div className="mb-8 space-y-3">
        <div className="flex items-start space-x-3">
          <Terminal className="w-5 h-5 text-neon-cyan shrink-0 mt-1" />
          <h2 className="font-mono text-base md:text-lg text-slate-100 font-semibold leading-relaxed tracking-wide">
            {question.question}
          </h2>
        </div>
      </div>

      {/* Options List (A, B, C, D) */}
      <div className="grid grid-cols-1 gap-3.5">
        {question.options.map((opt) => {
          const isSelected = selectedOption === opt.letter;
          const isCorrect = opt.letter === question.correctAnswer;
          
          // Dynamic CSS styles based on evaluation state
          let optionStyles = "border-cyber-border bg-cyber-950/60 text-slate-200 hover:border-neon-cyan hover:bg-cyan-950/20 hover:shadow-neon-cyan hover:text-white";

          if (isAnswered) {
            if (isCorrect) {
              optionStyles = "border-neon-green bg-emerald-950/50 text-neon-green shadow-neon-green font-semibold";
            } else if (isSelected && !isCorrect) {
              optionStyles = "border-neon-red bg-rose-950/50 text-neon-red shadow-neon-red font-semibold";
            } else {
              optionStyles = "border-slate-800 bg-cyber-950/30 text-slate-500 opacity-60";
            }
          }

          return (
            <button
              key={opt.letter}
              onClick={() => handleOptionClick(opt.letter)}
              disabled={isAnswered}
              className={`w-full text-left p-4 rounded-xl border font-mono text-sm transition-all duration-200 flex items-center justify-between group ${optionStyles} ${
                !isAnswered ? 'cursor-pointer transform hover:scale-[1.01]' : 'cursor-default'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                {/* Letter Badge */}
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                  isAnswered && isCorrect
                    ? 'border-neon-green bg-neon-green text-black'
                    : isAnswered && isSelected && !isCorrect
                    ? 'border-neon-red bg-neon-red text-black'
                    : 'border-cyber-border bg-cyber-900 text-slate-300 group-hover:border-neon-cyan group-hover:text-neon-cyan'
                }`}>
                  {opt.letter}
                </div>

                {/* Option Text */}
                <span className="leading-snug">{opt.text}</span>
              </div>

              {/* Status Icons on Answered */}
              {isAnswered && (
                <div className="shrink-0 ml-2">
                  {isCorrect && (
                    <div className="p-1 rounded bg-neon-green text-black">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                  {isSelected && !isCorrect && (
                    <div className="p-1 rounded bg-neon-red text-black">
                      <X className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
