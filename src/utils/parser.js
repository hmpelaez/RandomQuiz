/**
 * Parser de Preguntas y Respuestas (Q&A) mediante Expresiones Regulares (Regex)
 * Diseñado para procesar archivos de exámene con secciones QUESTIONS y ANSWERS.
 */

export function parseQnAFormat(text) {
  if (!text || typeof text !== 'string') {
    return { success: false, questions: [], error: 'El contenido proporcionado está vacío o no es texto válido.' };
  }

  const normalizedText = text.replace(/\r\n/g, '\n').trim();

  // 1. Separar secciones QUESTIONS y ANSWERS
  // Buscar marcadores flexibles (ej: ANSWERS, RESPUESTAS, SOLUCIONES, etc.)
  const answersHeaderRegex = /(?:^|\n)\s*(?:###?\s*)?(?:SECTION\s*\d*:\s*)?(?:ANSWERS|RESPUESTAS|SOLUTIONS|CLAVE DE RESPUESTAS)\b/i;
  const matchAnswersHeader = normalizedText.match(answersHeaderRegex);

  if (!matchAnswersHeader) {
    return {
      success: false,
      questions: [],
      error: 'No se encontró el bloque "ANSWERS" o "RESPUESTAS" en el texto. Asegúrate de incluir la etiqueta ANSWERS.'
    };
  }

  const answersIndex = matchAnswersHeader.index;
  let questionsPart = normalizedText.substring(0, answersIndex).trim();
  let answersPart = normalizedText.substring(answersIndex + matchAnswersHeader[0].length).trim();

  // Remover header "QUESTIONS" si existe al inicio de la sección de preguntas
  const questionsHeaderRegex = /^\s*(?:###?\s*)?(?:SECTION\s*\d*:\s*)?(?:QUESTIONS|PREGUNTAS)\b/i;
  questionsPart = questionsPart.replace(questionsHeaderRegex, '').trim();

  // 2. Parsear la sección de Preguntas
  // Buscar patrones como: 1. Texto de la pregunta... A. Opcion A... B. Opcion B...
  // Dividimos la sección de preguntas por número de pregunta (ej: "1.", "Question 1:", "1)")
  const rawQChunks = questionsPart.split(/(?:^|\n)(?=(?:Q(?:uestion)?\s*)?\d+[.:)]\s+)/i).filter(c => c.trim().length > 0);

  const questionsList = [];
  const qNumIndexMap = new Map();

  rawQChunks.forEach((chunk, idx) => {
    const headerMatch = chunk.match(/^(?:Q(?:uestion)?\s*)?(\d+)[.:)]\s+([\s\S]+)$/i);
    if (!headerMatch) return;

    const qNum = parseInt(headerMatch[1], 10);
    const body = headerMatch[2].trim();

    // Extraer opciones (A., B., C., D., etc.)
    const optionMatches = [...body.matchAll(/(?:^|\n)\s*([A-E])[.:)]\s*([^\n]+(?:\n(?![A-E][.:)]|\d+[.:)]).*)*)/gi)];

    if (optionMatches.length === 0) {
      return;
    }

    // El enunciado es todo el texto antes de la primera opción (Option A)
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

  if (questionsList.length === 0) {
    return {
      success: false,
      questions: [],
      error: 'No se pudieron extraer preguntas válidas de la sección QUESTIONS. Verifica el formato (ej: 1. Enunciado... A. Opcion)'
    };
  }

  // 3. Parsear la sección de Respuestas y Explicaciones
  // Buscar patrones como: 1. B Explicación... o 1. Answer: C \n Explicación completa
  const ansBlocks = answersPart.split(/(?:^|\n)(?=(?:Q(?:uestion)?\s*)?\d+[.:)]\s+(?:Answer\s*:?\s*)?[A-E])/i).filter(a => a.trim().length > 0);

  ansBlocks.forEach(block => {
    // Coincide con: 1. B [parrafo] o 1. Answer: B [parrafo]
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

  const missingAnswersCount = questionsList.filter(q => !q.correctAnswer).length;

  return {
    success: true,
    questions: questionsList,
    missingAnswersCount,
    totalCount: questionsList.length,
    error: null
  };
}

/**
 * Muestras de Exámenes de Ciberseguridad integrados para pruebas rápidas
 */
export const SAMPLE_EXAMS = [
  {
    id: 'ceh-v12-cyber',
    title: 'Certified Ethical Hacker (CEH v12) - Core Security',
    description: 'Examen de prueba sobre Reconocimiento, Nmap, Inyección SQL y Malware analysis.',
    text: `QUESTIONS

1. ¿Cuál es el objetivo principal de la fase de Footprinting / Reconnaissance en un Test de Penetración?
A. Obtener acceso de superusuario (root) al servidor inmediatamente
B. Recopilar información detallada sobre la red objetivo, direcciones IP y tecnologías expuestas
C. Ejecutar un ataque de Denegación de Servicio (DoS) en la infraestructura
D. Cifrar la base de datos de la víctima para exigir un rescate

2. En la herramienta Nmap, ¿qué parámetro se utiliza para realizar un escaneo SYN Stealth (Half-Open scan)?
A. -sT
B. -sU
C. -sS
D. -sA

3. ¿Qué tipo de vulnerabilidad permite a un atacante alterar las consultas SQL enviadas por una aplicación web a la base de datos?
A. Cross-Site Scripting (XSS)
B. SQL Injection (SQLi)
C. Cross-Site Request Forgery (CSRF)
D. Server-Side Request Forgery (SSRF)

4. ¿Cuál de los siguientes protocolos asegura la transmisión de datos a nivel de capa de transporte cifrando el tráfico mediante TLS?
A. HTTP
B. FTP
C. HTTPS
D. SNMP

5. En análisis de malware, ¿qué diferencia a un Virus de un Gusano (Worm)?
A. El gusano requiere interacción humana para replicarse, mientras que el virus no
B. El virus se adjunta a un archivo/ejecutable anfitrión y requiere ejecución, mientras que el gusano se autorreplica en la red de forma autónoma
C. Los virus solo afectan a Linux y los gusanos solo a Windows
D. El gusano es software benigno de diagnóstico y el virus es maligno

ANSWERS

1. B
El Footprinting o Reconocimiento es la fase inicial donde el analista de seguridad recopila datos públicos e infraestructura de la entidad objetivo (DNS, bloques IP, subdominios, tecnologías) antes de lanzar vectores de ataque activos.

2. C
El parámetro -sS ejecuta un SYN Stealth scan en Nmap. Envía un paquete SYN y espera la respuesta SYN-ACK, enviando inmediatamente un paquete RST para cerrar la conexión sin completar el hand-shake TCP de 3 vías, lo que evita quedar registrado en muchos sistemas de log convencionales.

3. B
SQL Injection ocurre cuando entradas de usuario no sanitizadas se concatenan directamente en sentencias SQL, permitiendo a un atacante modificar la estructura de la consulta, eludir mecanismos de autenticación y extraer datos confidenciales.

4. C
HTTPS (Hypertext Transfer Protocol Secure) utiliza la capa TLS (Transport Layer Security) para cifrar todo el flujo de datos entre el navegador del usuario y el servidor web, garantizando confidencialidad e integridad.

5. B
Un virus informático necesita alojarse dentro de un archivo o programa anfitrión y requiere ser ejecutado por el usuario para propagarse. Por el contrario, un gusano (Worm) contiene su propia rutina de propagación autónoma a través de vulnerabilidades de red sin necesitar interacción del usuario.
`
  },
  {
    id: 'web-sec-owasp',
    title: 'OWASP Top 10 & Web Application Security',
    description: 'Vulnerabilidades críticas en aplicaciones web, XSS, SSRF y autenticación.',
    text: `QUESTIONS

1. ¿Qué tipo de ataque ocurre cuando un atacante logra inyectar código JavaScript malicioso en una página web vista por otros usuarios?
A. Command Injection
B. Cross-Site Scripting (XSS)
C. Buffer Overflow
D. Directory Traversal

2. ¿Qué cabecera de respuesta HTTP ayuda a mitigar ataques XSS especificando de qué fuentes el navegador puede cargar recursos?
A. Strict-Transport-Security (HSTS)
B. Content-Security-Policy (CSP)
C. X-Frame-Options
D. Access-Control-Allow-Origin

3. En una vulnerabilidad SSRF (Server-Side Request Forgery), ¿quién realiza la solicitud maliciosa al recurso interno?
A. El navegador web del atacante directamente
B. El servidor vulnerable procesando la petición a nombre del atacante
C. El proveedor de servicio DNS primario
D. El firewall perimetral corporativo

ANSWERS

1. B
Cross-Site Scripting (XSS) permite al atacante ejecutar scripts arbitrarios en el contexto del navegador de la víctima, pudiendo robar galletas de sesión (session tokens), redirigir usuarios o alterar el contenido de la interfaz.

2. B
Content Security Policy (CSP) es un mecanismo de seguridad HTTP que permite a los administradores restringir los recursos (JavaScript, CSS, imágenes) que el navegador tiene permitido cargar y ejecutar en un dominio específico.

3. B
En un ataque SSRF, la aplicación web vulnerable recibe una URL proporcionada por el atacante y efectúa la solicitud HTTP desde el servidor de backend, permitiendo alcanzar servicios internos aislados (como métricas cloud AWS 169.254.169.254 o bases de datos locales).
`
  }
];
