# Cyber-Bento UI/UX & AI Copilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the CEH practice application UI into a modern Cyber-Bento Grid layout, add a dynamic 4-palette theme engine, and integrate an AI HackHint Copilot panel.

**Architecture:** A theme utility (`theme.js`) manages color accents (`cyan`, `matrix`, `synth`, `stealth`). `App.jsx` manages top-level `accentTheme` state passed to `CyberHeader` and view components. `ExplanationPanel` hosts the AI HackHint drawer, and `StatsPanel` is structured as a 4-column Bento grid with an animated SVG Exam Readiness gauge.

**Tech Stack:** React 19, Vite, Tailwind CSS v4, Lucide React, Web Audio API, Canvas Confetti.

## Global Constraints

- React 19 hooks and functional components syntax.
- Tailwind CSS v4 class names.
- Zero Oxlint linter warnings and zero Vite build errors.
- Responsive layout across mobile, tablet, and desktop viewports.

---

### Task 1: Theme Helper Utility (`src/utils/theme.js`)

**Files:**
- Create: `src/utils/theme.js`

**Interfaces:**
- Consumes: Theme identifiers (`'cyan'`, `'matrix'`, `'synth'`, `'stealth'`)
- Produces: `THEMES` object and `getThemeClasses(theme)` function returning border, background, shadow, and text accent classes.

- [ ] **Step 1: Create `src/utils/theme.js`**

```javascript
export const THEMES = {
  cyan: {
    id: 'cyan',
    name: 'Cyber Cyan',
    color: '#00f3ff',
    border: 'border-neon-cyan',
    text: 'text-neon-cyan',
    glow: 'shadow-neon-cyan',
    bg: 'bg-cyan-950/40',
    badge: 'bg-cyan-950 text-neon-cyan border-neon-cyan/40',
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix Green',
    color: '#00ff66',
    border: 'border-neon-green',
    text: 'text-neon-green',
    glow: 'shadow-neon-green',
    bg: 'bg-emerald-950/40',
    badge: 'bg-emerald-950 text-neon-green border-neon-green/40',
  },
  synth: {
    id: 'synth',
    name: 'Synthwave',
    color: '#ff007f',
    border: 'border-neon-magenta',
    text: 'text-neon-magenta',
    glow: 'shadow-neon-magenta',
    bg: 'bg-rose-950/40',
    badge: 'bg-rose-950 text-neon-magenta border-neon-magenta/40',
  },
  stealth: {
    id: 'stealth',
    name: 'Stealth Amber',
    color: '#ffb700',
    border: 'border-amber-500',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    bg: 'bg-amber-950/40',
    badge: 'bg-amber-950 text-amber-400 border-amber-500/40',
  }
};

export function getThemeClasses(themeId = 'cyan') {
  return THEMES[themeId] || THEMES.cyan;
}
```

- [ ] **Step 2: Verify `src/utils/theme.js` exports**

Run: `npm run lint`
Expected: 0 warnings, 0 errors.

- [ ] **Step 3: Commit `theme.js`**

```bash
git add src/utils/theme.js
git commit -m "feat: add theme helper utility for dynamic cyber accent palettes"
```

---

### Task 2: Dynamic Cyber Theme Integration in `CyberHeader.jsx` and `App.jsx`

**Files:**
- Modify: `src/App.jsx:8-85`
- Modify: `src/components/CyberHeader.jsx:1-90`

**Interfaces:**
- Consumes: `getThemeClasses`, `THEMES` from `src/utils/theme.js`
- Produces: `accentTheme` state and `setAccentTheme` handler in `App.jsx`, theme pills in `CyberHeader.jsx`.

- [ ] **Step 1: Update `src/App.jsx` with theme state**

In `App.jsx`, add state:
`const [accentTheme, setAccentTheme] = useState('cyan');`

Pass `accentTheme` and `setAccentTheme` to `<CyberHeader />` and view components.

- [ ] **Step 2: Add theme pills in `src/components/CyberHeader.jsx`**

Import `THEMES` in `CyberHeader.jsx` and render theme pills next to sound toggle:
```jsx
<div className="flex items-center space-x-1 border-r border-cyber-border pr-2 mr-1">
  {Object.values(THEMES).map((t) => (
    <button
      key={t.id}
      onClick={() => setAccentTheme(t.id)}
      title={t.name}
      className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
        accentTheme === t.id ? 'scale-125 ring-2 ring-white/50' : 'opacity-60 hover:opacity-100'
      }`}
      style={{ backgroundColor: t.color, borderColor: t.color }}
    />
  ))}
</div>
```

- [ ] **Step 3: Verify build and lint**

Run: `npm run lint && npm run build`
Expected: 0 warnings, 0 errors.

- [ ] **Step 4: Commit theme header updates**

```bash
git add src/App.jsx src/components/CyberHeader.jsx
git commit -m "feat: integrate dynamic theme switcher in CyberHeader and App state"
```

---

### Task 3: AI HackHint Copilot Component in `ExplanationPanel.jsx`

**Files:**
- Modify: `src/components/ExplanationPanel.jsx:1-60`

**Interfaces:**
- Consumes: `explanation`, `selectedOption`, `correctAnswer`, `accentTheme`
- Produces: Expandable Glassmorphism `<Sparkles /> HackHint Copilot` panel with CEH Mnemonics, Technical Breakdown, and Terminology.

- [ ] **Step 1: Update `ExplanationPanel.jsx` with Copilot Drawer**

Add `useState(false)` for `showCopilot`. Add AI Copilot button and expandable card:
```jsx
import React, { useState } from 'react';
import { CheckCircle, XCircle, Lightbulb, Sparkles, BookOpen, Key } from 'lucide-react';
import { getThemeClasses } from '../utils/theme';

