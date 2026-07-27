// Static UI chrome strings — everything that isn't sourced from content/.
// Content strings (techniques, drills, prose, tag legend) come from src/data/guide.<lang>.json.

export type Lang = "en" | "es";

export interface UiStrings {
  nav: {
    guide: string;
    techniques: string;
    drills: string;
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
  };
  drills: {
    randomButton: string;
    randomHeading: string;
    pickAgain: string;
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
}

const en: UiStrings = {
  nav: {
    guide: "Guide",
    techniques: "Techniques",
    drills: "Drills",
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
  },
  drills: {
    randomButton: "Random drill",
    randomHeading: "Today's drill",
    pickAgain: "Pick another",
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
    exportButton: "Export as JSON",
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
};

const es: UiStrings = {
  nav: {
    guide: "Guía",
    techniques: "Técnicas",
    drills: "Ejercicios",
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
  },
  drills: {
    randomButton: "Ejercicio aleatorio",
    randomHeading: "Ejercicio de hoy",
    pickAgain: "Elegir otro",
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
    exportButton: "Exportar como JSON",
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
};

export const ui = { en, es };
