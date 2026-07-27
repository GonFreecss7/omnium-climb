import enGuideJson from "./guide.en.json";
import esGuideJson from "./guide.es.json";
import type { Guide } from "./types";
import type { Lang } from "../i18n/ui";

const enGuide = enGuideJson as Guide;
const esGuide = esGuideJson as Guide;

const guides: Record<Lang, Guide> = { en: enGuide, es: esGuide };

export function getGuide(lang: Lang): Guide {
  return guides[lang];
}
