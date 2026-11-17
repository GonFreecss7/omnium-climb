import { useAppState } from "../state/AppState";
import type { ReferenceEntry } from "../data/types";

const GROUPS: Array<{ id: "books" | "reading" | "channels"; types: ReferenceEntry["refType"][] }> = [
  { id: "books", types: ["book"] },
  { id: "reading", types: ["article", "paper"] },
  { id: "channels", types: ["channel", "video"] },
];

/** §17: books, articles, papers and channels, each with a one-line note in our own words. */
export default function ReferencesSection() {
  const { guide, t } = useAppState();
  const section = guide.referencesSection;
  if (!section || guide.references.length === 0) return null;
  const r = t.references;

  return (
    <section id={`section-${section.number}`} className="guide-section refs">
      <h2 className="guide-section__title">
        <span className="guide-section__num">§{section.number}</span>
        {section.title}
      </h2>
      {GROUPS.map((g) => {
        const items = guide.references.filter((x) => g.types.includes(x.refType));
        if (items.length === 0) return null;
        return (
          <div key={g.id} className="refs__group">
            <h3 className="refs__group-title">{r.groups[g.id]}</h3>
            <ul className="refs__list">
              {items.map((x) => (
                <li key={x.id} id={x.id} className="refs__item">
                  <p className="refs__title">
                    {x.url ? (
                      <a href={x.url} target="_blank" rel="noopener noreferrer">
                        {x.title}
                      </a>
                    ) : (
                      x.title
                    )}
                  </p>
                  <p className="refs__author">
                    {x.author}
                    {x.refType === "paper" && <span className="refs__type"> · {r.types.paper}</span>}
                  </p>
                  <p className="refs__note">{x.note}</p>
                  {x.url && <p className="refs__host">{new URL(x.url).hostname.replace(/^www\./, "")}</p>}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
