"use client";

import React from "react";
import { FilePlus2 } from "lucide-react";
import { QuoteBlock, QuoteBlockKind, QuotePage } from "@/types";
import {
  BLOCK_KIND_META,
  createBlock,
  createTermsPage,
  moveById,
  removeById,
  standardTermsClauses,
  uid,
  updateById,
} from "@/lib/quoteDocument";
import { AddButton, KeyValueEditor, RowControls, TextAreaField, TextField } from "./fields";

const BLOCK_KINDS = Object.keys(BLOCK_KIND_META) as QuoteBlockKind[];

/** Editor for quotation pages 2+ (specs, deliverables, terms…). */
export const PagesEditor: React.FC<{ pages: QuotePage[]; onChange: (pages: QuotePage[]) => void }> = ({ pages, onChange }) => {
  const setPage = (id: string, patch: Partial<QuotePage>) => onChange(updateById(pages, id, patch));

  return (
    <div className="space-y-4">
      {pages.length === 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-400">
          <FilePlus2 className="w-5 h-5 shrink-0 text-[#fe7518]" aria-hidden="true" />
          <p>
            The quotation is a single page right now. Add pages for machine specifications, component tables, deliverables or terms
            &amp; conditions — each page prints on its own A4 sheet.
          </p>
        </div>
      )}

      {pages.map((page, idx) => (
        <div key={page.id} className="rounded-xl border-2 border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-[#151822] p-3 sm:p-4 space-y-3">
          <div className="flex items-end gap-2">
            <TextField
              className="flex-1"
              label={`Page ${idx + 2} title`}
              value={page.title}
              onValue={(title) => setPage(page.id, { title })}
              placeholder="e.g. Materials & Deliverables…"
            />
            <RowControls
              name={`page ${idx + 2}`}
              index={idx}
              count={pages.length}
              onMove={(dir) => onChange(moveById(pages, page.id, dir))}
              onRemove={() => {
                const hasContent = page.title.trim() || page.blocks.length;
                if (!hasContent || window.confirm(`Remove page ${idx + 2}${page.title ? ` “${page.title}”` : ""} and all its sections?`)) {
                  onChange(removeById(pages, page.id));
                }
              }}
            />
          </div>

          {page.blocks.map((block, bIdx) => (
            <BlockEditor
              key={block.id}
              block={block}
              index={bIdx}
              count={page.blocks.length}
              onChange={(patch) => setPage(page.id, { blocks: updateById(page.blocks, block.id, patch) })}
              onMove={(dir) => setPage(page.id, { blocks: moveById(page.blocks, block.id, dir) })}
              onRemove={() => setPage(page.id, { blocks: removeById(page.blocks, block.id) })}
            />
          ))}

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-400">Add section to this page</div>
            <div className="flex flex-wrap gap-1.5">
              {BLOCK_KINDS.map((kind) => (
                <AddButton
                  key={kind}
                  title={BLOCK_KIND_META[kind].hint}
                  onClick={() => setPage(page.id, { blocks: [...page.blocks, createBlock(kind)] })}
                >
                  {BLOCK_KIND_META[kind].label}
                </AddButton>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <AddButton onClick={() => onChange([...pages, { id: uid("pg"), title: "", blocks: [] }])}>Blank page</AddButton>
        <AddButton onClick={() => onChange([...pages, createTermsPage()])}>Terms &amp; Conditions page</AddButton>
      </div>
    </div>
  );
};

const BlockEditor: React.FC<{
  block: QuoteBlock;
  index: number;
  count: number;
  onChange: (patch: Partial<QuoteBlock>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}> = ({ block, index, count, onChange, onMove, onRemove }) => {
  const meta = BLOCK_KIND_META[block.kind];
  return (
    <div className="rounded-xl border-2 border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#12141c] p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-900 dark:text-orange-300">
          {meta.label}
        </span>
        <RowControls name={`${meta.label.toLowerCase()} section`} index={index} count={count} onMove={onMove} onRemove={onRemove} />
      </div>

      <TextField
        label="Section heading"
        hint={block.kind === "clauses" ? "Optional — leave empty when the page title already says “Terms & Conditions”." : "Printed with a letter (A, B, C…). Leave empty to hide."}
        value={block.heading}
        onValue={(heading) => onChange({ heading })}
        placeholder={block.kind === "clauses" ? "" : "e.g. Machine Specifications…"}
      />

      {block.kind === "highlights" && (
        <KeyValueEditor
          name="Tile"
          rows={block.rows || []}
          onChange={(rows) => onChange({ rows })}
          labelPlaceholder="Label, e.g. Bed Area…"
          valuePlaceholder="Value, e.g. 300 × 180 mm…"
          addLabel="Add tile"
        />
      )}

      {block.kind === "table" && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label="Left column header"
              value={block.columns?.[0] || ""}
              onValue={(v) => onChange({ columns: [v, block.columns?.[1] || ""] })}
            />
            <TextField
              label="Right column header"
              value={block.columns?.[1] || ""}
              onValue={(v) => onChange({ columns: [block.columns?.[0] || "", v] })}
            />
          </div>
          <KeyValueEditor
            name="Row"
            rows={block.rows || []}
            onChange={(rows) => onChange({ rows })}
            labelPlaceholder="e.g. Stepper motors…"
            valuePlaceholder="e.g. NEMA 17 (X, Y, Z)…"
            addLabel="Add row"
          />
        </>
      )}

      {block.kind === "lists" && (
        <div className="space-y-2">
          {(block.groups || []).map((group, gIdx, groups) => (
            <div key={group.id} className="rounded-lg border border-slate-200 dark:border-zinc-800 p-3 space-y-2">
              <div className="flex flex-wrap items-end gap-2">
                <TextField
                  className="flex-1 min-w-[10rem]"
                  label={`List ${gIdx + 1} title`}
                  value={group.title}
                  onValue={(title) => onChange({ groups: updateById(groups, group.id, { title }) })}
                  placeholder="e.g. Physical Deliverables…"
                />
                <label className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-[38px] px-2 rounded-lg text-[11px] font-bold text-slate-700 dark:text-zinc-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800">
                  <input
                    type="checkbox"
                    checked={Boolean(group.accent)}
                    onChange={(e) => onChange({ groups: updateById(groups, group.id, { accent: e.target.checked }) })}
                    className="w-4 h-4 accent-[#fe7518]"
                  />
                  Orange title
                </label>
                <RowControls
                  name={`list ${gIdx + 1}`}
                  index={gIdx}
                  count={groups.length}
                  onMove={(dir) => onChange({ groups: moveById(groups, group.id, dir) })}
                  onRemove={() => onChange({ groups: removeById(groups, group.id) })}
                />
              </div>
              <TextAreaField
                label="Items — one per line"
                value={group.items.join("\n")}
                onValue={(v) => onChange({ groups: updateById(groups, group.id, { items: v.split("\n") }) })}
                rows={Math.max(3, group.items.length)}
                placeholder={"One assembled machine\nPower supply, wiring and USB cable"}
              />
            </div>
          ))}
          <AddButton onClick={() => onChange({ groups: [...(block.groups || []), { id: uid("grp"), title: "", items: [] }] })}>
            Add list
          </AddButton>
        </div>
      )}

      {block.kind === "clauses" && (
        <div className="space-y-2">
          {(block.clauses || []).map((c, cIdx, clauses) => (
            <div key={c.id} className="rounded-lg border border-slate-200 dark:border-zinc-800 p-3 space-y-2">
              <div className="flex items-end gap-2">
                <span aria-hidden="true" className="font-mono text-sm font-black text-[#fe7518] pb-2.5 tabular-nums">
                  {String(cIdx + 1).padStart(2, "0")}
                </span>
                <TextField
                  className="flex-1"
                  label={`Clause ${cIdx + 1} title`}
                  value={c.title}
                  onValue={(title) => onChange({ clauses: updateById(clauses, c.id, { title }) })}
                  placeholder="e.g. Delivery Charges…"
                />
                <RowControls
                  name={`clause ${cIdx + 1}`}
                  index={cIdx}
                  count={clauses.length}
                  onMove={(dir) => onChange({ clauses: moveById(clauses, c.id, dir) })}
                  onRemove={() => onChange({ clauses: removeById(clauses, c.id) })}
                />
              </div>
              <TextAreaField
                label={`Clause ${cIdx + 1} text`}
                hideLabel
                value={c.body}
                onValue={(body) => onChange({ clauses: updateById(clauses, c.id, { body }) })}
                rows={3}
                placeholder="Clause wording… (new line = new paragraph)"
              />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <AddButton onClick={() => onChange({ clauses: [...(block.clauses || []), { id: uid("cl"), title: "", body: "" }] })}>
              Add clause
            </AddButton>
            <AddButton onClick={() => onChange({ clauses: [...(block.clauses || []), ...standardTermsClauses()] })}>
              Append standard clauses
            </AddButton>
          </div>
        </div>
      )}

      {block.kind === "text" && (
        <TextAreaField label="Text" value={block.body || ""} onValue={(body) => onChange({ body })} rows={4} placeholder="Write the section… (new line = new paragraph)" />
      )}

      {block.kind !== "clauses" && block.kind !== "text" && (
        <TextAreaField
          label="Footnote (optional)"
          value={block.note || ""}
          onValue={(note) => onChange({ note })}
          rows={2}
          placeholder="Small print under this section…"
        />
      )}
    </div>
  );
};
