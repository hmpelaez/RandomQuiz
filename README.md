<div align="center">

# ⚡ Cyber Q&A Terminal Simulator

**Simulador de Examen**

</div>

## 📌 Descripción

**Cyber Q&A Terminal Simulator** es una aplicación web interactiva diseñada para la generación de pruebas aleatorias.

---

## 🔥 Características Principales

### 🧠 1. Smart Regex Parser & Carga Flexible
- **Parseo Automático**: Procesa texto en bruto, archivos `.txt` o bancadas formateadas detectando automáticamente preguntas, opciones multiple-choice (`A`, `B`, `C`, `D`), respuestas correctas y explicaciones didácticas.
- **Entrada Doble**: Sube archivos mediante **Drag & Drop** o pega fragmentos de texto directamente en la consola interactiva.

### 🔀 2. Dos Modos de Examen
- **🎯 Modo Estándar / Evaluación Individual**: Procesa un único archivo o banco de preguntas para revisión guiada con retroalimentación inmediata.
- **🎲 Modo Simulador Aleatorio Multi-Archivo (125Q)**: Carga múltiples archivos a la vez. El sistema consolida la bancada total, ejecuta el algoritmo de mezcla **Fisher-Yates** y selecciona un subconjunto aleatorio de **hasta 125 preguntas** (formato oficial de examen).

### 🎨 3. Interfaz Cyberpunk HUD & Audio Sintético
- **Estética Terminal**: Efectos de scanlines, esquemas de color neón (Cian, Verde Matrix, Púrpura Cyber y Ámbar Eléctrico) y tipografía `Fira Code`.
- **Efectos de Sonido Sintéticos**: Retroalimentación auditiva construida con la **Web Audio API** para clics, selección, respuestas correctas/incorrectas y victoria.
- **Navegador de Preguntas Rápido**: Grid desplegable para saltar a cualquier pregunta en tiempo real e inspeccionar su estado (Respondida / Correcta / Incorrecta).

### 📊 4. Panel de Métricas & Estadísticas
- Porcentaje de precisión general y desglose numérico.
- Cronómetro de tiempo transcurrido en tiempo real.
- Repetición inteligente: Posibilidad de **reintentar solo las preguntas falladas**.
- Celebración visual con fuegos artificiales de confeti (`canvas-confetti`) al aprobar el examen.

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Descripción |
|---|---|
| ⚛️ **React 19** | Biblioteca de interfaz de usuario reactiva |
| ⚡ **Vite 8** | Entorno de desarrollo ultrarrápido y empaquetador |
| 🎨 **Tailwind CSS v4** | Framework de estilos utilitarios con clases personalizadas neón |
| 🛡️ **Lucide React** | Conjunto de iconos vectoriales modernos |
| 🔊 **Web Audio API** | Generación de efectos de sonido sin dependencias externas pesadas |
| 🎊 **Canvas Confetti** | Efectos visuales interactivos para metas alcanzadas |

---

## 🚀 Inicio Rápido

### Prerrequisitos

Asegúrate de tener instalado **Node.js** (versión 18 o superior) y **npm**.

### Instalación

1. **Clona este repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/CEH.git
   cd CEH
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. Abre tu navegador en `http://localhost:5173`.

---

## 📄 Formato Compatible de Preguntas

El parser integrado está diseñado para procesar bloques de texto con la siguiente estructura básica:

```text
QUESTION 1
Which tool is used for active network reconnaissance and port scanning?

A. Wireshark
B. Nmap
C. John the Ripper
D. Nikto

Answer: B
Explanation: Nmap is an open-source tool used for network discovery and vulnerability scanning.
```

> **Tip:** También soporta variaciones en formato como `Question 1:`, `Respuesta: B`, `Correct Answer: B`, `Explicación: ...`, etc.

</div>
