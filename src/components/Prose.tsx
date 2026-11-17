import { Fragment } from "react";
import type { ReactNode } from "react";
import { LEVELS, inRange, parseLevelRange } from "../domain/levels";
import type { LevelRange } from "../domain/levels";
import { useAppState } from "../state/AppState";

/** Renders `**bold**` and `§N` section links within a single line of text. */
export function InlineMarkdown({ text }: { text: string }) {
  const { goToSection } = useAppState();
  return <>{renderInline(text, goToSection, "inline")}</>;
}

function renderInline(text: string, goToSection: (n: number) => void, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|§(\d+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-${i++}`}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      const num = Number(match[2]);
      nodes.push(
        <button
          key={`${keyPrefix}-${i++}`}
          type="button"
          className="section-link"
          onClick={() => goToSection(num)}
        >
          §{match[2]}
        </button>,
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function renderBlock(block: string, key: string, goToSection: (n: number) => void): ReactNode {
  const trimmedBlock = block.trim();
  if (trimmedBlock === "") return null;

  if (/^-{3,}$/.test(trimmedBlock)) {
    return <hr key={key} className="prose-hr" />;
  }

  const lines = block.split("\n").filter((l) => l.trim() !== "");

  if (lines.every((l) => l.trim().startsWith(">"))) {
    const text = lines.map((l) => l.replace(/^>\s?/, "")).join(" ");
    return (
      <blockquote key={key} className="prose-callout">
        {renderInline(text, goToSection, key)}
      </blockquote>
    );
  }

  if (lines[0]?.trim().startsWith("|")) {
    const rows = lines.map((l) =>
      l
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim()),
    );
    const [header, , ...body] = rows;
    if (!header) return null;
    return (
      <div key={key} className="prose-table-wrap">
        <table className="prose-table">
          <thead>
            <tr>
              {header.map((c, ci) => (
                <th key={ci}>{renderInline(c, goToSection, `${key}-h${ci}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri}>
                {row.map((c, ci) => (
                  <td key={ci} data-label={header[ci]}>
                    {renderInline(c, goToSection, `${key}-r${ri}-${ci}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (lines.every((l) => /^-\s/.test(l.trim()))) {
    return (
      <ul key={key} className="prose-list">
        {lines.map((l, li) => (
          <li key={li}>{renderInline(l.trim().replace(/^-\s/, ""), goToSection, `${key}-${li}`)}</li>
        ))}
      </ul>
    );
  }

  if (lines.every((l) => /^\d+\.\s/.test(l.trim()))) {
    return (
      <ol key={key} className="prose-list">
        {lines.map((l, li) => (
          <li key={li}>{renderInline(l.trim().replace(/^\d+\.\s/, ""), goToSection, `${key}-${li}`)}</li>
        ))}
      </ol>
    );
  }

  if (/^\*\*(.+)\*\*$/.test(trimmedBlock)) {
    const text = trimmedBlock.slice(2, -2);
    return (
      <h3 key={key} className="prose-subheading">
        {text}
      </h3>
    );
  }

  return (
    <p key={key} className="prose-p">
      {renderInline(lines.join(" "), goToSection, key)}
    </p>
  );
}

interface Segment {
  range: LevelRange | null;
  text: string;
}

/**
 * Splits a body on `:::level <range>` … `:::` fences (validated at build time
 * by scripts/parse-guide.ts). Unfenced text has `range: null`.
 */
function splitLevelSegments(body: string): Segment[] {
  const segments: Segment[] = [];
  let current: Segment = { range: null, text: "" };
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    const open = trimmed.match(/^:::level\s+(\S+)$/);
    if (open) {
      segments.push(current);
      current = { range: parseLevelRange(open[1]!), text: "" };
      continue;
    }
    if (trimmed === ":::") {
      segments.push(current);
      current = { range: null, text: "" };
      continue;
    }
    current.text += `${line}\n`;
  }
  segments.push(current);
  return segments.filter((s) => s.text.trim() !== "");
}

export default function Prose({ body }: { body: string }) {
  const { goToSection, levelInfo, t } = useAppState();
  const segments = splitLevelSegments(body);
  return (
    <>
      {segments.map((seg, si) => {
        const blocks = seg.text
          .split(/\n\s*\n/)
          .map((block, i) => renderBlock(block, `s${si}b${i}`, goToSection));
        if (!seg.range) return <Fragment key={si}>{blocks}</Fragment>;
        if (levelInfo && !inRange(levelInfo.level, seg.range)) return null;
        const range = seg.range;
        const label = LEVELS.filter((l) => inRange(l, range))
          .map((l) => t.levels[l])
          .join(" · ");
        return (
          <div key={si} className="level-block">
            <span className="mono-label level-block__label">
              {t.levelBlock.prefix} {label}
            </span>
            {blocks}
          </div>
        );
      })}
    </>
  );
}
