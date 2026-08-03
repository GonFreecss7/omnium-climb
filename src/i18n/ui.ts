// Static UI chrome strings — everything that isn't sourced from content/.
// Content strings (techniques, drills, prose, tag legend) come from src/data/guide.<lang>.json.

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
    tagHeading: string;
    categoryHeading: string;
    clear: string;
    activeHeading: string;
    removeAriaLabel: string;
    tagLabels: {
      core: string;
      later: string;
      advanced: string;
      caution: string;
    };
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
    tagHeading: "Tag",
    categoryHeading: "Category",
    clear: "Clear filters",
    activeHeading: "Active filters",
    removeAriaLabel: "Remove filter",
    tagLabels: {
      core: "Core",
      later: "Later",
      advanced: "Advanced",
      caution: "Caution",
    },
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
    hardestPlaceholder: "e.g. V3",
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
    noData: "No parseable grade yet",
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
    tagHeading: "Etiqueta",
    categoryHeading: "Categoría",
    clear: "Limpiar filtros",
    activeHeading: "Filtros activos",
    removeAriaLabel: "Quitar filtro",
    tagLabels: {
      core: "Base",
      later: "Después",
      advanced: "Avanzado",
      caution: "Precaución",
    },
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
    hardestPlaceholder: "p. ej. V3",
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
    noData: "Todavía sin ningún grado interpretable",
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
  },
};

export const ui = { en, es };
