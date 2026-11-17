// Static UI chrome strings — everything that isn't sourced from content/.
// Content strings (techniques, drills, prose, level legend) come from src/data/guide.<lang>.json.

import type { Experience, Level, LevelSource, Relevance } from "../domain/levels";

export type Lang = "en" | "es";

export interface UiStrings {
  nav: {
    guide: string;
    techniques: string;
    drills: string;
    progressions: string;
    session: string;
    ariaLabel: string;
  };
  header: {
    langToggleAriaLabel: string;
    themeToggleAriaLabel: string;
    themeDark: string;
    themeLight: string;
  };
  search: {
    placeholder: string;
    ariaLabel: string;
    noResults: string;
  };
  filters: {
    levelHeading: string;
    forMyLevel: string;
    cautionOnly: string;
    categoryHeading: string;
    clear: string;
    activeHeading: string;
    removeAriaLabel: string;
  };
  technique: {
    expand: string;
    collapse: string;
    nonstandardLabel: string;
    nonstandardHint: string;
    howLabel: string;
    bestLabel: string;
    randomButton: string;
    randomHeading: string;
  };
  drills: {
    randomButton: string;
    randomHeading: string;
    pickAgain: string;
    searchPlaceholder: string;
    searchAriaLabel: string;
    noResults: string;
  };
  relations: {
    relatedDrills: string;
    relatedTechniques: string;
  };
  favorites: {
    add: string;
    remove: string;
    filterLabel: string;
  };
  sessionLog: {
    heading: string;
    dateLabel: string;
    drillLabel: string;
    drillPlaceholder: string;
    hardestLabel: string;
    hardestPlaceholder: string;
    disciplineLabel: string;
    elbowLabel: string;
    elbowBetter: string;
    elbowSame: string;
    elbowWorse: string;
    noteLabel: string;
    notePlaceholder: string;
    addButton: string;
    exportButton: string;
    exportFormatAriaLabel: string;
    emptyMessage: string;
  };
  stats: {
    heading: string;
    sessionsLogged: string;
    highestGrade: string;
    recentGrades: string;
    mostUsedDrill: string;
    recentElbow: string;
    noData: string;
  };
  notes: {
    label: string;
    placeholder: string;
    saved: string;
    unsaved: string;
  };
  warmup: {
    openButton: string;
    heading: string;
    categoriesLabel: string;
    generateButton: string;
    regenerateButton: string;
    rerollOneAriaLabel: string;
    closeAriaLabel: string;
    emptyHint: string;
  };
  checklist: {
    openButton: string;
    selectHeading: string;
    techniquesHeading: string;
    drillsHeading: string;
    generateButton: string;
    backButton: string;
    resultHeading: string;
    shareButton: string;
    copyButton: string;
    copiedConfirmation: string;
    emptyHint: string;
    closeAriaLabel: string;
    printOnly: string;
  };
  progressionsView: {
    heading: string;
    subheading: string;
    techniquesLabel: string;
    drillsLabel: string;
    yourStage: string;
  };
  levels: Record<Level, string>;
  relevance: Record<Relevance, string>;
  caution: {
    label: string;
    aboveLevel: string;
    injured: string;
  };
  levelBlock: {
    prefix: string;
  };
  profile: {
    buttonAriaLabel: string;
    setUp: string;
  };
  onboarding: {
    title: string;
    intro: string;
    privacy: string;
    start: string;
    skip: string;
    next: string;
    back: string;
    save: string;
    closeAriaLabel: string;
    step: string;
    disciplinesQuestion: string;
    boulder: string;
    rope: string;
    scaleQuestion: string;
    gradeQuestion: string;
    gradeHint: string;
    gradeUnknown: string;
    experienceQuestion: string;
    experience: Record<Experience, string>;
    sessionsQuestion: string;
    bodyQuestion: string;
    weight: string;
    height: string;
    bodyHint: string;
    injuryQuestion: string;
    yes: string;
    no: string;
    resultTitle: string;
    source: Record<LevelSource, string>;
    capped: string;
    overrideLabel: string;
    overrideAuto: string;
    bandsNote: string;
    deleteProfile: string;
    deleteConfirm: string;
    pickOne: string;
  };
  levelUp: {
    title: string;
    body: (grade: string, previous: string) => string;
    update: string;
    dismiss: string;
  };
}

