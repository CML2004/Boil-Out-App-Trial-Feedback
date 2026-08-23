import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import type { EmailRecipient, Fryer, FryerTypeRule, StoreConfig } from "../domain/types";
import { useDemoData } from "../state/DemoDataContext";
import { useTour } from "../state/TourContext";

type Notice = { type: "success" | "error"; text: string } | null;

export function LeadershipPage() {
  const storeCode = String(useParams().storeCode || "CFA02851").toUpperCase();
  const { getStore, updateFryer, addFryer, deleteFryer, saveConfig } = useDemoData();
  const { completeStep } = useTour();
  const store = getStore(storeCode);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    if (notice?.type !== "success") return;
    const timeout = window.setTimeout(() => setNotice(null), 4_000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  if (!store) return <div className="empty-state">That demo store is not available.</div>;

  const saveStoreConfig = async (next: StoreConfig, message = "Settings saved.") => {
    try { await saveConfig(storeCode, next); setNotice({ type: "success", text: message }); }
    catch { setNotice({ type: "error", text: "The demo could not save that change." }); }
  };

  return (
    <AppShell eyebrow="Store administration • Interactive demo" title={`Leadership Dashboard • ${storeCode}`} subtitle="Fryers, thresholds, recipients, and reporting" actions={<Link className="button ghost small" to={`/store/${storeCode}`}>← Store dashboard</Link>}>
      {notice && <div className={`notice ${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>{notice.text}<button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message">×</button></div>}
      <div className="admin-stack">
        <section className="panel" data-tour-id="leadership-equipment">
          <div className="section-heading"><div><p className="eyebrow">Equipment</p><h2>Fryer management</h2></div><span>{store.fryers.length} fryers</span></div>
          <div className="admin-list">{store.fryers.map((fryer) => <FryerEditor key={fryer.id} storeCode={storeCode} fryer={fryer} config={store.config} updateFryer={updateFryer} deleteFryer={deleteFryer} setNotice={setNotice} />)}</div>
          <AddFryerForm storeCode={storeCode} fryers={store.fryers} config={store.config} addFryer={addFryer} setNotice={setNotice} />
        </section>

        <section className="panel" data-tour-id="leadership-rules">
          <div className="section-heading"><div><p className="eyebrow">Timing rules</p><h2>Fryer types</h2></div><span>{Object.keys(store.config.typeRules).length} types</span></div>
          <div className="admin-list">{Object.entries(store.config.typeRules).map(([name, rules]) => <TypeRuleEditor key={name} storeCode={storeCode} originalName={name} rules={rules} config={store.config} fryers={store.fryers} updateFryer={updateFryer} saveConfig={saveStoreConfig} setNotice={setNotice} />)}</div>
          <AddTypeForm config={store.config} saveConfig={saveStoreConfig} />
        </section>

        <section className="panel" data-tour-id="leadership-alerts">
          <div className="section-heading"><div><p className="eyebrow">Notifications</p><h2>Email recipients</h2></div><span>Email feature live</span></div>
          <div className="recipient-grid">{store.config.usersForEmailAlerts.map((recipient, index) => <RecipientEditor key={`${recipient.email}-${index}`} recipient={recipient} index={index} config={store.config} saveConfig={saveStoreConfig} />)}</div>
          <AddRecipientForm config={store.config} saveConfig={saveStoreConfig} setNotice={setNotice} />
          <form className="form-stack tool-box" data-tour-id="reminder-form" onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const days = Math.max(0, Number(form.get("reminderDays")) || 0);
            await saveStoreConfig({ ...store.config, alertSettings: { overdueReminderDays: days } }, "Reminder schedule saved.");
            completeStep("reminder-form");
          }}>
            <label>Overdue reminder interval<input name="reminderDays" type="number" min="0" defaultValue={store.config.alertSettings.overdueReminderDays} /></label>
            <p className="field-help">A value of 3 resends overdue reminders every three days.</p>
            <button className="button primary">Save reminder schedule</button>
          </form>
        </section>

        <section className="panel report-panel" data-tour-id="leadership-reporting">
          <div><p className="eyebrow">Reporting</p><h2>Boil-out completions</h2></div>
          <p>Export simulated completion totals, dates, initials, and fryer names as a CSV file.</p>
          <button className="button primary" data-tour-id="export-button" type="button" onClick={() => { exportCompletionCsv(storeCode, store.fryers, setNotice); completeStep("export-report"); }}>Export Demo CSV</button>
        </section>
      </div>
    </AppShell>
  );
}

interface FryerEditorProps {
  storeCode: string;
  fryer: Fryer;
  config: StoreConfig;
  updateFryer: ReturnType<typeof useDemoData>["updateFryer"];
  deleteFryer: ReturnType<typeof useDemoData>["deleteFryer"];
  setNotice: (notice: Notice) => void;
}

function FryerEditor({ storeCode, fryer, config, updateFryer, deleteFryer, setNotice }: FryerEditorProps) {
  const [name, setName] = useState(fryer.name);
  const [type, setType] = useState(fryer.type);
  const [date, setDate] = useState(fryer.lastBoilOut);
  const [busy, setBusy] = useState(false);
  return <form className="admin-row" onSubmit={async (event) => {
    event.preventDefault(); setBusy(true);
    try { await updateFryer(storeCode, fryer.id, { name: name.trim(), type, lastBoilOut: date }); setNotice({ type: "success", text: `${name} saved in the demo.` }); }
    finally { setBusy(false); }
  }}>
    <label>Fryer name<input value={name} onChange={(event) => setName(event.target.value)} required /></label>
    <label>Type<select value={type} onChange={(event) => setType(event.target.value)}>{Object.keys(config.typeRules).map((item) => <option key={item}>{item}</option>)}</select></label>
    <label>Last boil-out<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
    <div className="row-actions"><button className="button primary small" disabled={busy}>{busy ? "Saving…" : "Save"}</button><button className="button danger small" type="button" onClick={async () => { if (!window.confirm(`Remove ${fryer.name} from this demo?`)) return; await deleteFryer(storeCode, fryer.id); setNotice({ type: "success", text: `${fryer.name} removed from the demo.` }); }}>Delete</button></div>
  </form>;
}

function AddFryerForm({ storeCode, fryers, config, addFryer, setNotice }: { storeCode: string; fryers: Fryer[]; config: StoreConfig; addFryer: ReturnType<typeof useDemoData>["addFryer"]; setNotice: (notice: Notice) => void }) {
  const { completeStep } = useTour();
  const [name, setName] = useState(""); const [type, setType] = useState(Object.keys(config.typeRules)[0]); const [date, setDate] = useState(""); const [busy, setBusy] = useState(false);
  return <form className="add-row" data-tour-id="add-fryer-form" onSubmit={async (event) => {
    event.preventDefault(); setBusy(true);
    const nextId = String(Math.max(0, ...fryers.map((item) => Number(item.id) || 0)) + 1);
    try { await addFryer(storeCode, { id: nextId, name: name.trim(), type, lastBoilOut: date, needsBoilOut: false, needsReason: "", needsNotes: "", history: [] }); setName(""); setDate(""); setNotice({ type: "success", text: "Demo fryer added." }); completeStep("add-fryer"); }
    finally { setBusy(false); }
  }}><strong>Add fryer</strong><label>Name<input value={name} onChange={(event) => setName(event.target.value)} required /></label><label>Type<select value={type} onChange={(event) => setType(event.target.value)}>{Object.keys(config.typeRules).map((item) => <option key={item}>{item}</option>)}</select></label><label>Last boil-out<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label><button className="button primary" disabled={busy}>{busy ? "Adding…" : "Add"}</button></form>;
}

function TypeRuleEditor({ storeCode, originalName, rules, config, fryers, updateFryer, saveConfig, setNotice }: { storeCode: string; originalName: string; rules: FryerTypeRule; config: StoreConfig; fryers: Fryer[]; updateFryer: ReturnType<typeof useDemoData>["updateFryer"]; saveConfig: (config: StoreConfig, message?: string) => Promise<void>; setNotice: (notice: Notice) => void }) {
  const { completeStep } = useTour();
  const [name, setName] = useState(originalName); const [needed, setNeeded] = useState(rules.neededDays); const [overdue, setOverdue] = useState(rules.overdueDays); const [busy, setBusy] = useState(false);
  return <form className="admin-row type-row" data-tour-id="timing-rule-form" onSubmit={async (event) => {
    event.preventDefault();
    if (!name.trim() || needed < 0 || overdue < needed) { setNotice({ type: "error", text: "Overdue days must be at least Needed days." }); return; }
    setBusy(true);
    try {
      const typeRules = { ...config.typeRules }; delete typeRules[originalName]; typeRules[name.trim()] = { neededDays: needed, overdueDays: overdue };
      if (name.trim() !== originalName) await Promise.all(fryers.filter((fryer) => fryer.type === originalName).map((fryer) => updateFryer(storeCode, fryer.id, { type: name.trim() })));
      await saveConfig({ ...config, typeRules }, `${name.trim()} timing rules saved.`);
      completeStep("timing-rule");
    } finally { setBusy(false); }
  }}><label>Type name<input value={name} onChange={(event) => setName(event.target.value)} required /></label><label>Needed days<input type="number" min="0" value={needed} onChange={(event) => setNeeded(Number(event.target.value))} /></label><label>Overdue days<input type="number" min={needed} value={overdue} onChange={(event) => setOverdue(Number(event.target.value))} /></label><div className="row-actions"><button className="button primary small" disabled={busy}>{busy ? "Saving…" : "Save"}</button><button className="button danger small" type="button" onClick={async () => { if (fryers.some((fryer) => fryer.type === originalName)) { setNotice({ type: "error", text: "That type is still assigned to a fryer." }); return; } const typeRules = { ...config.typeRules }; delete typeRules[originalName]; await saveConfig({ ...config, typeRules }, `${originalName} removed.`); }}>Delete</button></div></form>;
}

function AddTypeForm({ config, saveConfig }: { config: StoreConfig; saveConfig: (config: StoreConfig, message?: string) => Promise<void> }) {
  const [name, setName] = useState(""); const [needed, setNeeded] = useState(22); const [overdue, setOverdue] = useState(28);
  return <form className="add-row" onSubmit={async (event) => { event.preventDefault(); if (!name.trim()) return; await saveConfig({ ...config, typeRules: { ...config.typeRules, [name.trim()]: { neededDays: needed, overdueDays: overdue } } }, `${name.trim()} added.`); setName(""); }}><strong>Add type</strong><label>Name<input value={name} onChange={(event) => setName(event.target.value)} required /></label><label>Needed<input type="number" min="0" value={needed} onChange={(event) => setNeeded(Number(event.target.value))} /></label><label>Overdue<input type="number" min={needed} value={overdue} onChange={(event) => setOverdue(Number(event.target.value))} /></label><button className="button primary">Add</button></form>;
}

function RecipientEditor({ recipient, index, config, saveConfig }: { recipient: EmailRecipient; index: number; config: StoreConfig; saveConfig: (config: StoreConfig, message?: string) => Promise<void> }) {
  const { completeStep } = useTour();
  const update = async (fields: Partial<EmailRecipient>) => {
    await saveConfig({ ...config, usersForEmailAlerts: config.usersForEmailAlerts.map((item, itemIndex) => itemIndex === index ? { ...item, ...fields } : item) }, `${recipient.name}'s alerts updated.`);
    completeStep("recipient-toggle");
  };
  return <article className="recipient-card"><div><strong>{recipient.name}</strong><span>{recipient.email}</span></div><div className="toggle-list"><label><input type="checkbox" checked={recipient.alertsEnabled} onChange={(event) => update({ alertsEnabled: event.target.checked, assignmentAlerts: event.target.checked, overdueAlerts: event.target.checked })} /> All alerts</label><label><input type="checkbox" data-tour-id="recipient-needed-toggle" checked={recipient.assignmentAlerts} onChange={(event) => update({ assignmentAlerts: event.target.checked })} /> Needed</label><label><input type="checkbox" checked={recipient.overdueAlerts} onChange={(event) => update({ overdueAlerts: event.target.checked })} /> Overdue</label></div><button className="button danger small" type="button" onClick={() => saveConfig({ ...config, usersForEmailAlerts: config.usersForEmailAlerts.filter((_, itemIndex) => itemIndex !== index) }, `${recipient.name} removed.`)}>Remove</button></article>;
}

function AddRecipientForm({ config, saveConfig, setNotice }: { config: StoreConfig; saveConfig: (config: StoreConfig, message?: string) => Promise<void>; setNotice: (notice: Notice) => void }) {
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  return <form className="add-row recipient-add" onSubmit={async (event) => { event.preventDefault(); const normalized = email.trim().toLowerCase(); if (config.usersForEmailAlerts.some((item) => item.email === normalized)) { setNotice({ type: "error", text: "That recipient already exists." }); return; } const recipient: EmailRecipient = { name: name.trim(), email: normalized, alertsEnabled: true, assignmentAlerts: true, overdueAlerts: true }; await saveConfig({ ...config, usersForEmailAlerts: [...config.usersForEmailAlerts, recipient] }, "Demo recipient added."); setName(""); setEmail(""); }}><strong>Add recipient</strong><label>Name<input value={name} onChange={(event) => setName(event.target.value)} required /></label><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><button className="button primary">Add</button></form>;
}

function exportCompletionCsv(storeCode: string, fryers: Fryer[], setNotice: (notice: Notice) => void) {
  const entries = fryers.flatMap((fryer) => fryer.history.filter((entry) => entry.action === "Boil-out logged").map((entry) => [storeCode, fryer.name, entry.initials || "", entry.timestamp]));
  if (!entries.length) { setNotice({ type: "error", text: "No completion history is available." }); return; }
  const csv = [["store_code", "fryer", "initials", "completed_at"], ...entries].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a"); link.href = url; link.download = `${storeCode}-demo-boil-outs.csv`; link.click(); URL.revokeObjectURL(url);
  setNotice({ type: "success", text: "Demo CSV exported." });
}
