/**
 * FUNDACIÓN CONASED - Inteligencia Artificial para Educadores
 * Lógica interactiva compartida: Navegación, Simulador de Tokens, Laboratorio de Prompts y Portapapeles
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Menú Móvil Hamburguesa ---
  const navToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });
  }

  // --- 2. Simulador Interactivo de Tokens (Módulo 1) ---
  const tokenInput = document.getElementById('tokenInput');
  const tokenCountEl = document.getElementById('tokenCount');
  const wordCountEl = document.getElementById('wordCount');
  const charCountEl = document.getElementById('charCount');
  const memoryPctEl = document.getElementById('memoryPct');
  const tokenVisualEl = document.getElementById('tokenVisual');

  if (tokenInput && tokenCountEl && tokenVisualEl) {
    function segmentIntoTokens(text) {
      if (!text || text.trim() === '') return [];
      
      // Tokenizador aproximado para español/inglés: divide por palabras y subfragmentos de ~3-4 letras
      const words = text.split(/(\s+|[.,;:!?¿¡()\-"'])/).filter(Boolean);
      const tokens = [];

      words.forEach(w => {
        if (/^\s+$/.test(w)) {
          // Espacios como token o adjunto
          tokens.push(w);
        } else if (w.length <= 4) {
          tokens.push(w);
        } else {
          // Fragmentación aproximada en sílabas o subpalabras de 3 a 4 caracteres
          let i = 0;
          while (i < w.length) {
            let chunkLen = (w.length - i <= 5) ? (w.length - i) : (w.length - i >= 6 ? 4 : 3);
            tokens.push(w.slice(i, i + chunkLen));
            i += chunkLen;
          }
        }
      });
      return tokens;
    }

    function updateTokenStats() {
      const text = tokenInput.value;
      const chars = text.length;
      const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
      const tokens = segmentIntoTokens(text);
      const tokenCount = tokens.length;

      charCountEl.textContent = chars;
      wordCountEl.textContent = words;
      tokenCountEl.textContent = tokenCount;

      // Estimación de memoria de contexto sobre 8,000 tokens base
      if (memoryPctEl) {
        const pct = Math.min(100, ((tokenCount / 8000) * 100)).toFixed(2);
        memoryPctEl.textContent = `${pct}%`;
      }

      // Visualización gráfica
      tokenVisualEl.innerHTML = '';
      if (tokens.length === 0) {
        tokenVisualEl.innerHTML = '<span class="text-muted" style="font-size:0.9rem; font-style:italic;"><i class="fa-solid fa-i-cursor"></i> Escribe cualquier texto pedagógico arriba para observar cómo la IA lo fragmenta en tokens...</span>';
        return;
      }

      tokens.forEach((t, index) => {
        const span = document.createElement('span');
        span.className = 'token-pill';
        span.textContent = t === ' ' ? '·' : t;
        span.title = `Token #${index + 1}: "${t}"`;
        tokenVisualEl.appendChild(span);
      });
    }

    tokenInput.addEventListener('input', updateTokenStats);
    // Ejecución inicial
    updateTokenStats();
  }

  // --- 3. Laboratorio de Prompts - Tabs (Módulo 2) ---
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  if (tabButtons.length > 0 && tabPanes.length > 0) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');

        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const activePane = document.getElementById(targetId);
        if (activePane) activePane.classList.add('active');
      });
    });
  }

  // --- 4. Botón Copiar al Portapapeles ---
  const copyButtons = document.querySelectorAll('.btn-copy');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSelector = btn.getAttribute('data-copy-target');
      const targetEl = document.querySelector(targetSelector);

      if (targetEl) {
        const textToCopy = (targetEl.innerText || targetEl.textContent || '').trim();
        const markCopied = () => {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = '<i class="fa-solid fa-check"></i> ¡Copiado!';
          btn.style.backgroundColor = 'var(--accent-emerald)';

          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.backgroundColor = '';
          }, 2000);
        };

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(textToCopy).then(markCopied).catch(() => {
            // Fallback execCommand
            fallbackCopy(textToCopy, markCopied);
          });
        } else {
          fallbackCopy(textToCopy, markCopied);
        }
      }
    });
  });

  function fallbackCopy(text, onSuccess) {
    try {
      const tempArea = document.createElement('textarea');
      tempArea.value = text;
      tempArea.style.position = 'fixed';
      tempArea.style.opacity = '0';
      document.body.appendChild(tempArea);
      tempArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempArea);
      if (typeof onSuccess === 'function') onSuccess();
    } catch (e) {
      // silencioso para no ensuciar consola
    }
  }

  // --- 5. Selector Interactivo del Taller de Arte (Módulo 4) ---
  const artStyleSelect = document.getElementById('artStyleSelect');
  const artPromptPreview = document.getElementById('artPromptPreview');
  const artResultNote = document.getElementById('artResultNote');
  const stylePickerButtons = document.querySelectorAll('.btn-style-picker');
  const stylePromptDisplay = document.getElementById('style-prompt-display');

  const artPresets = {
    cliche: {
      prompt: 'Crea una imagen de un personaje fantástico viviendo una aventura.',
      note: '<strong style="color: var(--accent-amber);"><i class="fa-solid fa-triangle-exclamation"></i> Enfoque Automático (Slop):</strong> La IA genera por estadística un guerrero medieval genérico con armadura brillante y un dragón en un bosque. Cero criterio propio del estudiante.',
      bgGlow: 'rgba(231, 111, 81, 0.15)'
    },
    botanica: {
      prompt: 'Ilustración estilo acuarela sobre papel texturizado con trazos sueltos de tinta china. Un joven aprendiz de botánica de 12 años, de rasgos andinos y poncho tradicional, descubriendo una flor luminosa en una caverna oscura. Expresión de asombro y delicadeza. Iluminación tenue y mágica que emana de los pétalos con reflejos dorados. Paleta de colores fríos con acentos cálidos. Encuadre en plano medio.',
      note: '<strong style="color: var(--accent-emerald);"><i class="fa-solid fa-circle-check"></i> Enfoque Taller de Arte:</strong> El alumno investigó botánica, técnicas de acuarela, planos fotográficos y contrastes de luz. La IA es el pincel; el criterio y la creatividad son 100% humanos.',
      bgGlow: 'rgba(6, 214, 160, 0.15)'
    },
    acuarela: {
      prompt: 'Ilustración estilo acuarela sobre papel texturizado con trazos sueltos de tinta china. Un joven aprendiz de botánica de 12 años, de rasgos andinos y poncho tradicional, descubriendo una flor luminosa en una caverna oscura. Expresión de asombro y delicadeza. Iluminación tenue y mágica que emana de los pétalos con reflejos dorados. Paleta de colores fríos con acentos cálidos. Encuadre en plano medio.',
      note: '<strong style="color: var(--accent-emerald);"><i class="fa-solid fa-circle-check"></i> Enfoque Taller de Arte:</strong> El alumno investigó botánica, técnicas de acuarela, planos fotográficos y contrastes de luz. La IA es el pincel; el criterio y la creatividad son 100% humanos.',
      bgGlow: 'rgba(6, 214, 160, 0.15)'
    },
    comic: {
      prompt: 'Ilustración estilo cómic europeo retro de los años 80, técnica de línea clara (Ligne Claire) con colores planos saturados. Una joven mecánica de 14 años reparando el ala de un planeador solar en un taller desértico. Expresión de concentración, sombras proyectadas por el sol del mediodía y detalles mecánicos precisos en primer plano.',
      note: '<strong style="color: var(--accent-emerald);"><i class="fa-solid fa-circle-check"></i> Enfoque Gráfico e Histórico:</strong> Comprensión del movimiento de línea clara franco-belga, teoría del color plano y narrativa visual.',
      bgGlow: 'rgba(0, 150, 199, 0.15)'
    },
    claroscuro: {
      prompt: 'Pintura digital estilo óleo barroco con técnica de claroscuro dramático (tenebrismo a lo Caravaggio). Un anciano guardián de faro con rostro curtido descifrando un mapa de constelaciones iluminado únicamente por la llama temblorosa de una vela. Fuertes contrastes de sombras profundas y tonos ámbar cálidos.',
      note: '<strong style="color: var(--accent-emerald);"><i class="fa-solid fa-circle-check"></i> Enfoque Pictórico Clásico:</strong> Estudio de luz tenebrista, textura de óleo y psicología del personaje a través de la luz.',
      bgGlow: 'rgba(231, 111, 81, 0.15)'
    },
    cyberpunk: {
      prompt: 'Grabado retrofuturista estilo xilografía japonesa con toques de neón cian y magenta. Un bibliotecario anciano reparando un libro holográfico en una torre de madera sobre una ciudad flotante en noche lluviosa. Atmósfera reflexiva y melancólica.',
      note: '<strong style="color: var(--accent-emerald);"><i class="fa-solid fa-circle-check"></i> Enfoque Narrativo Profundo:</strong> Elección de paleta de color específica, conflicto sutil y fusión de estilos visuales antiguos y modernos.',
      bgGlow: 'rgba(0, 180, 216, 0.18)'
    }
  };

  if (artStyleSelect && artPromptPreview) {
    artStyleSelect.addEventListener('change', () => {
      const selected = artStyleSelect.value;
      const preset = artPresets[selected] || artPresets.cliche;
      artPromptPreview.textContent = preset.prompt;
      if (artResultNote) artResultNote.innerHTML = preset.note;
    });
  }

  if (stylePickerButtons.length > 0 && stylePromptDisplay) {
    stylePickerButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        stylePickerButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const styleKey = btn.getAttribute('data-style');
        const preset = artPresets[styleKey];
        if (preset) {
          stylePromptDisplay.textContent = preset.prompt;
        }
      });
    });
  }

  // --- 6. Demostrador Unificado de Diapositivas HTML Interactivas (Módulo 3) ---
  let currentDemoSlide = 1;
  const totalDemoSlides = 5;
  const btnDemoPrev = document.getElementById('btn-demo-prev');
  const btnDemoNext = document.getElementById('btn-demo-next');
  const demoSlideIndicator = document.getElementById('demo-slide-indicator');
  const demoProgressBar = document.getElementById('demo-progress-bar');
  const btnDemoRestart = document.getElementById('btn-demo-restart');

  const demoQuizAnswers = {
    q1: null,
    q2: null,
    q3: null
  };

  const demoQuizFeedbacks = {
    q1: {
      correct: '<span style="color: var(--accent-emerald); font-weight: 600;"><i class="fa-solid fa-circle-check"></i> ¡Exacto! James Watt incorporó el condensador separado para no enfriar el cilindro principal, multiplicando la eficiencia y logrando trabajo mecánico continuo.</span>',
      incorrect: '<span style="color: var(--accent-amber); font-weight: 600;"><i class="fa-solid fa-circle-xmark"></i> Incorrecto. La clave técnica fue separar la condensación para evitar la pérdida continua de calor en cada embolada.</span>'
    },
    q2: {
      correct: '<span style="color: var(--accent-emerald); font-weight: 600;"><i class="fa-solid fa-circle-check"></i> ¡Correcto! El vapor impulsó la concentración de la producción en fábricas mecanizadas y desató la era del ferrocarril y el barco a vapor.</span>',
      incorrect: '<span style="color: var(--accent-amber); font-weight: 600;"><i class="fa-solid fa-circle-xmark"></i> Incorrecto. El efecto histórico del vapor fue la migración a las fábricas urbanas y la aceleración radical del transporte ferroviario.</span>'
    },
    q3: {
      correct: '<span style="color: var(--accent-emerald); font-weight: 600;"><i class="fa-solid fa-circle-check"></i> ¡Brillante! Así como la máquina de vapor expandió la potencia física humana, la IA expande la potencia de procesamiento y creación cognitiva bajo dirección pedagógica.</span>',
      incorrect: '<span style="color: var(--accent-amber); font-weight: 600;"><i class="fa-solid fa-circle-xmark"></i> Incorrecto. Ambas tecnologías son herramientas de extensión humana: el vapor multiplicó la fuerza física y la IA multiplica el procesamiento cognitivo.</span>'
    }
  };

  function updateScoreSlide() {
    const scoreNumber = document.getElementById('demo-score-number');
    const scoreTitle = document.getElementById('demo-score-title');
    const scoreDesc = document.getElementById('demo-score-desc');
    const scoreBreakdown = document.getElementById('demo-score-breakdown');
    if (!scoreNumber || !scoreTitle || !scoreDesc) return;

    let score = 0;
    let answeredCount = 0;
    ['q1', 'q2', 'q3'].forEach(k => {
      if (demoQuizAnswers[k] !== null) answeredCount++;
      if (demoQuizAnswers[k] === true) score++;
    });

    scoreNumber.textContent = `${score} / 3`;

    if (answeredCount < 3) {
      scoreTitle.innerHTML = '<i class="fa-solid fa-clock" style="color: var(--accent-amber);"></i> Cuestionario Parcial';
      scoreDesc.innerHTML = `Has respondido <strong>${answeredCount} de 3 preguntas</strong>. Te sugerimos volver atrás con "Anterior" y completar todas las preguntas para obtener tu diagnóstico formativo completo.`;
      scoreNumber.style.color = 'var(--accent-amber)';
    } else if (score === 3) {
      scoreTitle.innerHTML = '<i class="fa-solid fa-crown" style="color: var(--accent-emerald);"></i> ¡Excelente trabajo!';
      scoreDesc.innerHTML = '<strong style="color: var(--accent-emerald);">Sobresaliente:</strong> Has comprendido tanto el salto técnico del vapor como su impacto social y su analogía con la IA. ¡Dominas los conceptos a la perfección!';
      scoreNumber.style.color = 'var(--accent-emerald)';
    } else if (score === 2) {
      scoreTitle.innerHTML = '<i class="fa-solid fa-thumbs-up" style="color: var(--conased-cyan-bright);"></i> ¡Has hecho un buen trabajo!';
      scoreDesc.innerHTML = '<strong style="color: var(--conased-cyan-bright);">Buen desempeño:</strong> Tienes una base sólida sobre la temática. Te recomendamos revisar el concepto específico en el que dudaste para afianzar el dominio total.';
      scoreNumber.style.color = 'var(--conased-cyan-bright)';
    } else {
      scoreTitle.innerHTML = '<i class="fa-solid fa-book-open-reader" style="color: var(--accent-amber);"></i> Debe repasar más este tema';
      scoreDesc.innerHTML = '<strong style="color: var(--accent-amber);">Requiere repaso:</strong> Te recomendamos volver a leer la diapositiva introductoria para afianzar cómo el condensador de James Watt transformó la energía térmica en fuerza motriz continua.';
      scoreNumber.style.color = 'var(--accent-amber)';
    }

    if (scoreBreakdown) {
      const qLabels = ['1. Principio Técnico de Watt', '2. Transformación Productiva', '3. Paralelismo con la IA'];
      const keys = ['q1', 'q2', 'q3'];
      scoreBreakdown.innerHTML = keys.map((k, i) => {
        const val = demoQuizAnswers[k];
        let statusHtml = '<span style="color: var(--text-muted-light);"><i class="fa-solid fa-minus"></i> Sin responder</span>';
        if (val === true) statusHtml = '<span style="color: var(--accent-emerald); font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Correcta (+1)</span>';
        if (val === false) statusHtml = '<span style="color: var(--accent-amber); font-weight: 600;"><i class="fa-solid fa-circle-xmark"></i> Incorrecta (0)</span>';
        return `<div style="background: rgba(0, 56, 84, 0.4); padding: 0.5rem 0.85rem; border-radius: 6px; font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(0, 180, 216, 0.15);">
          <span style="color: var(--conased-ice);">${qLabels[i]}</span>
          ${statusHtml}
        </div>`;
      }).join('');
    }
  }

  function updateDemoSlide(newSlide) {
    if (newSlide < 1 || newSlide > totalDemoSlides) return;
    currentDemoSlide = newSlide;
    for (let i = 1; i <= totalDemoSlides; i++) {
      const slideEl = document.getElementById(`demo-slide-${i}`);
      if (slideEl) {
        slideEl.style.display = (i === currentDemoSlide) ? 'block' : 'none';
      }
    }

    if (demoSlideIndicator) {
      demoSlideIndicator.textContent = `Diapositiva ${currentDemoSlide} de ${totalDemoSlides}`;
    }

    if (demoProgressBar) {
      const pct = (currentDemoSlide / totalDemoSlides) * 100;
      demoProgressBar.style.width = `${pct}%`;
    }

    if (btnDemoPrev) {
      btnDemoPrev.disabled = (currentDemoSlide === 1);
    }

    if (btnDemoNext) {
      if (currentDemoSlide === totalDemoSlides - 1) {
        btnDemoNext.disabled = false;
        btnDemoNext.innerHTML = 'Ver Resultados <i class="fa-solid fa-trophy"></i>';
      } else if (currentDemoSlide === totalDemoSlides) {
        btnDemoNext.disabled = true;
        btnDemoNext.innerHTML = '<i class="fa-solid fa-check"></i> Fin de la Clase';
      } else {
        btnDemoNext.disabled = false;
        btnDemoNext.innerHTML = 'Siguiente <i class="fa-solid fa-chevron-right"></i>';
      }
    }

    if (currentDemoSlide === totalDemoSlides) {
      updateScoreSlide();
    }
  }

  ['q1', 'q2', 'q3'].forEach(qKey => {
    const btns = document.querySelectorAll(`.demo-quiz-btn[data-question="${qKey}"]`);
    const feedbackEl = document.getElementById(`demo-quiz-feedback-${qKey}`);

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => {
          b.style.backgroundColor = '';
          b.style.borderColor = '';
          b.style.color = '';
        });

        const isCorrect = btn.getAttribute('data-correct') === 'true';
        demoQuizAnswers[qKey] = isCorrect;

        if (isCorrect) {
          btn.style.backgroundColor = 'rgba(6, 214, 160, 0.2)';
          btn.style.borderColor = 'var(--accent-emerald)';
          btn.style.color = '#a7f3d0';
          if (feedbackEl && demoQuizFeedbacks[qKey]) feedbackEl.innerHTML = demoQuizFeedbacks[qKey].correct;
        } else {
          btn.style.backgroundColor = 'rgba(231, 111, 81, 0.2)';
          btn.style.borderColor = 'var(--accent-amber)';
          btn.style.color = '#fca5a5';
          if (feedbackEl && demoQuizFeedbacks[qKey]) feedbackEl.innerHTML = demoQuizFeedbacks[qKey].incorrect;
        }
      });
    });
  });

  if (btnDemoPrev && btnDemoNext) {
    btnDemoPrev.addEventListener('click', () => {
      updateDemoSlide(currentDemoSlide - 1);
    });
    btnDemoNext.addEventListener('click', () => {
      updateDemoSlide(currentDemoSlide + 1);
    });
  }

  if (btnDemoRestart) {
    btnDemoRestart.addEventListener('click', () => {
      ['q1', 'q2', 'q3'].forEach(qKey => {
        demoQuizAnswers[qKey] = null;
        const btns = document.querySelectorAll(`.demo-quiz-btn[data-question="${qKey}"]`);
        const feedbackEl = document.getElementById(`demo-quiz-feedback-${qKey}`);
        btns.forEach(b => {
          b.style.backgroundColor = '';
          b.style.borderColor = '';
          b.style.color = '';
        });
        if (feedbackEl) feedbackEl.innerHTML = '';
      });
      updateDemoSlide(1);
    });
  }

  // --- 10. Cerrojo Interactivo de Apertura (Módulo 1) ---
  const unlockQuestionCard = document.getElementById('unlockQuestionCard');
  const cerrojoTriggerBtn = document.getElementById('cerrojoTriggerBtn');
  const cerrojoIcon = document.getElementById('cerrojoIcon');

  if (unlockQuestionCard && cerrojoTriggerBtn) {
    cerrojoTriggerBtn.addEventListener('click', () => {
      // 1. Fase de desbloqueo del candado (cambio de icono y brillo)
      unlockQuestionCard.classList.add('unlocking');
      if (cerrojoIcon) {
        cerrojoIcon.className = 'fa-solid fa-lock-open';
      }

      // 2. Fase de barrido lateral de persianas hacia los costados
      setTimeout(() => {
        unlockQuestionCard.classList.add('unlocked');
        unlockQuestionCard.classList.remove('unlocking');
      }, 320);
    });
  }
});


