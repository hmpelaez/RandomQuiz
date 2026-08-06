import React, { useEffect, useState } from 'react';
import {
  RotateCcw,
  Upload,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  BarChart2,
  Clock,
  Zap,
  Target,
  Search,
  Globe,
  Lock,
  Shield,
  Bug,
  Activity,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../utils/sound';
import { getThemeClasses } from '../utils/theme';

const DOMAIN_DEFINITIONS = [
  {
    id: 'recon',
    name: 'Reconnaissance & Scanning',
    shortName: 'Reconnaissance',
    icon: Search,
    color: 'text-cyan-400',
    barBg: 'bg-cyan-500',
    keywords: ['nmap', 'scan', 'recon', 'footprint', 'enum', 'osint', 'whois', 'shodan', 'ping', 'banner', 'zone transfer', 'reconnaissance', 'passive', 'active scanning']
  },
  {
    id: 'web',
    name: 'Web Application Security',
    shortName: 'Web Security',
    icon: Globe,
    color: 'text-amber-400',
    barBg: 'bg-amber-500',
    keywords: ['web', 'sql', 'xss', 'csrf', 'http', 'html', 'owasp', 'cookie', 'session', 'injection', 'dirbuster', 'burp', 'lfi', 'rfi', 'parameter']
  },
  {
    id: 'crypto',
    name: 'Cryptography & PKI',
    shortName: 'Cryptography',
    icon: Lock,
    color: 'text-purple-400',
    barBg: 'bg-purple-500',
    keywords: ['crypto', 'rsa', 'aes', 'hash', 'encrypt', 'cipher', 'des', 'sha', 'pki', 'ssl', 'tls', 'key', 'signature', 'md5', 'asymmetric', 'symmetric']
  },
  {
    id: 'protocols',
    name: 'Network Protocols & Infra',
    shortName: 'Network Protocols',
    icon: Shield,
    color: 'text-blue-400',
    barBg: 'bg-blue-500',
    keywords: ['tcp', 'udp', 'ip', 'arp', 'icmp', 'dns', 'dhcp', 'port', 'packet', 'wireshark', 'syn', 'handshake', 'ethernet', 'subnet', 'vlan', 'router', 'switch', 'protocol', 'network']
  },
  {
    id: 'malware',
    name: 'Malware & Threats',
    shortName: 'Malware',
    icon: Bug,
    color: 'text-rose-400',
    barBg: 'bg-rose-500',
    keywords: ['malware', 'trojan', 'virus', 'worm', 'ransomware', 'spyware', 'rootkit', 'botnet', 'payload', 'backdoor', 'keylogger', 'obfuscation']
  }
];

export default function StatsPanel({
  questions = [],
  userAnswers = [],
  elapsedTime = 0,
  onResetExam,
  onLoadNew,
  onRetryIncorrect,
  accentTheme = 'cyan'
}) {
  const [filter, setFilter] = useState('all'); // 'all', 'incorrect', 'correct'
  const [expandedId, setExpandedId] = useState(null);

  const theme = getThemeClasses(accentTheme);
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

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
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

  // Format MM:SS
  const formatMMSS = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const avgSecondsPerQ = totalQuestions > 0 ? (elapsedTime / totalQuestions).toFixed(1) : '0.0';

  // Domain Categorization & Analytics
  const domainStats = DOMAIN_DEFINITIONS.map((dom) => {
    const domQuestions = questions.filter((q, idx) => {
      if (q.domain && (q.domain.toLowerCase().includes(dom.id) || q.domain.toLowerCase().includes(dom.shortName.toLowerCase()))) {
        return true;
      }
      const text = `${q.question || ''} ${q.explanation || ''} ${(q.options || []).map(o => o.text).join(' ')}`.toLowerCase();
      
      let bestDomain = null;
      let maxMatches = 0;

      DOMAIN_DEFINITIONS.forEach(d => {
        let matches = 0;
        d.keywords.forEach(kw => {
          if (text.includes(kw)) matches++;
        });
        if (matches > maxMatches) {
          maxMatches = matches;
          bestDomain = d.id;
        }
      });

      const assignedId = bestDomain || DOMAIN_DEFINITIONS[idx % DOMAIN_DEFINITIONS.length].id;
      return assignedId === dom.id;
    });

    let domCorrect = 0;
    domQuestions.forEach((q) => {
      const originalIdx = questions.indexOf(q);
      if (userAnswers[originalIdx] === q.correctAnswer) {
        domCorrect++;
      }
    });

    const domTotal = domQuestions.length;
    const domAccuracy = domTotal > 0 ? Math.round((domCorrect / domTotal) * 100) : 0;

    return {
      ...dom,
      total: domTotal,
      correct: domCorrect,
      accuracy: domAccuracy
    };
  });

  const filteredQuestions = questions
    .map((q, idx) => ({
      ...q,
      originalIndex: idx,
      userAnswer: userAnswers[idx]
    }))
    .filter((q) => {
      if (filter === 'correct') return q.userAnswer === q.correctAnswer;
      if (filter === 'incorrect') return q.userAnswer && q.userAnswer !== q.correctAnswer;
      return true;
    });

  // SVG Circular Gauge Math
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      
      {/* Top CTA Bar */}
      <div className="bg-cyber-900/90 border border-cyber-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-cyber-card">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl border ${theme.bg} ${theme.border} ${theme.text}`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-mono font-bold text-slate-100 uppercase tracking-wider">
              PANEL DE RENDIMIENTO CYBER-BENTO
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Evaluación diagnóstica CEH v12 & Metadatos de desempeño
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={onResetExam}
            className={`px-3.5 py-2 rounded-xl border ${theme.border} ${theme.bg} ${theme.text} hover:brightness-125 font-bold flex items-center space-x-2 transition-all cursor-pointer`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REINICIAR EXAMEN</span>
          </button>

          {incorrectCount > 0 && (
            <button
              onClick={onRetryIncorrect}
              className="px-3.5 py-2 rounded-xl border border-neon-magenta/50 bg-rose-950/40 text-neon-magenta hover:bg-rose-900/60 font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-neon-magenta/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>REINTENTAR INCORRECTAS ({incorrectCount})</span>
            </button>
          )}

          <button
            onClick={onLoadNew}
            className="px-3.5 py-2 rounded-xl border border-slate-700 bg-cyber-950 text-slate-300 hover:border-slate-500 font-bold flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>CARGAR NUEVO</span>
          </button>
        </div>
      </div>

      {/* Cyber-Bento Grid Layout: 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: Span 2 / Featured - Exam Readiness Gauge */}
        <div className={`col-span-1 md:col-span-2 lg:col-span-2 border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-cyber-card transition-all ${
          isPassed
            ? 'border-neon-green/60 bg-emerald-950/20 shadow-neon-green/30'
            : 'border-neon-red/60 bg-rose-950/20 shadow-neon-red/30'
        }`}>
          <div className="flex items-center justify-between mb-4 border-b border-cyber-border/60 pb-3">
            <div className="flex items-center space-x-2 font-mono">
              {isPassed ? (
                <ShieldCheck className="w-5 h-5 text-neon-green" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-neon-red" />
              )}
              <span className="text-xs font-bold text-slate-300 tracking-wider">
                EXAM READINESS SCORE
              </span>
            </div>
            <span className={`text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
              isPassed
                ? 'bg-emerald-950 text-neon-green border-neon-green/50 shadow-neon-green/20'
                : 'bg-rose-950 text-neon-red border-neon-red/50 shadow-neon-red/20'
            }`}>
              {isPassed ? 'EVALUACIÓN: APROBADO' : 'EVALUACIÓN: REPROBADO'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-2">
            {/* SVG Circular Progress Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Track Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-cyber-900"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={isPassed ? '#00ff66' : '#ff0055'}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>
              {/* Inner Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono">
                <span className={`text-3xl font-extrabold ${
                  isPassed ? 'text-neon-green text-glow-green' : 'text-neon-red text-glow-red'
                }`}>
                  {percentage}%
                </span>
                <span className="text-[10px] text-slate-400 tracking-widest font-bold">
                  READINESS
                </span>
              </div>
            </div>

            {/* Recommendation Message */}
            <div className="space-y-3 font-sans max-w-xs text-center sm:text-left">
              <div className="font-mono text-xs text-slate-400">
                <span>UMBRAL DE APROBACIÓN: </span>
                <strong className="text-slate-200">70% MIN.</strong>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-cyber-950/80 p-3.5 rounded-xl border border-cyber-border/80">
                {isPassed
                  ? '¡LISTO PARA EL EXAMEN CEH! Dominio de conceptos de ciberseguridad demostrado. Mantén la práctica para perfeccionar la velocidad.'
                  : 'REQUIERE REFORZAMIENTO: El puntaje actual está por debajo del umbral mínimo del 70%. Revisa los dominios débiles y reintenta las preguntas incorrectas.'}
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: Span 1 - Timing & Speed Metrics */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1 bg-cyber-900/80 border border-cyber-border rounded-2xl p-5 flex flex-col justify-between shadow-cyber-card">
          <div className="flex items-center space-x-2 font-mono border-b border-cyber-border/60 pb-3 mb-3">
            <Clock className={`w-4 h-4 ${theme.text}`} />
            <span className="text-xs font-bold text-slate-300 tracking-wider">MÉTRICAS DE TIEMPO</span>
          </div>

          <div className="space-y-4 my-auto">
            <div>
              <span className="text-xs font-mono text-slate-400 block mb-1">TIEMPO TOTAL DE EJECUCIÓN</span>
              <div className="text-2xl font-mono font-extrabold text-neon-cyan tracking-tight">
                {formatMMSS(elapsedTime)}
              </div>
            </div>

            <div className="pt-2 border-t border-cyber-border/40">
              <div className="flex items-center justify-between font-mono text-xs mb-1">
                <span className="text-slate-400 font-sans">VELOCIDAD PROMEDIO:</span>
                <span className="text-slate-200 font-bold">{avgSecondsPerQ}s / preg</span>
              </div>
              <div className="w-full bg-cyber-950 h-1.5 rounded-full overflow-hidden border border-cyber-border">
                <div
                  className={`h-full ${parseFloat(avgSecondsPerQ) < 60 ? 'bg-neon-green' : 'bg-amber-400'}`}
                  style={{ width: `${Math.min(100, Math.max(10, (120 - parseFloat(avgSecondsPerQ)) / 120 * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-cyber-border/40 flex items-center space-x-1.5 font-mono text-[11px] text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {parseFloat(avgSecondsPerQ) < 45
                ? 'Ritmo Excelente (<45s/preg)'
                : parseFloat(avgSecondsPerQ) < 90
                ? 'Ritmo Adecuado (<90s/preg)'
                : 'Ritmo Lento (>90s/preg)'}
            </span>
          </div>
        </div>

        {/* CARD 3: Span 1 - Accuracy & Streak Card */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1 bg-cyber-900/80 border border-cyber-border rounded-2xl p-5 flex flex-col justify-between shadow-cyber-card">
          <div className="flex items-center space-x-2 font-mono border-b border-cyber-border/60 pb-3 mb-3">
            <Target className="w-4 h-4 text-neon-green" />
            <span className="text-xs font-bold text-slate-300 tracking-wider">PRECISIÓN Y CONTEO</span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto">
            <div className="bg-cyber-950 p-3 rounded-xl border border-emerald-900/40 text-center font-mono">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-neon-green" />
                <span className="text-[10px] text-slate-400">CORRECTAS</span>
              </div>
              <span className="text-xl font-extrabold text-neon-green">{correctCount}</span>
            </div>

            <div className="bg-cyber-950 p-3 rounded-xl border border-rose-900/40 text-center font-mono">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <XCircle className="w-3.5 h-3.5 text-neon-red" />
                <span className="text-[10px] text-slate-400">INCORRECTAS</span>
              </div>
              <span className="text-xl font-extrabold text-neon-red">{incorrectCount}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-cyber-border/40 font-mono">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">TASA DE ÉXITO:</span>
              <span className={`font-bold ${isPassed ? 'text-neon-green' : 'text-neon-red'}`}>
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-cyber-950 h-2 rounded-full overflow-hidden border border-cyber-border flex">
              <div
                className="bg-neon-green h-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
              <div
                className="bg-neon-red h-full transition-all duration-500"
                style={{ width: `${100 - percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* CARD 4: Span 4 / Full width - CEH Domain Breakdown */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-cyber-900/80 border border-cyber-border rounded-2xl p-6 shadow-cyber-card space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <div className="flex items-center space-x-2 font-mono">
              <Layers className={`w-5 h-5 ${theme.text}`} />
              <h2 className="text-sm md:text-base font-bold text-slate-100 tracking-wider">
                ANÁLISIS DE RENDIMIENTO POR DOMINIO CEH v12
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">
              CATEGORIZACIÓN AUTOMÁTICA DE DOMINIOS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {domainStats.map((dom) => {
              const IconComp = dom.icon;
              const statusTag =
                dom.accuracy >= 80
                  ? { text: 'DOMINADO', cls: 'bg-emerald-950/80 text-neon-green border-neon-green/40' }
                  : dom.accuracy >= 60
                  ? { text: 'ACEPTABLE', cls: 'bg-amber-950/80 text-amber-400 border-amber-500/40' }
                  : { text: 'REFORZAR', cls: 'bg-rose-950/80 text-neon-red border-neon-red/40' };

              return (
                <div
                  key={dom.id}
                  className="bg-cyber-950/90 border border-cyber-border/80 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-cyber-border transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-cyber-900 border border-cyber-border">
                      <IconComp className={`w-4 h-4 ${dom.color}`} />
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${statusTag.cls}`}>
                      {statusTag.text}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-mono font-bold text-slate-200 line-clamp-1">
                      {dom.shortName}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                      {dom.correct}/{dom.total} correctas
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-slate-500">PRECISIÓN</span>
                      <span className="text-slate-300 font-bold">{dom.accuracy}%</span>
                    </div>
                    <div className="w-full bg-cyber-900 h-1.5 rounded-full overflow-hidden border border-cyber-border/60">
                      <div
                        className={`h-full ${dom.barBg} transition-all duration-500`}
                        style={{ width: `${dom.accuracy}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CARD 5: Span 4 / Full width - Interactive Question Reviewer */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-cyber-900/80 border border-cyber-border rounded-2xl p-6 shadow-cyber-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyber-border pb-4">
            <div className="flex items-center space-x-2 font-mono">
              <BarChart2 className={`w-5 h-5 ${theme.text}`} />
              <h2 className="text-base font-bold text-slate-100 tracking-wider">
                REVISIÓN DETALLADA DE PREGUNTAS
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-2 font-mono text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded transition-all duration-200 cursor-pointer active:scale-95 ${
                  filter === 'all'
                    ? `${theme.bg} ${theme.text} ${theme.border} ${theme.glow} font-bold tracking-wide`
                    : 'bg-cyber-950 text-slate-400 border border-cyber-border hover:border-slate-500'
                }`}
              >
                Todas ({totalQuestions})
              </button>
              
              <button
                onClick={() => setFilter('incorrect')}
                className={`px-3 py-1.5 rounded transition-all duration-200 cursor-pointer active:scale-95 ${
                  filter === 'incorrect'
                    ? 'bg-neon-red/10 text-neon-red border border-neon-red shadow-[0_0_10px_rgba(255,0,0,0.2)] font-bold tracking-wide'
                    : 'bg-cyber-950 text-slate-400 border border-cyber-border hover:border-neon-red/50 hover:text-neon-red'
                }`}
              >
                Incorrectas ({incorrectCount})
              </button>
              
              <button
                onClick={() => setFilter('correct')}
                className={`px-3 py-1.5 rounded transition-all duration-200 cursor-pointer active:scale-95 ${
                  filter === 'correct'
                    ? 'bg-neon-green/10 text-neon-green border border-neon-green shadow-[0_0_10px_rgba(0,255,0,0.2)] font-bold tracking-wide'
                    : 'bg-cyber-950 text-slate-400 border border-cyber-border hover:border-neon-green/50 hover:text-neon-green'
                }`}
              >
                Correctas ({correctCount})
              </button>
            </div>
          </div>

          {/* Questions Accordion List */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-8 font-mono text-sm text-slate-500 bg-cyber-950/50 rounded-xl border border-cyber-border">
                No hay preguntas que coincidan con el filtro seleccionado.
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const isCorrect = q.userAnswer === q.correctAnswer;
                const isExpanded = expandedId === q.originalIndex;

                return (
                  <div
                    key={q.originalIndex}
                    className={`border rounded-xl font-sans transition-all overflow-hidden ${
                      isCorrect ? 'border-emerald-950/80 bg-cyber-950/60' : 'border-rose-950/80 bg-cyber-950/60'
                    }`}
                  >
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : q.originalIndex)}
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-cyber-900/60 font-mono"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`p-1.5 rounded shrink-0 ${
                          isCorrect ? 'bg-emerald-950 text-neon-green' : 'bg-rose-950 text-neon-red'
                        }`}>
                          {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </div>
                        <span className="text-xs font-bold text-slate-300 truncate">
                          #{q.originalIndex + 1}. {q.question.substring(0, 75)}{q.question.length > 75 ? '...' : ''}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs shrink-0 font-mono">
                        <span className="text-slate-400 hidden sm:inline">
                          Tu Rpta: <strong className={isCorrect ? 'text-neon-green' : 'text-neon-red'}>{q.userAnswer || 'N/A'}</strong> | Correcta: <strong className="text-neon-green">{q.correctAnswer}</strong>
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Detailed Expanded View */}
                    {isExpanded && (
                      <div className="p-5 border-t border-cyber-border bg-cyber-900/40 text-sm space-y-4 font-sans">
                        <p className="text-gray-200 font-semibold text-base leading-relaxed">
                          {q.question}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {q.options.map((opt) => (
                            <div
                              key={opt.letter}
                              className={`p-3.5 rounded-lg border flex items-center space-x-2.5 transition-all ${
                                opt.letter === q.correctAnswer
                                  ? 'border-neon-green/50 bg-emerald-950/40 text-neon-green font-bold shadow-neon-green/20'
                                  : opt.letter === q.userAnswer
                                  ? 'border-neon-red/50 bg-rose-950/40 text-neon-red font-bold shadow-neon-red/20'
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

                        <div className={`bg-cyber-950 p-4 rounded-lg border border-cyber-border text-slate-300 text-xs md:text-sm leading-relaxed border-l-4 ${theme.border} text-justify`}>
                          <span className={`font-mono font-bold block mb-1 ${theme.text}`}>
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
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
