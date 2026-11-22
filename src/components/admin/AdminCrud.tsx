"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type Field = { name: string; label: string; type: "text" | "textarea" | "number" | "checkbox" | "json" | "datetime"; required?: boolean; help?: string };
type Row = Record<string, unknown> & { id: string };

const toLocal = (iso: unknown) => { if (!iso) return ""; const d = new Date(String(iso)); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

export default function AdminCrud({ resource, fields, rows, titleKey, subKey, defaults = {} }: { resource: string; fields: Field[]; rows: Row[]; titleKey: string; subKey?: string; defaults?: Record<string, unknown> }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const val = (f: Field): string | boolean => {
    const src = editing && editing !== "new" ? editing : defaults;
    const v = src[f.name];
    if (f.type === "checkbox") return v === undefined ? true : Boolean(v);
    if (f.type === "json") return v === undefined ? "[]" : JSON.stringify(v, null, 2);
    if (f.type === "datetime") return toLocal(v);
    return v == null ? "" : String(v);
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {};
    for (const f of fields) body[f.name] = f.type === "checkbox" ? fd.get(f.name) === "on" : fd.get(f.name);
    const isNew = editing === "new";
    const r = await fetch(`/api/admin/${resource}${isNew ? "" : `?id=${(editing as Row).id}`}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json(); setBusy(false);
    if (j.ok) { setMsg({ t: "ok", m: isNew ? "Created." : "Saved." }); setEditing(null); router.refresh(); } else setMsg({ t: "err", m: j.error });
  }
  async function del(row: Row) {
    if (!confirm(`Delete "${String(row[titleKey])}"? This cannot be undone.`)) return;
    const r = await fetch(`/api/admin/${resource}?id=${row.id}`, { method: "DELETE" });
    const j = await r.json();
    if (j.ok) { setMsg({ t: "ok", m: "Deleted." }); router.refresh(); } else setMsg({ t: "err", m: j.error });
  }

  return (
    <div>
      <div className="flex items-center justify-between"><p className="text-sm text-ivory/60">{rows.length} record(s)</p><button onClick={() => { setEditing("new"); setMsg(null); }} className="btn btn-gold !min-h-9">+ Add new</button></div>
      {msg && <p role={msg.t === "err" ? "alert" : "status"} className={`mt-3 rounded-xl p-3 text-sm ${msg.t === "err" ? "bg-maroon/50" : "bg-emerald/25"}`}>{msg.m}</p>}
      {editing && (
        <form key={editing === "new" ? "new" : editing.id} onSubmit={submit} className="card mt-4 grid gap-4 sm:grid-cols-2">
          <h2 className="font-serif text-2xl sm:col-span-2">{editing === "new" ? "Add new" : `Edit: ${String(editing[titleKey])}`}</h2>
          {fields.map((f) => (
            <div key={f.name} className={f.type === "textarea" || f.type === "json" ? "sm:col-span-2" : ""}>
              {f.type === "checkbox" ? (
                <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name={f.name} defaultChecked={val(f) as boolean} /> {f.label}</label>
              ) : (<>
                <label className="label" htmlFor={`f-${f.name}`}>{f.label}{f.required && " *"}</label>
                {f.type === "textarea" || f.type === "json" ? <textarea id={`f-${f.name}`} name={f.name} rows={f.type === "json" ? 5 : 4} defaultValue={val(f) as string} className={`input ${f.type === "json" ? "font-mono text-xs" : ""}`} required={f.required} />
                  : <input id={`f-${f.name}`} name={f.name} type={f.type === "number" ? "number" : f.type === "datetime" ? "datetime-local" : "text"} step={f.type === "number" ? "any" : undefined} defaultValue={val(f) as string} className="input" required={f.required} />}
                {f.help && <p className="mt-1 text-xs text-ivory/50">{f.help}</p>}
              </>)}
            </div>
          ))}
          <div className="flex gap-3 sm:col-span-2"><button className="btn btn-gold" disabled={busy}>{busy ? "Saving…" : "Save"}</button><button type="button" onClick={() => setEditing(null)} className="btn btn-ghost">Cancel</button></div>
        </form>
      )}
      <ul className="mt-4 space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="card !p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0"><p className="truncate font-serif text-xl">{String(r[titleKey])}</p>{subKey && <p className="truncate text-xs text-ivory/50">{String(r[subKey] ?? "")}</p>}</div>
            <div className="flex gap-2"><button onClick={() => { setEditing(r); setMsg(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="btn btn-ghost !min-h-9 !px-4">Edit</button><button onClick={() => del(r)} className="btn btn-danger !min-h-9 !px-4">Delete</button></div>
          </li>
        ))}
        {!rows.length && <li className="card">No records yet.</li>}
      </ul>
    </div>
  );
}
