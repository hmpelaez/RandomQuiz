import React, { useState, useEffect } from 'react';
import CyberHeader from './components/CyberHeader';
import ParserUploader from './components/ParserUploader';
import QuizEngine from './components/QuizEngine';
import { soundFx } from './utils/sound';

export default function App() {
  const [mode, setMode] = useState('upload'); // 'upload' | 'quiz'
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [accentTheme, setAccentTheme] = useState('cyan');

  // 1. Frenar el Temporizador cuando isFinished sea true
  useEffect(() => {
    let timer;
    if (mode === 'quiz' && !isFinished) {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, isFinished]);

  // Compute live score dynamically from state for global reactivity
  const score = userAnswers.reduce(
    (acc, ans, idx) => {
      if (ans === null) return acc;
      if (ans === questions[idx]?.correctAnswer) acc.correct++;
      else acc.incorrect++;
      return acc;
    },
    { correct: 0, incorrect: 0 }
  );

  const handleExamParsed = (parsedQuestions) => {
    setQuestions(parsedQuestions);
    setUserAnswers(Array(parsedQuestions.length).fill(null));
    setCurrentIndex(0);
    setElapsedTime(0);
    setIsFinished(false);
    setMode('quiz');
  };

  // 2. Lógica del Botón Reiniciar
  const handleResetExam = () => {
    soundFx.playClick();
    setIsFinished(false); // Cambia el estado a false para devolver al usuario a la vista principal
    setCurrentIndex(0);
    setUserAnswers(Array(questions.length).fill(null));
    setElapsedTime(0);
  };

  const handleLoadNew = () => {
    soundFx.playClick();
    setQuestions([]);
    setUserAnswers([]);
    setCurrentIndex(0);
    setIsFinished(false);
    setMode('upload');
  };

  return (
    <div className="min-h-screen bg-cyber-950 text-slate-100 flex flex-col font-sans cyber-scanline selection:bg-neon-cyan selection:text-black">
      
      {/* Cybersecurity Top Header */}
      <CyberHeader
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onResetExam={handleResetExam}
        onLoadNew={handleLoadNew}
        questionsCount={questions.length}
        currentIndex={currentIndex}
        score={score}
        elapsedTime={elapsedTime}
        mode={mode}
        accentTheme={accentTheme}
        setAccentTheme={setAccentTheme}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        {mode === 'upload' ? (
          <ParserUploader onExamParsed={handleExamParsed} accentTheme={accentTheme} />
        ) : (
          <QuizEngine
            questions={questions}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            userAnswers={userAnswers}
            setUserAnswers={setUserAnswers}
            isFinished={isFinished}
            setIsFinished={setIsFinished}
            onReset={handleResetExam}
            onLoadNew={handleLoadNew}
            elapsedTime={elapsedTime}
            accentTheme={accentTheme}
          />
        )}
      </main>

      <footer className="border-t border-cyber-border py-4 px-6 bg-cyber-950/90 text-center font-mono text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span>CYBER_TERMINAL_Q&A</span>
        </div>
        <span>SECURITY COMPLIANCE: ENFORCED</span>
      </footer>

    </div>
  );
}
