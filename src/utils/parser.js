/**
 * Parser Inteligente de Preguntas y Respuestas (Q&A)
 * Soporta múltiples formatos:
 * 1. Formato Bloque / Markdown en línea (ej: ## Pregunta 1: ..., - A: ..., ### Respuesta correcta: C, Explicación: ...)
 * 2. Formato por Secciones (QUESTIONS ... ANSWERS ...)
 */

function parseInlineFormat(normalizedText) {
  // Dividir por encabezados de pregunta flexibles (ej: ## **Pregunta 1: ...**, **Pregunta 2: ...**, 1. Enunciado)
  const rawBlocks = normalizedText.split(/(?:^|\n)(?=(?:#{1,6}\s*)?(?:\*\*)?(?:Pregunta|Question|\d+)[.:\s*]+\d*)/i).filter(b => b.trim().length > 0);

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

    // Extraer opciones (ej: - A: texto, - A. texto, A) texto, A. texto)
    const optionMatches = [...body.matchAll(/(?:^|\n)\s*(?:[-*]\s*)?([A-E])[.:)]\s*([^\n]+(?:\n(?![-*]\s*[A-E][.:)]|###?\s*Respuesta|\*\*Respuesta|Respuesta\s*correcta|Explicación|\d+[.:)]|---).*)*)/gi)];

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
    const ansMatch = body.match(/(?:#{1,6}\s*)?(?:\*\*)?(?:Respuesta\s*(?:correcta)?|Answer|Correct\s*Answer)\s*:?\s*(?:\*\*)?\s*([A-E])/i);
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

function parseSectionalFormat(normalizedText) {
  const answersHeaderRegex = /(?:^|\n)\s*(?:###?\s*)?(?:SECTION\s*\d*:\s*)?(?:ANSWERS|RESPUESTAS|SOLUTIONS|CLAVE DE RESPUESTAS)\b/i;
  const matchAnswersHeader = normalizedText.match(answersHeaderRegex);

  if (!matchAnswersHeader) {
    return null;
  }

  const answersIndex = matchAnswersHeader.index;
  let questionsPart = normalizedText.substring(0, answersIndex).trim();
  let answersPart = normalizedText.substring(answersIndex + matchAnswersHeader[0].length).trim();

  const questionsHeaderRegex = /^\s*(?:###?\s*)?(?:SECTION\s*\d*:\s*)?(?:QUESTIONS|PREGUNTAS)\b/i;
  questionsPart = questionsPart.replace(questionsHeaderRegex, '').trim();

  const rawQChunks = questionsPart.split(/(?:^|\n)(?=(?:Q(?:uestion)?\s*)?\d+[.:)]\s+)/i).filter(c => c.trim().length > 0);

  const questionsList = [];
  const qNumIndexMap = new Map();

  rawQChunks.forEach((chunk, idx) => {
    const headerMatch = chunk.match(/^(?:Q(?:uestion)?\s*)?(\d+)[.:)]\s+([\s\S]+)$/i);
    if (!headerMatch) return;

    const qNum = parseInt(headerMatch[1], 10);
    const body = headerMatch[2].trim();

    const optionMatches = [...body.matchAll(/(?:^|\n)\s*([A-E])[.:)]\s*([^\n]+(?:\n(?![A-E][.:)]|\d+[.:)]).*)*)/gi)];

    if (optionMatches.length === 0) return;

    const firstOptIndex = optionMatches[0].index;
    const questionPrompt = body.substring(0, firstOptIndex).trim();

    const options = optionMatches.map(m => ({
      letter: m[1].toUpperCase(),
      text: m[2].replace(/\s+/g, ' ').trim()
    }));

    const qObj = {
      id: idx + 1,
      number: qNum,
      question: questionPrompt,
      options: options,
      correctAnswer: null,
      explanation: ''
    };

    questionsList.push(qObj);

    if (!qNumIndexMap.has(qNum)) {
      qNumIndexMap.set(qNum, []);
    }
    qNumIndexMap.get(qNum).push(qObj);
  });

  const ansBlocks = answersPart.split(/(?:^|\n)(?=(?:Q(?:uestion)?\s*)?\d+[.:)]\s+(?:Answer\s*:?\s*)?[A-E])/i).filter(a => a.trim().length > 0);

  ansBlocks.forEach(block => {
    const matchAns = block.match(/^(?:Q(?:uestion)?\s*)?(\d+)[.:)]\s*(?:Answer\s*:?\s*)?([A-E])[.:)]?\s*(.*(?:\n.*)*)$/i);

    if (matchAns) {
      const qNum = parseInt(matchAns[1], 10);
      const letter = matchAns[2].toUpperCase();
      const explanation = matchAns[3].trim();

      const targetList = qNumIndexMap.get(qNum);
      if (targetList && targetList.length > 0) {
        const targetQ = targetList.find(q => q.correctAnswer === null) || targetList[0];
        targetQ.correctAnswer = letter;
        targetQ.explanation = explanation || 'Sin explicación detallada disponible.';
      }
    }
  });

  return questionsList;
}

export function parseQnAFormat(text) {
  if (!text || typeof text !== 'string') {
    return { success: false, questions: [], error: 'El contenido proporcionado está vacío o no es texto válido.' };
  }

  const normalizedText = text.replace(/\r\n/g, '\n').trim();

  // 1. Intentar Parsear Formato por Secciones (Si contiene marcador RESPUESTAS / ANSWERS)
  let questionsList = parseSectionalFormat(normalizedText);

  // 2. Si no es formato por secciones, intentar Parsear Formato Bloque / Markdown en Línea
  if (!questionsList || questionsList.length === 0) {
    questionsList = parseInlineFormat(normalizedText);
  }

  if (!questionsList || questionsList.length === 0) {
    return {
      success: false,
      questions: [],
      error: 'No se pudieron extraer preguntas válidas del texto. Soporta formato Markdown (## Pregunta 1..., - A:..., Respuesta correcta: C) o por Secciones (QUESTIONS ... ANSWERS).'
    };
  }

  const missingAnswersCount = questionsList.filter(q => !q.correctAnswer).length;

  return {
    success: true,
    questions: questionsList,
    missingAnswersCount,
    totalCount: questionsList.length,
    error: null
  };
}
