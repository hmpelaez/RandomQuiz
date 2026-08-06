import React, { useState } from 'react';
import QuestionCard from './QuestionCard';
import ExplanationPanel from './ExplanationPanel';
import StatsPanel from './StatsPanel';
import { ChevronLeft, ChevronRight, ListFilter } from 'lucide-react';
import { soundFx } from '../utils/sound';

export default function QuizEngine({
  questions,
  currentIndex,
  setCurrentIndex,
  userAnswers,
  setUserAnswers,
  isFinished,
  setIsFinished,
  onReset,
  onLoadNew,
  elapsedTime,
  accentTheme = 'cyan'
}) {
  const [showNavGrid, setShowNavGrid] = useState(false);

  const currentQuestion = questions[currentIndex];
  const selectedOption = userAnswers[currentIndex] ?? null;
  const isAnswered = selectedOption !== null;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelectOption = (letter) => {
    const updated = [...userAnswers];
    updated[currentIndex] = letter;
    setUserAnswers(updated);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setIsFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      soundFx.playClick();
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRetryIncorrect = () => {
    const filteredAnswers = userAnswers.map((ans, idx) => 
      ans === questions[idx].correctAnswer ? ans : null
    );
    setUserAnswers(filteredAnswers);
    setIsFinished(false);
    
    const firstUnanswered = filteredAnswers.findIndex(a => a === null);
    setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
  };

  if (isFinished) {
    return (
      <StatsPanel
        questions={questions}
        userAnswers={userAnswers}
        elapsedTime={elapsedTime}
        onResetExam={onReset}
        onLoadNew={onLoadNew}
        onRetryIncorrect={handleRetryIncorrect}
        accentTheme={accentTheme}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Progress Neon Bar & Nav Bar Header */}
      <div className="bg-cyber-900/80 border border-cyber-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between font-mono text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">PROGRESO DEL SIMULADOR:</span>
            <span className="text-neon-cyan font-bold">
              {Math.round(((currentIndex + 1) / questions.length) * 100)}%
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNavGrid(!showNavGrid)}
              className="px-2.5 py-1 rounded border border-cyber-border bg-cyber-950 text-slate-300 hover:border-neon-cyan hover:text-neon-cyan transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Navegador de Preguntas</span>
            </button>

            <button
              onClick={() => setIsFinished(true)}
              className="px-3 py-1 rounded bg-rose-950/60 border border-neon-red/40 text-neon-red hover:bg-rose-900/60 font-bold transition-all cursor-pointer"
            >
              Finalizar Examen
            </button>
          </div>
        </div>

        {/* Neon Cyan Bar */}
        <div className="w-full bg-cyber-950 h-2 rounded-full overflow-hidden border border-cyber-border">
          <div
            className="bg-neon-cyan h-full transition-all duration-300 shadow-neon-cyan"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Quick Navigator Grid Dropdown */}
        {showNavGrid && (
          <div className="pt-3 border-t border-cyber-border grid grid-cols-5 sm:grid-cols-10 gap-2 font-mono text-xs">
            {questions.map((q, idx) => {
              const ans = userAnswers[idx];
              const isCurrent = idx === currentIndex;
              let bg = "bg-cyber-950 text-slate-400 border-cyber-border";

              if (ans !== null) {
                if (ans === q.correctAnswer) bg = "bg-emerald-950 text-neon-green border-neon-green/40";
                else bg = "bg-rose-950 text-neon-red border-neon-red/40";
              }

              if (isCurrent) bg += " ring-2 ring-neon-cyan shadow-neon-cyan font-bold";

              return (
                <button
                  key={idx}
                  onClick={() => {
                    soundFx.playClick();
                    setCurrentIndex(idx);
                    setShowNavGrid(false);
                  }}
                  className={`p-2 rounded border transition-all text-center ${bg}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Central Question Card */}
      <QuestionCard
        question={currentQuestion}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        selectedOption={selectedOption}
        onSelectOption={handleSelectOption}
      />

      {/* Learning Context Explanation Panel */}
      {isAnswered && (
        <ExplanationPanel
          selectedOption={selectedOption}
          correctAnswer={currentQuestion.correctAnswer}
          explanation={currentQuestion.explanation}
        />
      )}

      {/* NAVEGACIÓN LIBRE (DESBLOQUEADA): Sin restricciones condicionales para cambiar de pregunta libremente */}
      <div className="flex items-center justify-between font-mono text-xs">
        <button
          onClick={handlePrev}
          className="px-5 py-2.5 rounded-xl border border-neon-cyan bg-cyan-950/40 text-neon-cyan hover:bg-cyan-900/60 shadow-neon-cyan cursor-pointer font-bold flex items-center space-x-2 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        <button
          onClick={handleNext}
          className="px-5 py-2.5 rounded-xl border border-neon-cyan bg-cyan-950/40 text-neon-cyan hover:bg-cyan-900/60 shadow-neon-cyan cursor-pointer font-bold flex items-center space-x-2 transition-all"
        >
          <span>{isLastQuestion ? 'Resultados' : 'Siguiente'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}