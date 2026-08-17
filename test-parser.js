import assert from 'node:assert';
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