const en: UiStrings = {
  nav: {
    guide: "Guide",
    techniques: "Techniques",
    drills: "Drills",
    progressions: "Progression",
    session: "Session",
    ariaLabel: "Primary navigation",
  },
  header: {
    langToggleAriaLabel: "Switch language",
    themeToggleAriaLabel: "Switch theme",
    themeDark: "Dark",
    themeLight: "Light",
  },
  search: {
    placeholder: "Search techniques…",
    ariaLabel: "Search techniques",
    noResults: "No techniques match your search or filters.",
  },
  filters: {
    levelHeading: "Level",
    forMyLevel: "For my level",
    cautionOnly: "Injury risk",
    categoryHeading: "Category",
    clear: "Clear filters",
    activeHeading: "Active filters",
    removeAriaLabel: "Remove filter",
  },
  technique: {
    expand: "Show details",
    collapse: "Hide details",
    nonstandardLabel: "Nonstandard name",
    nonstandardHint: "tap the asterisk for an explanation",
    howLabel: "How",
    bestLabel: "Best for",
    randomButton: "Random technique",
    randomHeading: "Today's technique",
  },
  drills: {
    randomButton: "Random drill",
    randomHeading: "Today's drill",
    pickAgain: "Pick another",
    searchPlaceholder: "Search drills…",
    searchAriaLabel: "Search drills",
    noResults: "No drills match your search or filters.",
  },
  relations: {
    relatedDrills: "Related drills",
    relatedTechniques: "Related techniques",
  },
  favorites: {
    add: "Add to favorites",
    remove: "Remove from favorites",
    filterLabel: "Favorites",
  },
  sessionLog: {
    heading: "Session Log",
    dateLabel: "Date",
    drillLabel: "Drill used",
    drillPlaceholder: "Select a drill",
    hardestLabel: "Hardest problem climbed cleanly",
    hardestPlaceholder: "Select a grade",
    disciplineLabel: "Discipline",
    elbowLabel: "Niggles vs. last session",
    elbowBetter: "Better",
    elbowSame: "Same",
    elbowWorse: "Worse",
    noteLabel: "One technical thing that felt different",
    notePlaceholder: "Optional",
    addButton: "Add entry",
    exportButton: "Export",
    exportFormatAriaLabel: "Export file format",
    emptyMessage: "No sessions logged yet.",
  },
  stats: {
    heading: "Progress",
    sessionsLogged: "Sessions logged",
    highestGrade: "Highest grade climbed cleanly",
    recentGrades: "Recent grades",
    mostUsedDrill: "Most-used drill",
    recentElbow: "Recent niggles",
    noData: "No grade logged yet",
  },
  notes: {
    label: "Personal note",
    placeholder: "Cues, reminders, anything you want to remember about this move…",
    saved: "Saved",
    unsaved: "Saving…",
  },
  warmup: {
    openButton: "Warm-up generator",
    heading: "Warm-up",
    categoriesLabel: "Categories",
    generateButton: "Generate warm-up",
    regenerateButton: "New warm-up",
    rerollOneAriaLabel: "Swap this drill",
    closeAriaLabel: "Close warm-up generator",
    emptyHint: "Pick at least one category.",
  },
  checklist: {
    openButton: "Session checklist",
    selectHeading: "Build a session checklist",
    techniquesHeading: "Techniques",
    drillsHeading: "Drills",
    generateButton: "Generate checklist",
    backButton: "Back to selection",
    resultHeading: "Session Checklist",
    shareButton: "Share",
    copyButton: "Copy to clipboard",
    copiedConfirmation: "Copied to clipboard",
    emptyHint: "Select at least one technique or drill.",
    closeAriaLabel: "Close session checklist",
    printOnly: "Generated by Climb Guide — for personal use.",
  },
  progressionsView: {
    heading: "Suggested Learning Progression",
    subheading: "A rough order to learn things in, grouping techniques and drills together instead of the flat category list. Not a strict ladder — dip back into earlier stages any time.",
    techniquesLabel: "Techniques",
    drillsLabel: "Drills",
    yourStage: "Your stage",
  },
  levels: {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    elite: "Elite",
  },
  relevance: {
    mastered: "Should be solid",
    current: "Your level",
    next: "Next step",
    later: "Further ahead",
  },
  caution: {
    label: "Injury risk",
    aboveLevel: "Above your current level — introducing it now carries a high injury risk.",
    injured: "You reported current pain or an injury: avoid this move until it has settled.",
  },
  levelBlock: {
    prefix: "For",
  },
  profile: {
    buttonAriaLabel: "Climber profile",
    setUp: "Profile",
  },
  onboarding: {
    title: "Your climbing profile",
    intro: "A few questions so recommendations, injury warnings and grades match how you climb — from first session to elite.",
    privacy: "Everything stays on this device. No account, no server.",
    start: "Start",
    skip: "Skip for now",
    next: "Next",
    back: "Back",
    save: "Save profile",
    closeAriaLabel: "Close profile",
    step: "Step",
    disciplinesQuestion: "What do you climb?",
    boulder: "Boulder",
    rope: "Rope (lead / top rope)",
    scaleQuestion: "Which grade scale does your gym use?",
    gradeQuestion: "Hardest grade you climb reliably",
    gradeHint: "Not a one-off — something you can repeat in most sessions.",
    gradeUnknown: "Not sure / just starting",
    experienceQuestion: "How long have you been climbing?",
    experience: {
      lt1: "Less than 1 year",
      "1to2": "1–2 years",
      "3to5": "3–5 years",
      gt5: "More than 5 years",
    },
    sessionsQuestion: "Sessions per week",
    bodyQuestion: "Body (optional)",
    weight: "Weight (kg)",
    height: "Height (cm)",
    bodyHint: "Used for load-based strength recommendations. Leave blank if you prefer.",
    injuryQuestion: "Any current pain or injury?",
    yes: "Yes",
    no: "No",
    resultTitle: "Your level",
    source: {
      grade: "Based on your hardest grade.",
      experience: "Based on your experience (no grade given).",
      override: "Set manually.",
    },
    capped: "Held at Intermediate during the first year: tendons and pulleys adapt more slowly than muscle.",
    overrideLabel: "Adjust manually",
    overrideAuto: "Automatic",
    bandsNote: "Bands — Beginner: up to V2 / 5.10a (6a). Intermediate: V3–V5 / 5.10b–5.11d (6a+–7a). Advanced: V6–V8 / 5.12a–5.13a (7a+–7c+). Elite: V9 / 5.13b (8a) and up.",
    deleteProfile: "Delete profile",
    deleteConfirm: "Tap again to confirm",
    pickOne: "Pick at least one.",
  },
  levelUp: {
    title: "You logged a harder grade",
    body: (grade, previous) => `Your recent sessions include ${grade}, above the ${previous} in your profile.`,
    update: "Update profile",
    dismiss: "Not now",
  },
};

