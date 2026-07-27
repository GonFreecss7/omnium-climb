import type { ReactNode } from "react";
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

export default function Prose({ body }: { body: string }) {
  const { goToSection } = useAppState();
  const blocks = body.split(/\n\s*\n/);
  return <>{blocks.map((block, i) => renderBlock(block, `blk${i}`, goToSection))}</>;
}
