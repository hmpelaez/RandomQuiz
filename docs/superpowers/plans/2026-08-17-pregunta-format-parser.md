# Support 'Pregunta X' Question Format Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Support uploading and parsing Q&A text files formatted with `Pregunta <N>` headers, plain option keys (`A:`, `B:`, `C:`, `D:`), `Respuesta correcta:`, and `Explicación:` without bullet requirements.

**Architecture:** Update `parseInlineFormat` in `src/utils/parser.js` to make option bullet prefixes optional in negative lookahead parsing, and broaden match expressions for answers and explanations while preserving 100% backward compatibility with existing Markdown and Sectional formats.

**Tech Stack:** JavaScript ES modules, Node.js

## Global Constraints

- Must maintain backward compatibility with Markdown headers (`## Pregunta 1:`, `- A:`) and Sectional (`QUESTIONS ... ANSWERS`) formats.
- No changes to UI components or existing function signatures (`parseQnAFormat(text)`).

---

### Task 1: Parser Test Suite & Test Case Setup

**Files:**
- Create: `test-parser.js`

**Interfaces:**
- Consumes: `parseQnAFormat` from `src/utils/parser.js`
- Produces: Test runner script `node test-parser.js` returning exit code 0 on success.

- [ ] **Step 1: Create `test-parser.js` containing assertions for legacy formats and the new Pregunta format**

```javascript
import assert from 'node.assert';
import { parseQnAFormat } from './src/utils/parser.js';

// Test 1: New Pregunta Format with plain options A:, B:, C:, D:
const textNewFormat = `Pregunta 1
A financial institution's Security Operations Center (SOC) notices that cyberattacks against their infrastructure have shifted from unfolding over days or months to occurring in mere milliseconds. The attackers are utilizing automated reconnaissance bots and polymorphic code. To restore the security balance of power in this new environment, which strategic capability must the defenders prioritize according to the new tempo of conflict?

A: Deploying static, rule-based signature detection systems across all endpoints to immediately block known malicious payloads.
B: Completely isolating all internal neural networks from external interactions to prevent adversarial data poisoning.
C: Removing human analysts from the incident response pipeline to match the machine-speed execution of the attackers.
D: Utilizing AI for foresight and orchestration to filter noise, anticipate attack paths, and respond before damage spreads.
Respuesta correcta: D
Explicación: El capítulo 1 establece explícitamente que frente a los ataques acelerados por IA que ocurren en milisegundos, los defensores deben aprovechar la IA para la "previsión y orquestación" (foresight and orchestration).`;

const res1 = parseQnAFormat(textNewFormat);
assert.strictEqual(res1.success, true, 'Test 1 should succeed');
assert.strictEqual(res1.questions.length, 1, 'Test 1 should parse 1 question');
assert.strictEqual(res1.questions[0].options.length, 4, 'Test 1 should parse 4 options');
assert.strictEqual(res1.questions[0].options[0].letter, 'A');
assert.strictEqual(res1.questions[0].options[1].letter, 'B');
assert.strictEqual(res1.questions[0].options[2].letter, 'C');
assert.strictEqual(res1.questions[0].options[3].letter, 'D');
assert.strictEqual(res1.questions[0].correctAnswer, 'D');
assert.ok(res1.questions[0].explanation.includes('El capítulo 1 establece'), 'Explanation parsed');

// Test 2: Legacy Markdown format with bullets
const textLegacyMarkdown = `## Pregunta 1: ¿Cuál es un puerto seguro?
- A: 80
- B: 443
- C: 21
- D: 23
Respuesta correcta: B
Explicación: HTTPS usa puerto 443.`;

const res2 = parseQnAFormat(textLegacyMarkdown);
assert.strictEqual(res2.success, true, 'Test 2 should succeed');
assert.strictEqual(res2.questions[0].options.length, 4);
assert.strictEqual(res2.questions[0].correctAnswer, 'B');

console.log('All tests passed successfully!');
```

- [ ] **Step 2: Run test to verify failure on current implementation**

Run: `node test-parser.js`  
Expected: FAIL with `AssertionError [ERR_ASSERTION]: Test 1 should parse 4 options` (because current parser outputs 1 bundled option instead of 4).

- [ ] **Step 3: Commit initial test file**

```bash
git add test-parser.js
git commit -m "test: add parser unit test script for Pregunta format"
```

---

### Task 2: Implement Parser Enhancements in `src/utils/parser.js`

**Files:**
- Modify: `src/utils/parser.js:8-66`

**Interfaces:**
- Consumes: Raw text string
- Produces: `parseQnAFormat(text)` returning `{ success, questions, missingAnswersCount, totalCount, error }`

- [ ] **Step 1: Update `parseInlineFormat` regexes in `src/utils/parser.js`**

