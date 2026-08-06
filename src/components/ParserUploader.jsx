import React, { useState } from 'react';
import { Upload, FileText, Play, CheckCircle2, AlertTriangle, Terminal, Zap, Shuffle, Layers3 } from 'lucide-react';
import { parseQnAFormat, SAMPLE_EXAMS } from '../utils/parser';
import { soundFx } from '../utils/sound';

// Algoritmo de Mezcla Aleatoria Fisher-Yates
function fisherYatesShuffle(array) {
  const shuffled = [...array];
  let currentIndex = shuffled.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
  }
  return shuffled;
}

export default function ParserUploader({ onExamParsed }) {
  // Modo de operación: 'standard' (un solo archivo / texto) | 'random' (multi-archivo aleatorio max 125)
  const [opMode, setOpMode] = useState('standard');

  // Estado para Modo Estándar
  const [standardParseResult, setStandardParseResult] = useState({ success: false, questions: [], error: null });

  // Estado para Modo Simulador Aleatorio Multi-archivo
  const [finalQuizQuestions, setFinalQuizQuestions] = useState([]);
  const [multiMetrics, setMultiMetrics] = useState({
    processedFiles: 0,
    totalBankCount: 0,
    finalSelectedCount: 0,
    error: null
  });

  const [dragActive, setDragActive] = useState(false);

  // MANEJADOR MODO ESTÁNDAR (Carga rápida examen ejemplo)
  const handleLoadSample = (sampleText) => {
    soundFx.playClick();
    setStandardParseResult(parseQnAFormat(sampleText));
  };

  // MANEJADOR MODO ESTÁNDAR (Un solo archivo)
  const handleSingleFileUpload = (file) => {
    if (!file) return;
    soundFx.playClick();
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setStandardParseResult(parseQnAFormat(content));
    };
    reader.onerror = () => {
      setStandardParseResult({ success: false, questions: [], error: 'Error al leer el archivo.' });
    };
    reader.readAsText(file);
  };

  // MANEJADOR MODO SIMULADOR ALEATORIO (Multi-archivo con Límite de 125)
  const handleMultiFilesProcess = async (filesList) => {
    const filesArray = Array.from(filesList);
    if (filesArray.length === 0) return;

    soundFx.playClick();

    // Leer el texto de todos los archivos en paralelo
    const fileContents = await Promise.all(
      filesArray.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result || '');
          reader.onerror = () => resolve('');
          reader.readAsText(file);
        });
      })
    );

    // Extraer preguntas de cada archivo
    let globalBank = [];
    let validFilesCount = 0;

    fileContents.forEach(text => {
      const parsed = parseQnAFormat(text);
      if (parsed.success && parsed.questions.length > 0) {
        validFilesCount++;
        globalBank = globalBank.concat(parsed.questions);
      }
    });

    if (globalBank.length === 0) {
      setMultiMetrics({
        processedFiles: filesArray.length,
        totalBankCount: 0,
        finalSelectedCount: 0,
        error: 'No se encontraron preguntas válidas en los archivos seleccionados.'
      });
      setFinalQuizQuestions([]);
      return;
    }

    // 1. Mezcla aleatoria (Fisher-Yates)
    const shuffledBank = fisherYatesShuffle(globalBank);

    // 2. Límite máximo de 125 preguntas
    const MAX_QUESTIONS = 125;
    const selectedQuestions = shuffledBank.slice(0, MAX_QUESTIONS);

    // 3. Re-indexación dinámica correlativa (1 a N)
    const reindexedQuestions = selectedQuestions.map((q, idx) => ({
      ...q,
      id: idx + 1,
      number: idx + 1
    }));

    // 4. Actualización de métricas
    setMultiMetrics({
      processedFiles: validFilesCount,
      totalBankCount: globalBank.length,
      finalSelectedCount: reindexedQuestions.length,
      error: null
    });

    setFinalQuizQuestions(reindexedQuestions);
  };

  // Dropzone universal según el modo activo
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (opMode === 'standard') {
        handleSingleFileUpload(e.dataTransfer.files[0]);
      } else {
        handleMultiFilesProcess(e.dataTransfer.files);
      }
    }
  };

  // Iniciar el examen con las preguntas procesadas según el modo seleccionado
  const handleStartQuiz = () => {
    if (opMode === 'standard') {
      if (standardParseResult.success && standardParseResult.questions.length > 0) {
        soundFx.playCorrect();
        onExamParsed(standardParseResult.questions);
      }
    } else {
      if (finalQuizQuestions.length > 0) {
        soundFx.playCorrect();
        onExamParsed(finalQuizQuestions);
      }
    }
  };

  const isReadyToStart = opMode === 'standard' 
    ? (standardParseResult.success && standardParseResult.questions.length > 0)
    : (finalQuizQuestions.length > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-mono">
      
      {/* Intro Header Card */}
      <div className="bg-cyber-900/90 border border-cyber-border rounded-xl p-6 shadow-cyber-card relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 text-slate-800 opacity-20 pointer-events-none">
          <Terminal className="w-32 h-32 text-neon-cyan" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2 text-neon-cyan text-sm">
            <Zap className="w-4 h-4 text-neon-yellow" />
            <span>MÓDULO DE INGESTA Y EXTRACCIÓN DE DATOS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
            SELECCIONA EL MODO DE OPERACIÓN
          </h1>
          <p className="text-slate-400 text-sm max-w-3xl leading-relaxed font-sans">
            Elige entre procesar un examen único o generar un simulador aleatorio combinando múltiples archivos con límite automático de 125 preguntas.
          </p>
        </div>
      </div>

      {/* Tarjetas de Selección de Modo de Operación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Modo Estándar */}
        <button
          type="button"
          onClick={() => { soundFx.playClick(); setOpMode('standard'); }}
          className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
            opMode === 'standard'
              ? 'border-neon-cyan bg-cyan-950/40 text-slate-100 shadow-neon-cyan ring-1 ring-neon-cyan'
              : 'border-cyber-border bg-cyber-900/50 text-slate-400 hover:border-slate-600 hover:bg-cyber-900'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-lg border ${opMode === 'standard' ? 'bg-cyan-950 text-neon-cyan border-neon-cyan/50' : 'bg-cyber-950 text-slate-500 border-cyber-border'}`}>
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">MODO ESTÁNDAR</h3>
                <span className="text-[10px] text-neon-cyan">Procesamiento Secuencial</span>
              </div>
            </div>
            {opMode === 'standard' && (
              <span className="text-[10px] bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 px-2 py-0.5 rounded font-bold">
                ACTIVO
              </span>
            )}
          </div>
          <p className="text-xs font-sans text-slate-400 leading-relaxed">
            Carga un solo archivo plano. Ideal para practicar exámenes.
          </p>
        </button>

        {/* Modo Simulador Aleatorio Multi-archivo */}
        <button
          type="button"
          onClick={() => { soundFx.playClick(); setOpMode('random'); }}
          className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
            opMode === 'random'
              ? 'border-neon-magenta bg-rose-950/30 text-slate-100 shadow-neon-magenta ring-1 ring-neon-magenta'
              : 'border-cyber-border bg-cyber-900/50 text-slate-400 hover:border-slate-600 hover:bg-cyber-900'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-lg border ${opMode === 'random' ? 'bg-rose-950 text-neon-magenta border-neon-magenta/50' : 'bg-cyber-950 text-slate-500 border-cyber-border'}`}>
                <Shuffle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">SIMULADOR ALEATORIO (MULTI-ARCHIVO)</h3>
                <span className="text-[10px] text-neon-magenta">Mezcla Fisher-Yates | Máx. 125 Preguntas</span>
              </div>
            </div>
            {opMode === 'random' && (
              <span className="text-[10px] bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/40 px-2 py-0.5 rounded font-bold">
                ACTIVO
              </span>
            )}
          </div>
          <p className="text-xs font-sans text-slate-400 leading-relaxed">
            Carga múltiples archivos a la vez. El sistema extrae el banco completo, lo mezcla aleatoriamente.
          </p>
        </button>

      </div>

      {/* Input Grid / Container según Modo Seleccionado */}
      {opMode === 'standard' ? (
        /* MODO ESTÁNDAR: Contenedor centrado max-w-2xl */
        <div className="max-w-2xl mx-auto w-full flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-400 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-neon-cyan" />
              <span>SUBIR ARCHIVO</span>
            </label>
            {standardParseResult.success && (
              <span className="text-neon-green text-xs font-bold font-mono">
                {standardParseResult.questions.length} preguntas listadas
              </span>
            )}
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${
              dragActive
                ? 'border-neon-cyan bg-cyan-950/40 shadow-neon-cyan'
                : 'border-cyber-border bg-cyber-900/40 hover:border-slate-600 hover:bg-cyber-900'
            }`}
          >
            <div className="p-4 bg-cyber-950 rounded-full border border-neon-cyan/40 text-neon-cyan mb-3">
              <FileText className="w-10 h-10 animate-pulse" />
            </div>
            
            <p className="text-base text-slate-200 font-semibold mb-1">
              Arrastra tu archivo aquí
            </p>
            <p className="text-xs text-slate-500 mb-5 font-sans max-w-sm">
              Soporta archivos de texto plano (.txt o .md) con formato QUESTIONS y ANSWERS.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <label className="px-5 py-2.5 rounded-lg border border-neon-cyan/40 text-neon-cyan bg-cyan-950/30 hover:bg-cyan-900/50 text-xs font-semibold transition-all cursor-pointer shadow-neon-cyan/20">
                <span>Seleccionar Archivo</span>
                <input
                  type="file"
                  accept=".txt,.md,.raw"
                  className="hidden"
                  onChange={(e) => e.target.files && handleSingleFileUpload(e.target.files[0])}
                />
              </label>

              <button
                type="button"
                onClick={() => handleLoadSample(SAMPLE_EXAMS[0].text)}
                className="px-4 py-2.5 rounded-lg border border-cyber-border text-slate-300 bg-cyber-900 hover:border-neon-cyan/50 hover:text-neon-cyan text-xs font-semibold transition-all cursor-pointer"
              >
                Examen de Prueba (CEH v12)
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MODO ALEATORIO MULTI-ARCHIVO: Grid de 3 columnas (Dropzone + Resumen Ingesta) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col">
            <label className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-neon-magenta" />
              <span>SUBIR MÚLTIPLES ARCHIVOS</span>
            </label>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`flex-1 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                dragActive
                  ? 'border-neon-magenta bg-rose-950/40 shadow-neon-magenta'
                  : 'border-cyber-border bg-cyber-900/40 hover:border-slate-600 hover:bg-cyber-900'
              }`}
            >
              <div className="p-3 bg-cyber-950 rounded-full border border-neon-magenta/40 text-neon-magenta mb-3">
                <Layers3 className="w-8 h-8 animate-pulse" />
              </div>
              
              <p className="text-sm text-slate-200 font-semibold mb-1">
                Arrastra múltiples archivos aquí
              </p>
              <p className="text-xs text-slate-500 mb-4 font-sans">
                Selecciona varios archivos a la vez
              </p>

              <label className="px-4 py-2 rounded border border-neon-magenta/40 text-neon-magenta bg-rose-950/30 hover:bg-rose-900/50 text-xs font-semibold transition-all cursor-pointer">
                <span>Seleccionar Varios Archivos</span>
                <input
                  type="file"
                  accept=".txt,.md,.raw"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleMultiFilesProcess(e.target.files)}
                />
              </label>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col">
            <div className="flex flex-col h-full justify-between bg-cyber-950 border border-cyber-border rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-2 text-neon-magenta text-xs font-bold border-b border-cyber-border pb-3">
                <Shuffle className="w-4 h-4" />
                <span>RESUMEN DE INGESTA ALEATORIA MULTI-ARCHIVO</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="bg-cyber-900 border border-cyber-border rounded-lg p-3">
                  <span className="text-[11px] text-slate-400 block mb-1">ARCHIVOS INGRESADOS</span>
                  <span className="text-xl font-bold text-slate-100">{multiMetrics.processedFiles}</span>
                </div>
                <div className="bg-cyber-900 border border-cyber-border rounded-lg p-3">
                  <span className="text-[11px] text-slate-400 block mb-1">BANCO GLOBAL EXTRAÍDO</span>
                  <span className="text-xl font-bold text-neon-cyan">{multiMetrics.totalBankCount}</span>
                </div>
                <div className="bg-cyber-900 border border-cyber-border rounded-lg p-3">
                  <span className="text-[11px] text-slate-400 block mb-1">SELECCIÓN (MÁX 125)</span>
                  <span className="text-xl font-bold text-neon-magenta">{multiMetrics.finalSelectedCount}</span>
                </div>
              </div>

              <div className="bg-cyber-900/60 border border-cyber-border rounded-lg p-4 text-xs text-slate-300 space-y-2 font-sans leading-relaxed">
                <span className="text-neon-cyan font-mono font-bold block">PROCESO APLICADO:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Lectura paralela e ingesta mediante parser regex de todos los archivos.</li>
                  <li>Mezcla aleatoria del banco global con algoritmo Fisher-Yates.</li>
                  <li>Recorte automático a un tope máximo de 125 preguntas seleccionadas.</li>
                  <li>Re-indexación correlativa de preguntas.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESTADO DE LA EXTRACCIÓN DE DATOS */}
      <div className="bg-cyber-900/80 border border-cyber-border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg border ${
            isReadyToStart
              ? 'bg-emerald-950/40 border-neon-green/40 text-neon-green'
              : 'bg-rose-950/40 border-neon-red/40 text-neon-red'
          }`}>
            {isReadyToStart ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-bold">
                ESTADO DE LA EXTRACCIÓN DE DATOS:
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                isReadyToStart
                  ? 'bg-emerald-950 text-neon-green border border-neon-green/30'
                  : 'bg-rose-950 text-neon-red border border-neon-red/30'
              }`}>
                {isReadyToStart ? 'EXTRACCIÓN EXITOSA' : 'PENDIENTE / SIN DATOS'}
              </span>
            </div>

            {opMode === 'standard' ? (
              isReadyToStart ? (
                <p className="text-xs text-slate-400 mt-1">
                  Se identificaron <strong className="text-neon-cyan">{standardParseResult.questions.length} preguntas</strong> con sus correspondientes opciones y explicaciones.
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">
                  {standardParseResult.error || 'Selecciona o arrastra un archivo plano para cargar el examen.'}
                </p>
              )
            ) : (
              multiMetrics.finalSelectedCount > 0 ? (
                <p className="text-xs text-slate-400 mt-1">
                  Archivos combinados: <strong className="text-neon-magenta">{multiMetrics.processedFiles}</strong> | Banco total: <strong className="text-neon-cyan">{multiMetrics.totalBankCount} preguntas</strong> | Preguntas seleccionadas para el simulador: <strong className="text-neon-green">{multiMetrics.finalSelectedCount} (Máx. 125)</strong>
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">
                  {multiMetrics.error || 'Selecciona o arrastra múltiples archivos para generar la mezcla aleatoria.'}
                </p>
              )
            )}
          </div>
        </div>

        {/* Botón Iniciar Simulador */}
        <button
          onClick={handleStartQuiz}
          disabled={!isReadyToStart}
          className={`px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all cyber-corners ${
            isReadyToStart
              ? opMode === 'standard'
                ? 'bg-neon-cyan text-black hover:bg-cyan-300 shadow-neon-cyan hover:scale-[1.02] cursor-pointer'
                : 'bg-neon-magenta text-black hover:bg-rose-400 shadow-neon-magenta hover:scale-[1.02] cursor-pointer'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed disabled:border-slate-700'
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          <span>{opMode === 'standard' ? 'INICIAR SIMULADOR ESTÁNDAR' : 'INICIAR SIMULADOR ALEATORIO'}</span>
        </button>
      </div>

    </div>
  );
}
