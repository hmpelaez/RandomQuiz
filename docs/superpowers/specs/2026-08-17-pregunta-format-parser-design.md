# Design Spec: Support 'Pregunta X' Question Format in Parser

## Overview
This design spec details the updates to `src/utils/parser.js` in order to support questions formatted with `Pregunta <N>` headers, plain option keys (`A:`, `B:`, `C:`, `D:`), and explicit `Respuesta correcta:` and `Explicación:` blocks without bullet requirements.

## Context & Motivation
Users upload Q&A text files formatted like:
```text
Pregunta 1
<Question prompt text...>

A: Option A text
B: Option B text
C: Option C text
D: Option D text
Respuesta correcta: D
Explicación: Detailed explanation text...
```
Currently, the regex in `parseInlineFormat` expects bullets (e.g. `- A:`) in its negative lookahead when capturing option content. This caused options `B`, `C`, and `D` to be bundled into option `A`.

## Key Changes

### 1. Updated Parser Regex (`src/utils/parser.js`)
- **Block Splitting Regex**:
  Match question headers such as `Pregunta 1`, `Question 1`, `1.`, `## Pregunta 1`:
  `/(?:^|\n)(?=(?:#{1,6}\s*)?(?:\*\*)?(?:Pregunta|Question|\d+)\b[.:\s*]*\d*)/i`

- **Option Extraction Regex**:
  Make bullet prefixes optional in both the option head and the negative lookahead:
  `/(?:^|\n)\s*(?:[-*]\s*)?([A-E])[.:)]\s*([^\n]+(?:\n(?!\s*(?:[-*]\s*)?[A-E][.:)]|#{1,6}\s*Respuesta|\*\*Respuesta|Respuesta\s*(?:correcta)?|Answer|Explicación|Explanation|Justificación|\d+[.:)]|---).*)*)/gi`

- **Correct Answer & Explanation Regex**:
  Accept variants like `Respuesta correcta: D`, `Respuesta: D`, `Answer: D`, `Correct Answer: D`.
  Accept explanations following `Explicación:`, `Explanation:`, or `Justificación:`.

### 2. Backward Compatibility
All existing formats (Sectional `QUESTIONS ... ANSWERS`, Markdown headers `## Pregunta 1:`, bulleted options `- A:`) remain 100% supported.

### 3. Verification & Testing
- Add unit test verification script to validate both legacy formats and the new format.