In `src/utils/parser.js`:
1. Update `optionMatches` negative lookahead regex to make bullet prefixes optional: `(?:\s*[-*]\s*)?`.
2. Ensure `ansMatch` regex matches `Respuesta correcta:`, `Respuesta:`, `Answer:`, `Correct Answer:`, `Solución:`.
3. Ensure `expMatch` regex matches `Explicación:`, `Explanation:`, `Justificación:`.

```javascript
function parseInlineFormat(normalizedText) {
  // Dividir por encabezados de pregunta flexibles (ej: ## Pregunta 1: ..., **Pregunta 2: ...**, Pregunta 1)
  const rawBlocks = normalizedText.split(/(?:^|\n)(?=(?:#{1,6}\s*)?(?:\*\*)?(?:Pregunta|Question|\d+)\b[.:\s*]*\d*)/i).filter(b => b.trim().length > 0);

  const questionsList = [];

  rawBlocks.forEach((block, idx) => {
    // Limpiar separadores tipo ---
    const cleanBlock = block.replace(/---+/g, '').trim();
    if (!cleanBlock) return;

    // Detectar encabezado de la pregunta
    const headerMatch = cleanBlock.match(/^(?:#{1,6}\s*)?(?:\*\*)?(?:Pregunta|Question)?\s*(\d+)?[.:\s*]*(?:\*\*)?\s*([\s\S]+)$/i);
    if (!headerMatch) return;

    const qNum = headerMatch[1] ? parseInt(headerMatch[1], 10) : idx + 1;
    const body = headerMatch[2].trim();

    // Extraer opciones (ej: - A: texto, - A. texto, A: texto, A) texto, A. texto)
    const optionMatches = [...body.matchAll(/(?:^|\n)\s*(?:[-*]\s*)?([A-E])[.:)]\s*([^\n]+(?:\n(?!\s*(?:[-*]\s*)?[A-E][.:)]|#{1,6}\s*Respuesta|\*\*Respuesta|Respuesta\s*(?:correcta)?|Answer|Correct\s*Answer|Explicación|Explanation|Justificación|\d+[.:)]|---).*)*)/gi)];

    if (optionMatches.length === 0) return;

    // Enunciado: Todo el texto antes de la primera opción
    let prompt = body.substring(0, optionMatches[0].index).trim();
    // Limpieza de formato markdown en el enunciado
    prompt = prompt
      .replace(/^#+\s*/, '')
      .replace(/^\*\*/, '')
      .replace(/\*\*$/, '')
      .replace(/^Pregunta\s*\d+:\s*/i, '')
      .trim();

    const options = optionMatches.map(m => ({
      letter: m[1].toUpperCase(),
      text: m[2].replace(/\s+/g, ' ').trim()
    }));

    // Extraer respuesta correcta
    const ansMatch = body.match(/(?:#{1,6}\s*)?(?:\*\*)?(?:Respuesta\s*(?:correcta)?|Answer|Correct\s*Answer|Solución)\s*:?\s*(?:\*\*)?\s*([A-E])/i);
    const correctAnswer = ansMatch ? ansMatch[1].toUpperCase() : null;

    // Extraer explicación
    const expMatch = body.match(/(?:#{1,6}\s*)?(?:\*\*)?(?:Explicación|Explanation|Justificación)\s*:?\s*(?:\*\*)?\s*([\s\S]+)$/i);
    let explanation = expMatch ? expMatch[1].trim() : '';
    explanation = explanation.replace(/---+$/, '').trim();

    questionsList.push({
      id: idx + 1,
      number: qNum,
      question: prompt,
      options: options,
      correctAnswer: correctAnswer,
      explanation: explanation || 'Sin explicación detallada registrada.'
    });
  });

  return questionsList;
}
```

- [ ] **Step 2: Run test suite to verify all tests pass**

Run: `node test-parser.js`  
Expected: Output `All tests passed successfully!` and exit code 0.

- [ ] **Step 3: Commit changes**

```bash
git add src/utils/parser.js
git commit -m "feat: enhance parser to support Pregunta format without bullet prefix requirements"
```

---

### Task 3: Clean up Temporary Test File & Verify Build

**Files:**
- Modify: `test-parser.js` (remove/cleanup or keep if desired)
- Verify: `npm run build` or `npx oxlint`

- [ ] **Step 1: Remove temporary `test-parser.js` script if not part of workspace tests**

Run: `rm test-parser.js`

- [ ] **Step 2: Run linter and build check**

Run: `npm run lint`  
Expected: PASS with 0 errors.

Run: `npm run build`  
Expected: Vite build succeeds with 0 errors.

- [ ] **Step 3: Commit cleanup**

```bash
git commit -a -m "chore: verify build and clean up temporary test runner"
```