export default function ExplanationPanel({
  selectedOption,
  correctAnswer,
  explanation,
  accentTheme = 'cyan'
}) {
  const [showCopilot, setShowCopilot] = useState(false);
  const isCorrect = selectedOption === correctAnswer;
  const theme = getThemeClasses(accentTheme);

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

        {/* AI Copilot Toggle Button */}
        <button
          onClick={() => setShowCopilot(!showCopilot)}
          className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
            showCopilot
              ? `${theme.border} ${theme.text} ${theme.bg} ${theme.glow}`
              : 'border-cyber-border text-slate-400 bg-cyber-900 hover:border-slate-500 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{showCopilot ? 'Ocultar HackHint' : 'HackHint Copilot'}</span>
        </button>
      </div>

      {/* Didactic Context Body */}
      <div className="space-y-3 w-full">
        <div className="flex items-center space-x-2 text-neon-cyan font-mono text-xs font-semibold">
          <Lightbulb className="w-4 h-4 text-neon-yellow" />
          <span>EXPLICACIÓN TÉCNICA:</span>
        </div>

        <div className="w-full bg-cyber-950/80 border border-cyber-border rounded-lg p-4 font-sans text-sm text-slate-300 leading-relaxed text-justify border-l-4 border-neon-cyan pl-4 shadow-inner">
          {explanation ? explanation.replace(/\n/g, ' ') : 'Sin explicación detallada registrada para esta pregunta.'}
        </div>
      </div>

      {/* AI HackHint Copilot Card */}
      {showCopilot && (
        <div className="mt-4 border border-cyan-500/30 bg-cyber-900/90 backdrop-blur-xl rounded-xl p-5 space-y-4 shadow-2xl animate-fade-in font-mono">
          <div className="flex items-center justify-between border-b border-cyber-border pb-2">
            <span className="text-xs font-bold text-neon-cyan flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-neon-yellow" />
              CYBER AI COPILOT :: HACKHINT STUDY ASSISTANT
            </span>
            <span className="text-[10px] bg-cyan-950 text-neon-cyan px-2 py-0.5 rounded border border-neon-cyan/30">
              CEH EXAM TIP
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-cyber-950/80 border border-cyber-border rounded-lg p-3 space-y-1">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-neon-cyan" />
                REGLA NEMOTÉCNICA:
              </span>
              <p className="text-slate-300 font-sans leading-relaxed">
                Relaciona la palabra clave del enunciado con el protocolo o vector primario antes de responder.
              </p>
            </div>

            <div className="bg-cyber-950/80 border border-cyber-border rounded-lg p-3 space-y-1">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-neon-yellow" />
                CONCEPTOS CLAVE:
              </span>
              <p className="text-slate-300 font-sans leading-relaxed">
                Verifica siempre las diferencias entre escaneos sigilosos (-sS) y conexiones TCP completas (-sT).
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
```

- [ ] **Step 2: Verify build and lint**

Run: `npm run lint && npm run build`
Expected: 0 warnings, 0 errors.

- [ ] **Step 3: Commit ExplanationPanel AI HackHint features**

```bash
git add src/components/ExplanationPanel.jsx
git commit -m "feat: add AI HackHint Copilot assistant card to ExplanationPanel"
```

---

### Task 4: Cyber-Bento Grid Dashboard in `StatsPanel.jsx`

**Files:**
- Modify: `src/components/StatsPanel.jsx:1-280`

**Interfaces:**
- Consumes: `questions`, `userAnswers`, `elapsedTime`, `onResetExam`, `onLoadNew`, `onRetryIncorrect`, `accentTheme`
- Produces: Responsive 4-column Bento Grid with animated SVG Exam Readiness gauge, timing metrics, domain breakdown cards, and question reviewer.

- [ ] **Step 1: Refactor `StatsPanel.jsx` into Bento Grid**

In `StatsPanel.jsx`, construct:
1. **Exam Readiness Card (Span 2)**: Animated SVG ring gauge showing score percentage and `APROBADO` (>= 70%) or `REPROBADO` badge.
2. **Speed & Pacing Card (Span 1)**: Elapsed time, average seconds per question.
3. **Accuracy Card (Span 1)**: Correct vs Incorrect breakdown and success rate percentage.
4. **Domain Cobertura Bento Card (Span 4)**: Categorized breakdown by CEH domain.
5. **Interactive Question Reviewer Bento Card (Span 4)**: Filter pills and collapsible list.

- [ ] **Step 2: Verify build and lint**

Run: `npm run lint && npm run build`
Expected: 0 warnings, 0 errors.

- [ ] **Step 3: Commit Bento Grid Dashboard in `StatsPanel.jsx`**

```bash
git add src/components/StatsPanel.jsx
git commit -m "feat: refactor StatsPanel into 4-column Cyber-Bento Grid with Exam Readiness gauge"
```

---

### Task 5: Final Verification & Build Check

**Files:**
- Test all components: `src/App.jsx`, `src/components/CyberHeader.jsx`, `src/components/ExplanationPanel.jsx`, `src/components/StatsPanel.jsx`, `src/utils/theme.js`

- [ ] **Step 1: Execute oxlint**

Run: `npm run lint`
Expected: 0 warnings and 0 errors.

- [ ] **Step 2: Execute vite build**

Run: `npm run build`
Expected: Clean build output in `dist/`.

- [ ] **Step 3: Commit final integration**

```bash
git add .
git commit -m "chore: final verification for Cyber-Bento UI/UX and AI Copilot integration"
```
