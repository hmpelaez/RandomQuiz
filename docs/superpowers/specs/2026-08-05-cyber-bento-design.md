# Spec: Cyber-Bento UI/UX & AI Copilot Enhancement

**Date:** 2026-08-05  
**Target Project:** CEH (Certified Ethical Hacker) Exam Practice & Quiz Application  
**Author:** AI Pair Programmer & UI/UX Specialist  

---

## 1. Executive Summary

This specification outlines the UI/UX enhancement of the CEH Exam practice application. It transforms the application interface into a modern **Cyber-Bento Grid** layout, introduces a **Dynamic Cyber Theme Switcher** (Cyan, Matrix Green, Synthwave Magenta, Stealth Amber), and integrates an **AI HackHint Copilot** assistant panel to provide mnemonic exam tips, technical breakdowns, and cybersecurity terminology.

---

## 2. Core Features & System Architecture

### 2.1 Dynamic Cyber Theme Engine
- **Themes Supported**:
  - `cyan` (Default): Cyber Cyan `#00f3ff`, Cyan glows.
  - `matrix`: Hacker Matrix Green `#00ff66`, Emerald glows.
  - `synth`: Synthwave Magenta `#ff007f`, Rose/Purple glows.
  - `stealth`: Stealth Amber `#ffb700`, Gold/Yellow glows.
- **State Management**:
  - Global `accentTheme` state managed in `App.jsx` and passed to `CyberHeader` and components.
  - Tailwind theme utility classes or CSS variables for border accents, text glows, and shadows.
- **Controls**: Quick theme selector pills rendered directly in `CyberHeader.jsx`.

### 2.2 Cyber-Bento Grid Dashboard in `StatsPanel.jsx`
Replaces the flat linear stats with a 4-column responsive Bento Grid:
1. **Exam Readiness Gauge (Span 2)**:
   - Animated SVG progress ring showing overall exam score and pass/fail status (`>= 70%` passing threshold).
   - Dynamic recommendation badge based on readiness score.
2. **Speed & Timing Metrics (Span 1)**:
   - Total time taken, average seconds per question, pacing speed indicator.
3. **Streak & Accuracy Card (Span 1)**:
   - Correct vs Incorrect counters and accuracy percentage.
4. **Domain Mastery Breakdown (Span 4)**:
   - Performance per CEH domain (Reconnaissance, Web Security, Cryptography, Network Protocols, Malware).
5. **Interactive Question Reviewer (Span 4)**:
   - Filter pills (All, Correct, Incorrect).
   - Collapsible cards for individual question review with AI explanation context.

### 2.3 AI HackHint Copilot Component in `ExplanationPanel.jsx`
- **Trigger**: A high-visibility button `<Sparkles /> HackHint Copilot` inside the answer explanation section.
- **Collapsible Glassmorphism Panel**:
  - **Mnemonic / Exam Tip**: Practical rule of thumb for remembering the correct answer during the official CEH exam.
  - **Technical Core**: Key security principle breakdown.
  - **Cyber Terminology**: Bulleted list of technical acronyms/concepts referenced in the question.

---

## 3. Component Hierarchy & File Updates

1. `src/App.jsx`: Stores `accentTheme` state, passes to header & views.
2. `src/components/CyberHeader.jsx`: Adds Theme Switcher buttons (Cyan, Matrix, Synth, Stealth).
3. `src/components/ExplanationPanel.jsx`: Embeds `AI HackHint Copilot` drawer with glassmorphism layout and CEH study mnemonics.
4. `src/components/StatsPanel.jsx`: Implements the 4-column Cyber-Bento Grid with Readiness Score gauge and domain analytics.
5. `src/utils/theme.js` *(New)*: Helper utility providing color mappings and dynamic style tokens for active themes.

---

## 4. Quality & Performance Criteria

- **Zero Lint Warnings**: Full compliance with Oxlint rules.
- **Production Build**: Clean bundle compilation via Vite with zero build errors.
- **Responsive Layout**: Full support for Mobile, Tablet, and Desktop screens.