const es: UiStrings = {
  nav: {
    guide: "Guía",
    techniques: "Técnicas",
    drills: "Ejercicios",
    progressions: "Progresión",
    session: "Sesión",
    ariaLabel: "Navegación principal",
  },
  header: {
    langToggleAriaLabel: "Cambiar idioma",
    themeToggleAriaLabel: "Cambiar tema",
    themeDark: "Oscuro",
    themeLight: "Claro",
  },
  search: {
    placeholder: "Buscar técnicas…",
    ariaLabel: "Buscar técnicas",
    noResults: "Ninguna técnica coincide con tu búsqueda o filtros.",
  },
  filters: {
    levelHeading: "Nivel",
    forMyLevel: "Para mi nivel",
    cautionOnly: "Riesgo de lesión",
    categoryHeading: "Categoría",
    clear: "Limpiar filtros",
    activeHeading: "Filtros activos",
    removeAriaLabel: "Quitar filtro",
  },
  technique: {
    expand: "Mostrar detalles",
    collapse: "Ocultar detalles",
    nonstandardLabel: "Nombre no estandarizado",
    nonstandardHint: "toca el asterisco para ver la explicación",
    howLabel: "Cómo",
    bestLabel: "Ideal para",
    randomButton: "Técnica aleatoria",
    randomHeading: "Técnica de hoy",
  },
  drills: {
    randomButton: "Ejercicio aleatorio",
    randomHeading: "Ejercicio de hoy",
    pickAgain: "Elegir otro",
    searchPlaceholder: "Buscar ejercicios…",
    searchAriaLabel: "Buscar ejercicios",
    noResults: "Ningún ejercicio coincide con tu búsqueda o filtros.",
  },
  relations: {
    relatedDrills: "Ejercicios relacionados",
    relatedTechniques: "Técnicas relacionadas",
  },
  favorites: {
    add: "Añadir a favoritos",
    remove: "Quitar de favoritos",
    filterLabel: "Favoritos",
  },
  sessionLog: {
    heading: "Registro de sesión",
    dateLabel: "Fecha",
    drillLabel: "Ejercicio usado",
    drillPlaceholder: "Selecciona un ejercicio",
    hardestLabel: "Problema más difícil encadenado limpio",
    hardestPlaceholder: "Elige un grado",
    disciplineLabel: "Disciplina",
    elbowLabel: "Molestias frente a la última sesión",
    elbowBetter: "Mejor",
    elbowSame: "Igual",
    elbowWorse: "Peor",
    noteLabel: "Algo técnico que se sintió diferente",
    notePlaceholder: "Opcional",
    addButton: "Añadir registro",
    exportButton: "Exportar",
    exportFormatAriaLabel: "Formato del archivo de exportación",
    emptyMessage: "Todavía no has registrado ninguna sesión.",
  },
  stats: {
    heading: "Progreso",
    sessionsLogged: "Sesiones registradas",
    highestGrade: "Grado más alto encadenado limpio",
    recentGrades: "Grados recientes",
    mostUsedDrill: "Ejercicio más usado",
    recentElbow: "Molestias recientes",
    noData: "Aún sin grados registrados",
  },
  notes: {
    label: "Nota personal",
    placeholder: "Claves, recordatorios, cualquier cosa que quieras recordar sobre este movimiento…",
    saved: "Guardado",
    unsaved: "Guardando…",
  },
  warmup: {
    openButton: "Generador de calentamiento",
    heading: "Calentamiento",
    categoriesLabel: "Categorías",
    generateButton: "Generar calentamiento",
    regenerateButton: "Nuevo calentamiento",
    rerollOneAriaLabel: "Cambiar este ejercicio",
    closeAriaLabel: "Cerrar el generador de calentamiento",
    emptyHint: "Elige al menos una categoría.",
  },
  checklist: {
    openButton: "Lista de sesión",
    selectHeading: "Arma una lista para tu sesión",
    techniquesHeading: "Técnicas",
    drillsHeading: "Ejercicios",
    generateButton: "Generar lista",
    backButton: "Volver a la selección",
    resultHeading: "Lista de Sesión",
    shareButton: "Compartir",
    copyButton: "Copiar al portapapeles",
    copiedConfirmation: "Copiado al portapapeles",
    emptyHint: "Selecciona al menos una técnica o ejercicio.",
    closeAriaLabel: "Cerrar la lista de sesión",
    printOnly: "Generado por Climb Guide — para uso personal.",
  },
  progressionsView: {
    heading: "Progresión de Aprendizaje Sugerida",
    subheading: "Un orden aproximado para ir aprendiendo, agrupando técnicas y ejercicios en vez de la lista plana por categoría. No es una escalera estricta — vuelve a etapas anteriores cuando quieras.",
    techniquesLabel: "Técnicas",
    drillsLabel: "Ejercicios",
    yourStage: "Tu etapa",
  },
  levels: {
    beginner: "Iniciación",
    intermediate: "Intermedio",
    advanced: "Avanzado",
    elite: "Élite",
  },
  relevance: {
    mastered: "Debería ser sólida",
    current: "Tu nivel",
    next: "Siguiente paso",
    later: "Más adelante",
  },
  caution: {
    label: "Riesgo de lesión",
    aboveLevel: "Por sobre tu nivel actual: introducirla ahora tiene un riesgo alto de lesión.",
    injured: "Indicaste dolor o una lesión: evita este movimiento hasta que se haya resuelto.",
  },
  levelBlock: {
    prefix: "Para",
  },
  profile: {
    buttonAriaLabel: "Perfil de escalador",
    setUp: "Perfil",
  },
  onboarding: {
    title: "Tu perfil de escalada",
    intro: "Unas preguntas para que las recomendaciones, los avisos de lesión y los grados se ajusten a cómo escalas, desde la primera sesión hasta el nivel élite.",
    privacy: "Todo queda en este dispositivo. Sin cuenta ni servidor.",
    start: "Empezar",
    skip: "Omitir por ahora",
    next: "Siguiente",
    back: "Atrás",
    save: "Guardar perfil",
    closeAriaLabel: "Cerrar perfil",
    step: "Paso",
    disciplinesQuestion: "¿Qué escalas?",
    boulder: "Boulder",
    rope: "Cuerda (punta / top rope)",
    scaleQuestion: "¿Qué escala de grados usa tu gimnasio?",
    gradeQuestion: "Grado más difícil que encadenas con regularidad",
    gradeHint: "No algo puntual: lo que puedes repetir en la mayoría de las sesiones.",
    gradeUnknown: "No lo sé / recién empiezo",
    experienceQuestion: "¿Cuánto tiempo llevas escalando?",
    experience: {
      lt1: "Menos de 1 año",
      "1to2": "1–2 años",
      "3to5": "3–5 años",
      gt5: "Más de 5 años",
    },
    sessionsQuestion: "Sesiones por semana",
    bodyQuestion: "Cuerpo (opcional)",
    weight: "Peso (kg)",
    height: "Altura (cm)",
    bodyHint: "Se usa para recomendaciones de fuerza basadas en carga. Déjalo en blanco si prefieres.",
    injuryQuestion: "¿Tienes dolor o alguna lesión actualmente?",
    yes: "Sí",
    no: "No",
    resultTitle: "Tu nivel",
    source: {
      grade: "Según tu grado más difícil.",
      experience: "Según tu experiencia (sin grado indicado).",
      override: "Definido manualmente.",
    },
    capped: "Se mantiene en Intermedio durante el primer año: tendones y poleas se adaptan más lento que el músculo.",
    overrideLabel: "Ajustar manualmente",
    overrideAuto: "Automático",
    bandsNote: "Bandas — Iniciación: hasta V2 / 5.10a (6a). Intermedio: V3–V5 / 5.10b–5.11d (6a+–7a). Avanzado: V6–V8 / 5.12a–5.13a (7a+–7c+). Élite: desde V9 / 5.13b (8a).",
    deleteProfile: "Borrar perfil",
    deleteConfirm: "Toca otra vez para confirmar",
    pickOne: "Elige al menos una opción.",
  },
  levelUp: {
    title: "Registraste un grado más difícil",
    body: (grade, previous) => `Tus sesiones recientes incluyen ${grade}, por sobre el ${previous} de tu perfil.`,
    update: "Actualizar perfil",
    dismiss: "Ahora no",
  },
};

export const ui = { en, es };
