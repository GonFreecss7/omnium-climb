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
    gyms: string;
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
    subheading: (count: number) => string;
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
    drillNone: string;
    settingLabel: string;
    settingWall: string;
    settingBoard: string;
    boardLabel: string;
    boardOther: string;
    boardOtherName: string;
    angleLabel: string;
    climbsHeading: (rope: boolean) => string;
    addClimb: (rope: boolean) => string;
    results: Record<"flash" | "send" | "attempt", string>;
    resultLabel: string;
    attemptsLabel: string;
    attemptsUnit: (n: number) => string;
    noClimbs: string;
    saveSession: string;
    discard: string;
    discardConfirm: string;
    draftNote: string;
    wrapUpHeading: string;
    removeClimb: string;
    summary: (climbs: number, sent: number) => string;
    gradeLabel: string;
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
    ranges: Record<"30" | "90" | "all", string>;
    sentOfTried: string;
    flashRate: string;
    attemptsPerSend: string;
    pyramid: string;
    pyramidEmpty: string;
    flashes: (n: number) => string;
    timeline: string;
    weekly: string;
    weekTooltip: (start: string, climbs: number, sends: number) => string;
    wallVsBoard: (wall: number, board: number) => string;
    topBoards: string;
    topGyms: string;
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
  settings: {
    open: string;
    title: string;
    close: string;
    language: string;
    theme: string;
    profile: string;
    editProfile: string;
    createProfile: string;
    circuits: string;
    circuitsNone: string;
    levelColors: string;
    levelColorsHint: string;
    edit: string;
  };
  circuits: {
    title: string;
    intro: string;
    gymName: string;
    gymPlaceholder: string;
    newGym: string;
    deleteGym: string;
    deleteConfirm: string;
    useTemplate: string;
    startEmpty: string;
    addColor: string;
    colorName: string;
    from: string;
    to: string;
    andUp: string;
    removeColor: string;
    customColor: string;
    pickColor: string;
    save: string;
    cancel: string;
    empty: string;
    nameMissing: string;
    rangeInvalid: string;
    scaleNote: (scale: string) => string;
    logLabel: string;
    exactGrade: string;
    exactGradeAny: string;
    gymScale: string;
    colorsHeading: string;
    homeShort: string;
    isHome: string;
    makeHome: string;
    onboardingQuestion: string;
    onboardingHint: string;
    gymLabel: string;
    otherGym: string;
    otherGymName: string;
    scaleLabel: string;
    home: string;
  };
  gymsView: {
    heading: string;
    subheading: (count: number) => string;
    all: string;
    searchPlaceholder: string;
    nearMe: string;
    locating: string;
    locationError: string;
    openMaps: string;
    makeHome: string;
    save: string;
    saved: string;
    editCircuits: string;
    outdoor: string;
    noResults: string;
    mapAria: string;
    you: string;
  };
  strength: {
    modes: Record<"drills" | "strength", string>;
    startTimer: string;
    how: string;
    load: string;
    sources: string;
    protocol: (t: { hang: number; rest: number; reps: number; sets: number; setRest: number }) => string;
    customTitle: string;
    customHint: string;
    fields: Record<"prep" | "hang" | "rest" | "reps" | "sets" | "setRest", string>;
  };
  fingerTest: {
    title: string;
    log: string;
    empty: string;
    ofBodyweight: string;
    summary: (total: string, edge: number, grip: string, date: string) => string;
    delta: (points: number) => string;
    chartLabel: string;
    loadsTitle: (bw: string) => string;
    prescriptions: Record<"maxStrength" | "anaerobic", { name: string; dose: string }>;
    bodyweightOnly: string;
    pulley: (kg: string) => string;
    loadsSource: string;
    date: string;
    bodyweight: string;
    harness: string;
    modes: Record<"add" | "remove", string>;
    edge: string;
    grip: string;
    grips: Record<"half" | "open", string>;
    preview: (total: string, pct: string) => string;
    invalid: string;
    cancel: string;
    save: string;
    history: (n: number) => string;
    delete: string;
    confirmDelete: string;
    logResult: string;
  };
  timer: {
    phases: Record<"prep" | "hang" | "rest" | "setRest" | "done", string>;
    start: string;
    pause: string;
    resume: string;
    again: string;
    skip: string;
    reset: string;
    close: string;
    set: string;
    rep: string;
    left: string;
    soundOn: string;
    soundOff: string;
  };
  backup: {
    title: string;
    hint: (sessions: number) => string;
    export: string;
    restore: string;
    exported: string;
    confirmTitle: string;
    confirmBody: (file: string) => string;
    confirm: string;
    cancel: string;
    errorInvalid: string;
    errorNewer: string;
    errorStorage: string;
  };
  levelColorsEditor: {
    title: string;
    intro: string;
    reset: string;
    done: string;
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
    drills: "Train",
    progressions: "Progression",
    session: "Session",
    gyms: "Gyms",
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
    subheading: (count) => `${count} techniques, from first moves to competition setting.`,
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
    drillLabel: "Drill used (optional)",
    drillPlaceholder: "Select a drill",
    hardestLabel: "Hardest problem climbed cleanly",
    hardestPlaceholder: "Select a grade",
    disciplineLabel: "Discipline",
    drillNone: "None",
    settingLabel: "Climbed on",
    settingWall: "Gym walls",
    settingBoard: "Training board",
    boardLabel: "Board",
    boardOther: "Other board",
    boardOtherName: "Board name",
    angleLabel: "Angle",
    climbsHeading: (rope) => (rope ? "Routes this session" : "Problems this session"),
    addClimb: (rope) => (rope ? "Add route" : "Add problem"),
    results: { flash: "Flash", send: "Sent", attempt: "Project" },
    resultLabel: "Result",
    attemptsLabel: "Attempts",
    attemptsUnit: (n) => (n === 1 ? "attempt" : "attempts"),
    noClimbs: "Add at least one problem or route to save the session.",
    saveSession: "Save session",
    discard: "Discard session",
    discardConfirm: "Tap again to discard",
    draftNote: "Saved on this device as you go — close the app and pick up where you left off.",
    wrapUpHeading: "Wrap-up",
    removeClimb: "Remove",
    summary: (c, s) => `${c} climbed · ${s} sent`,
    gradeLabel: "Grade",
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
    ranges: { "30": "30 days", "90": "90 days", all: "All" },
    sentOfTried: "Sent / tried",
    flashRate: "Flash rate",
    attemptsPerSend: "Attempts per send",
    pyramid: "Send pyramid",
    pyramidEmpty: "Log sends to build your pyramid.",
    flashes: (n) => `${n} flash`,
    timeline: "Hardest send per session",
    weekly: "Climbs per week",
    weekTooltip: (w, c, s) => `Week of ${w}: ${c} climbed, ${s} sent`,
    wallVsBoard: (w, b) => `${w} on walls · ${b} on boards`,
    topBoards: "Boards",
    topGyms: "Gyms",
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
    setUp: "Set up profile",
  },
  settings: {
    open: "Settings",
    title: "Settings",
    close: "Close settings",
    language: "Language",
    theme: "Appearance",
    profile: "Climber profile",
    editProfile: "Edit",
    createProfile: "Set up your profile",
    circuits: "Gyms & circuits",
    circuitsNone: "No home gym yet",
    levelColors: "Level colours",
    levelColorsHint: "Colours of the four level tags",
    edit: "Edit",
  },
  circuits: {
    title: "Gyms & circuits",
    intro: "Every gym marks grades with its own colours. Save your gyms and their circuits to log sessions by colour.",
    gymName: "Gym",
    gymPlaceholder: "Gym name",
    newGym: "Add gym",
    deleteGym: "Delete this gym",
    deleteConfirm: "Tap again to delete",
    useTemplate: "Use a 7-colour template",
    startEmpty: "Start empty",
    addColor: "Add colour",
    colorName: "Name",
    from: "From",
    to: "To",
    andUp: "and up",
    removeColor: "Remove colour",
    customColor: "Custom colour",
    pickColor: "Choose colour",
    save: "Save circuits",
    cancel: "Cancel",
    empty: "No colours yet.",
    nameMissing: "Every colour needs a name.",
    rangeInvalid: "“From” can't be harder than “To”.",
    scaleNote: (scale) => `Grades shown in ${scale}, the scale in your profile.`,
    logLabel: "Circuit",
    exactGrade: "Exact grade (optional)",
    exactGradeAny: "Any in range",
    gymScale: "Grade scale at this gym",
    colorsHeading: "Colour circuits",
    homeShort: "Home",
    isHome: "This is your home gym.",
    makeHome: "Make this my home gym",
    onboardingQuestion: "Your home gym",
    onboardingHint: "Where you climb most. Add its colour circuits to log sessions by colour — or skip and do it later in Settings.",
    gymLabel: "Gym",
    otherGym: "Other gym",
    otherGymName: "Gym name",
    scaleLabel: "Scale",
    home: "home gym",
  },
  gymsView: {
    heading: "Gyms",
    subheading: (count) => `${count} climbing gyms and walls across Chile.`,
    all: "All",
    searchPlaceholder: "Search by name or commune…",
    nearMe: "Near me",
    locating: "Locating…",
    locationError: "Couldn't get your location. Check the location permission for this app.",
    openMaps: "Open in Google Maps",
    makeHome: "Set as home gym",
    save: "Save to my gyms",
    saved: "In your gyms",
    editCircuits: "Edit colour circuits",
    outdoor: "Outdoor",
    noResults: "No gyms match your search.",
    mapAria: "Map of climbing gyms",
    you: "You",
  },
  strength: {
    modes: { drills: "Technique drills", strength: "Finger strength" },
    startTimer: "Start timer",
    how: "How",
    load: "Load",
    sources: "Sources",
    protocol: (p) => {
      const minutes = p.setRest >= 60 ? `${Math.round((p.setRest / 60) * 10) / 10} min` : `${p.setRest} s`;
      const rep = p.reps > 1 ? `${p.reps} × ${p.hang} s on${p.rest ? ` / ${p.rest} s off` : ""}` : `${p.hang} s hang`;
      return `${rep} · ${p.sets} set${p.sets === 1 ? "" : "s"}${p.sets > 1 ? ` · ${minutes} between sets` : ""}`;
    },
    customTitle: "Custom timer",
    customHint: "Build your own interval: hang, rest, reps and sets. It's remembered on this device.",
    fields: { prep: "Get ready (s)", hang: "Hang (s)", rest: "Rest (s)", reps: "Reps", sets: "Sets", setRest: "Between sets (s)" },
  },
  fingerTest: {
    title: "Your finger strength",
    log: "Log a test",
    empty: "Log your first test to see your score as a percentage of bodyweight and the training loads that come from it.",
    ofBodyweight: "of bodyweight",
    summary: (total, edge, grip, date) => `${total} total · ${edge} mm · ${grip} · ${date}`,
    delta: (p) => `${p > 0 ? "+" : ""}${p} pts vs previous`,
    chartLabel: "Finger strength over time, percent of bodyweight",
    loadsTitle: (bw) => `Training loads at ${bw}`,
    prescriptions: {
      maxStrength: { name: "Max strength", dose: "6 × 10 s hang, 2 min rest" },
      anaerobic: { name: "Repeaters", dose: "6 sets × 5 × 7/3, 2.5 min rest" },
    },
    bodyweightOnly: "Bodyweight",
    pulley: (k) => `−${k} (pulley)`,
    loadsSource: "Percentages of your max total load, from Lattice Training's test instructions:",
    date: "Date",
    bodyweight: "Bodyweight (kg)",
    harness: "Harness load (kg)",
    modes: { add: "Added", remove: "Removed" },
    edge: "Edge (mm)",
    grip: "Grip",
    grips: { half: "Half crimp", open: "Open hand" },
    preview: (total, p) => `Total load ${total} · ${p} of bodyweight`,
    invalid: "Enter your bodyweight, the harness load and the edge size.",
    cancel: "Cancel",
    save: "Save test",
    history: (n) => `All tests (${n})`,
    delete: "Delete",
    confirmDelete: "Tap again to delete",
    logResult: "Log result",
  },
  timer: {
    phases: { prep: "Get ready", hang: "Hang", rest: "Rest", setRest: "Rest between sets", done: "Done" },
    start: "Start",
    pause: "Pause",
    resume: "Resume",
    again: "Again",
    skip: "Skip",
    reset: "Reset",
    close: "Close timer",
    set: "Set",
    rep: "Rep",
    left: "Left",
    soundOn: "Sound on",
    soundOff: "Sound off",
  },
  backup: {
    title: "Backup",
    hint: (n) =>
      `Your data lives only on this device (${n} session${n === 1 ? "" : "s"} logged). Export a backup now and then, and restore it on a new phone.`,
    export: "Export backup",
    restore: "Restore from file",
    exported: "Backup downloaded.",
    confirmTitle: "Replace everything on this device?",
    confirmBody: (f) => `Profile, gyms, sessions and notes will be replaced with the contents of ${f}. This can't be undone.`,
    confirm: "Replace and restore",
    cancel: "Cancel",
    errorInvalid: "That file isn't an Omnium Climb backup.",
    errorNewer: "That backup comes from a newer version of the app. Update the app and try again.",
    errorStorage: "The device didn't allow saving the data. Free up space and try again.",
  },
  levelColorsEditor: {
    title: "Level colours",
    intro: "Recolour the four level tags to match whatever reads best for you.",
    reset: "Restore default colours",
    done: "Done",
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
    drills: "Entrenar",
    progressions: "Progresión",
    session: "Sesión",
    gyms: "Gimnasios",
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
    subheading: (count) => `${count} técnicas, desde los primeros movimientos hasta el bloque de competición.`,
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
    drillLabel: "Ejercicio usado (opcional)",
    drillPlaceholder: "Selecciona un ejercicio",
    hardestLabel: "Problema más difícil encadenado limpio",
    hardestPlaceholder: "Elige un grado",
    disciplineLabel: "Disciplina",
    drillNone: "Ninguno",
    settingLabel: "Dónde escalaste",
    settingWall: "Muros del gimnasio",
    settingBoard: "Tabla de entrenamiento",
    boardLabel: "Tabla",
    boardOther: "Otra tabla",
    boardOtherName: "Nombre de la tabla",
    angleLabel: "Inclinación",
    climbsHeading: (rope) => (rope ? "Vías de la sesión" : "Bloques de la sesión"),
    addClimb: (rope) => (rope ? "Agregar vía" : "Agregar bloque"),
    results: { flash: "Flash", send: "Encadenado", attempt: "Proyecto" },
    resultLabel: "Resultado",
    attemptsLabel: "Intentos",
    attemptsUnit: (n) => (n === 1 ? "intento" : "intentos"),
    noClimbs: "Agrega al menos un bloque o vía para guardar la sesión.",
    saveSession: "Guardar sesión",
    discard: "Descartar sesión",
    discardConfirm: "Toca otra vez para descartar",
    draftNote: "Se guarda en el dispositivo mientras avanzas: puedes cerrar la app y seguir después.",
    wrapUpHeading: "Cierre",
    removeClimb: "Quitar",
    summary: (c, s) => `${c} intentados · ${s} encadenados`,
    gradeLabel: "Grado",
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
    ranges: { "30": "30 días", "90": "90 días", all: "Todo" },
    sentOfTried: "Encadenados / intentados",
    flashRate: "Tasa de flash",
    attemptsPerSend: "Intentos por encadenado",
    pyramid: "Pirámide de encadenados",
    pyramidEmpty: "Registra encadenados para armar tu pirámide.",
    flashes: (n) => `${n} flash`,
    timeline: "Grado máximo por sesión",
    weekly: "Escaladas por semana",
    weekTooltip: (w, c, s) => `Semana del ${w}: ${c} intentados, ${s} encadenados`,
    wallVsBoard: (w, b) => `${w} en muros · ${b} en tablas`,
    topBoards: "Tablas",
    topGyms: "Gimnasios",
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
    setUp: "Crear perfil",
  },
  settings: {
    open: "Ajustes",
    title: "Ajustes",
    close: "Cerrar ajustes",
    language: "Idioma",
    theme: "Apariencia",
    profile: "Perfil de escalador",
    editProfile: "Editar",
    createProfile: "Configura tu perfil",
    circuits: "Gimnasios y circuitos",
    circuitsNone: "Aún sin home gym",
    levelColors: "Colores de niveles",
    levelColorsHint: "Colores de las cuatro etiquetas de nivel",
    edit: "Editar",
  },
  circuits: {
    title: "Gimnasios y circuitos",
    intro: "Cada gimnasio marca los grados con sus propios colores. Guarda tus gimnasios y sus circuitos para registrar sesiones por color.",
    gymName: "Gimnasio",
    gymPlaceholder: "Nombre del gimnasio",
    newGym: "Agregar gimnasio",
    deleteGym: "Eliminar este gimnasio",
    deleteConfirm: "Toca otra vez para eliminar",
    useTemplate: "Usar una plantilla de 7 colores",
    startEmpty: "Empezar vacío",
    addColor: "Agregar color",
    colorName: "Nombre",
    from: "Desde",
    to: "Hasta",
    andUp: "o más",
    removeColor: "Quitar color",
    customColor: "Color personalizado",
    pickColor: "Elegir color",
    save: "Guardar circuitos",
    cancel: "Cancelar",
    empty: "Aún no hay colores.",
    nameMissing: "Cada color necesita un nombre.",
    rangeInvalid: "«Desde» no puede ser más difícil que «Hasta».",
    scaleNote: (scale) => `Grados en escala ${scale}, la de tu perfil.`,
    logLabel: "Circuito",
    exactGrade: "Grado exacto (opcional)",
    exactGradeAny: "Cualquiera del rango",
    gymScale: "Escala de grados del gimnasio",
    colorsHeading: "Circuitos de colores",
    homeShort: "Home",
    isHome: "Este es tu home gym.",
    makeHome: "Usar como mi home gym",
    onboardingQuestion: "Tu home gym",
    onboardingHint: "Donde más escalas. Agrega sus circuitos de colores para registrar sesiones por color, u omítelo y hazlo después en Ajustes.",
    gymLabel: "Gimnasio",
    otherGym: "Otro gimnasio",
    otherGymName: "Nombre del gimnasio",
    scaleLabel: "Escala",
    home: "home gym",
  },
  gymsView: {
    heading: "Gimnasios",
    subheading: (count) => `${count} gimnasios y muros de escalada en Chile.`,
    all: "Todas",
    searchPlaceholder: "Buscar por nombre o comuna…",
    nearMe: "Cerca de mí",
    locating: "Ubicando…",
    locationError: "No se pudo obtener tu ubicación. Revisa el permiso de ubicación de la app.",
    openMaps: "Abrir en Google Maps",
    makeHome: "Usar como home gym",
    save: "Guardar en mis gimnasios",
    saved: "En tus gimnasios",
    editCircuits: "Editar circuitos",
    outdoor: "Al aire libre",
    noResults: "Ningún gimnasio coincide con tu búsqueda.",
    mapAria: "Mapa de gimnasios de escalada",
    you: "Tú",
  },
  strength: {
    modes: { drills: "Ejercicios de técnica", strength: "Fuerza de dedos" },
    startTimer: "Iniciar temporizador",
    how: "Cómo",
    load: "Carga",
    sources: "Fuentes",
    protocol: (p) => {
      const minutes = p.setRest >= 60 ? `${Math.round((p.setRest / 60) * 10) / 10} min` : `${p.setRest} s`;
      const rep = p.reps > 1 ? `${p.reps} × ${p.hang} s colgado${p.rest ? ` / ${p.rest} s descanso` : ""}` : `colgada de ${p.hang} s`;
      return `${rep} · ${p.sets} serie${p.sets === 1 ? "" : "s"}${p.sets > 1 ? ` · ${minutes} entre series` : ""}`;
    },
    customTitle: "Temporizador libre",
    customHint: "Arma tu propio intervalo: colgada, descanso, repeticiones y series. Queda guardado en este dispositivo.",
    fields: { prep: "Preparación (s)", hang: "Colgada (s)", rest: "Descanso (s)", reps: "Repeticiones", sets: "Series", setRest: "Entre series (s)" },
  },
  fingerTest: {
    title: "Tu fuerza de dedos",
    log: "Registrar test",
    empty: "Registra tu primer test para ver tu resultado como porcentaje del peso corporal y las cargas de entrenamiento que salen de él.",
    ofBodyweight: "del peso corporal",
    summary: (total, edge, grip, date) => `${total} en total · ${edge} mm · ${grip} · ${date}`,
    delta: (p) => `${p > 0 ? "+" : ""}${p} pts vs el anterior`,
    chartLabel: "Fuerza de dedos en el tiempo, porcentaje del peso corporal",
    loadsTitle: (bw) => `Cargas de entrenamiento a ${bw}`,
    prescriptions: {
      maxStrength: { name: "Fuerza máxima", dose: "6 × colgada de 10 s, 2 min de descanso" },
      anaerobic: { name: "Repeaters", dose: "6 series × 5 × 7/3, 2,5 min de descanso" },
    },
    bodyweightOnly: "Peso corporal",
    pulley: (k) => `−${k} (polea)`,
    loadsSource: "Porcentajes de tu carga total máxima, según las instrucciones del test de Lattice Training:",
    date: "Fecha",
    bodyweight: "Peso corporal (kg)",
    harness: "Carga en el arnés (kg)",
    modes: { add: "Agregada", remove: "Quitada" },
    edge: "Canto (mm)",
    grip: "Agarre",
    grips: { half: "Half crimp", open: "Mano abierta" },
    preview: (total, p) => `Carga total ${total} · ${p} del peso corporal`,
    invalid: "Ingresa tu peso corporal, la carga en el arnés y el tamaño del canto.",
    cancel: "Cancelar",
    save: "Guardar test",
    history: (n) => `Todos los tests (${n})`,
    delete: "Eliminar",
    confirmDelete: "Toca de nuevo para eliminar",
    logResult: "Registrar resultado",
  },
  timer: {
    phases: { prep: "Prepárate", hang: "Cuelga", rest: "Descansa", setRest: "Pausa entre series", done: "Terminado" },
    start: "Empezar",
    pause: "Pausa",
    resume: "Seguir",
    again: "Otra vez",
    skip: "Saltar",
    reset: "Reiniciar",
    close: "Cerrar temporizador",
    set: "Serie",
    rep: "Rep.",
    left: "Restante",
    soundOn: "Sonido activado",
    soundOff: "Sonido desactivado",
  },
  backup: {
    title: "Respaldo",
    hint: (n) =>
      `Tus datos viven solo en este dispositivo (${n} sesi${n === 1 ? "ón registrada" : "ones registradas"}). Exporta un respaldo de vez en cuando y restáuralo en un teléfono nuevo.`,
    export: "Exportar respaldo",
    restore: "Restaurar desde archivo",
    exported: "Respaldo descargado.",
    confirmTitle: "¿Reemplazar todo en este dispositivo?",
    confirmBody: (f) => `El perfil, los gimnasios, las sesiones y las notas se reemplazarán con el contenido de ${f}. No se puede deshacer.`,
    confirm: "Reemplazar y restaurar",
    cancel: "Cancelar",
    errorInvalid: "Ese archivo no es un respaldo de Omnium Climb.",
    errorNewer: "Ese respaldo viene de una versión más nueva de la app. Actualiza la app e inténtalo de nuevo.",
    errorStorage: "El dispositivo no permitió guardar los datos. Libera espacio e inténtalo de nuevo.",
  },
  levelColorsEditor: {
    title: "Colores de niveles",
    intro: "Cambia el color de las cuatro etiquetas de nivel como te resulte más claro.",
    reset: "Restaurar colores por defecto",
    done: "Listo",
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
