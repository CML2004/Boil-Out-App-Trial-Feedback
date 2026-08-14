import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Modal } from "../components/Modal";
import { daysSince, formatShortDate, formatShortTimestamp, getFryerStatus } from "../domain/status";
import type { HistoryEntry } from "../domain/types";
import { useDemoData } from "../state/DemoDataContext";
import { useTour } from "../state/TourContext";

type Dialog = "log" | "flag" | "leader" | null;
const FLAG_REASONS = [
  ["oil-quality", "Oil quality degraded"], ["dark-oil", "Oil excessively dark"],
  ["excess-buildup", "Excess buildup / residue"], ["contamination", "Contamination"],
  ["smoke-odor", "Smoke / odor issue"], ["leadership-direction", "Leadership direction"], ["other", "Other"]
] as const;

const cleanInitials = (value: string) => value.trim().toUpperCase().slice(0, 3);
const formatReason = (value: string) => value.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
const historyEntry = (fields: Omit<HistoryEntry, "timestamp" | "actionId">): HistoryEntry => ({
  ...fields, timestamp: new Date().toISOString(), actionId: crypto.randomUUID()
});

export function FryerPage() {
  const navigate = useNavigate();
  const storeCode = String(useParams().storeCode || "CFA02851").toUpperCase();
  const fryerId = String(useParams().fryerId || "1");
  const { getStore, updateFryer } = useDemoData();
  const { completeStep } = useTour();
  const store = getStore(storeCode);
  const fryer = store?.fryers.find((item) => item.id === fryerId);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [initials, setInitials] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [pin, setPin] = useState("");
  const [leaderUnlocked, setLeaderUnlocked] = useState(false);
  const [leaderOpen, setLeaderOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [manualDate, setManualDate] = useState("");
  const [clearReason, setClearReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (notice?.type !== "success") return;
    const timeout = window.setTimeout(() => setNotice(null), 4_000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const sortedHistory = useMemo(() => [...(fryer?.history || [])].sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [fryer]);
  if (!store || !fryer) return <div className="empty-state">That demo fryer is not available.</div>;
  const status = getFryerStatus(fryer, store.config.typeRules);
  const rules = store.config.typeRules[fryer.type];

  const resetDialog = () => { setDialog(null); setInitials(""); setReason(""); setNotes(""); };
  const validInitials = () => {
    const value = cleanInitials(initials);
    if (value.length < 2) { setNotice({ type: "error", text: "Enter two or three initials." }); return ""; }
    return value;
  };

  const logBoilOut = async (event: FormEvent) => {
    event.preventDefault(); const value = validInitials(); if (!value || busy) return; setBusy(true);
    try {
      await updateFryer(storeCode, fryerId, { lastBoilOut: new Date().toISOString().slice(0, 10), needsBoilOut: false, needsReason: "", needsNotes: "" }, historyEntry({ action: "Boil-out logged", initials: value }));
      setNotice({ type: "success", text: "Demo boil-out logged." }); resetDialog();
      completeStep("log-form");
    } finally { setBusy(false); }
  };

  const flagNeeded = async (event: FormEvent) => {
    event.preventDefault(); const value = validInitials();
    if (!reason) { setNotice({ type: "error", text: "Select a reason first." }); return; }
    if (!value || busy) return; setBusy(true);
    try {
      await updateFryer(storeCode, fryerId, { needsBoilOut: true, needsReason: reason, needsNotes: notes.trim() }, historyEntry({ action: "Boil-out needed flagged", initials: value, reason, notes: notes.trim() }));
      setNotice({ type: "success", text: "Demo needed flag saved. An email would be queued in production." }); resetDialog();
      completeStep("flag-form");
    } finally { setBusy(false); }
  };

  const unlockLeader = (event: FormEvent) => {
    event.preventDefault();
    if (pin === "1234") { setLeaderUnlocked(true); setLeaderOpen(true); setDialog(null); setPin(""); completeStep("leader-pin"); }
    else setNotice({ type: "error", text: "Use the demo PIN: 1234" });
  };

  const saveDate = async (event: FormEvent) => {
    event.preventDefault(); const value = validInitials(); if (!value || !manualDate || busy) return; setBusy(true);
    try {
      await updateFryer(storeCode, fryerId, { lastBoilOut: manualDate }, historyEntry({ action: "Last boil-out date manually set", initials: value, notes: notes.trim(), dateValue: manualDate }));
      setNotice({ type: "success", text: "Demo date updated." }); setManualDate(""); setInitials(""); setNotes("");
    } finally { setBusy(false); }
  };

  const clearFlag = async (event: FormEvent) => {
    event.preventDefault(); const value = validInitials(); if (!value || !clearReason || busy) return; setBusy(true);
    try {
      await updateFryer(storeCode, fryerId, { needsBoilOut: false, needsReason: "", needsNotes: "" }, historyEntry({ action: "Boil-out needed cleared", initials: value, reason: clearReason, notes: notes.trim() }));
      setNotice({ type: "success", text: "Demo needed flag cleared." }); setClearReason(""); setInitials(""); setNotes("");
      completeStep("leader-clear");
    } finally { setBusy(false); }
  };

  const initialsInput = {
    value: initials, onChange: (event: React.ChangeEvent<HTMLInputElement>) => setInitials(cleanInitials(event.target.value)),
    minLength: 2, maxLength: 3, placeholder: "e.g. CML", autoCapitalize: "characters", autoCorrect: "off",
    autoComplete: "off", spellCheck: false, required: true
  } as const;

  return (
    <div className="page-shell">
      <header className="topbar"><div className="topbar-left"><button className="back" onClick={() => navigate(`/store/${storeCode}`)} aria-label="Back">←</button><h1>{fryer.name}</h1></div><Link data-tour-id="dashboard-link" to={`/store/${storeCode}`}>Dashboard</Link></header>
      {notice?.type === "error" && <div className="error-state notice-inline" role="alert">{notice.text}<button type="button" onClick={() => setNotice(null)} aria-label="Dismiss error">×</button></div>}
      <main className="wrap fryer-wrap">
        <section className={`status-card ${status}`} data-tour-id="fryer-status">
          <div className="status-top"><div><div className="eyebrow">Current Status</div><h2 className={`headline status-word ${status}`}>{status === "ok" ? "Operational" : status}</h2></div><div className={`status-icon ${status}`}>{status === "ok" ? "✓" : "!"}</div></div>
          <div className="last-box"><div className="last-label">Last Boil Out</div><div className="last-value">{formatShortDate(fryer.lastBoilOut)}</div><div className="meta-line">{fryer.type} • {daysSince(fryer.lastBoilOut)} days since last boil out • Needed at {rules?.neededDays} days • Overdue at {rules?.overdueDays} days</div></div>
        </section>
        <section className="actions"><button className="action-btn primary" data-tour-id="log-button" type="button" onClick={() => setDialog("log")}><span>Log Boil Out</span><span>→</span></button><button className="action-btn secondary" data-tour-id="flag-button" type="button" onClick={() => setDialog("flag")}><span>Boil Out Needed</span><span>!</span></button></section>

        <section className="dropdown-section" data-tour-id="history-section">
          <button className={`dropdown-toggle ${historyOpen ? "open" : ""}`} data-tour-id="history-toggle" type="button" onClick={() => setHistoryOpen(!historyOpen)}><span className="dropdown-toggle-title">Boil Out History</span><span className="dropdown-toggle-icon">⌄</span></button>
          <div className={`dropdown-content ${historyOpen ? "open" : ""}`} data-tour-id="history-content">{sortedHistory.length ? <div className="history-list">{sortedHistory.map((entry) => <article className="history-item" key={entry.actionId}><div className="history-title">{entry.action}</div><div className="history-meta">{formatShortTimestamp(entry.timestamp)}{entry.initials ? ` • ${entry.initials}` : ""}{entry.reason ? ` • ${formatReason(entry.reason)}` : ""}</div>{(entry.notes || entry.dateValue) && <div className="history-notes">{entry.dateValue ? `Date: ${formatShortDate(entry.dateValue)}\n` : ""}{entry.notes}</div>}</article>)}</div> : <div className="history-empty">No history yet.</div>}</div>
        </section>

        <section className="dropdown-section" data-tour-id="leader-tools">
          <button className={`dropdown-toggle ${leaderOpen ? "open" : ""}`} data-tour-id="leader-toggle" type="button" onClick={() => leaderUnlocked ? setLeaderOpen(!leaderOpen) : setDialog("leader")}><span className="dropdown-toggle-title">Leader Tools</span><span className="dropdown-toggle-icon">⌄</span></button>
          <div className={`dropdown-content ${leaderOpen ? "open" : ""}`}>
            <form className="tool-box" onSubmit={saveDate}><h3 className="tool-title">Set Last Boil Out</h3><p className="tool-desc">Correct the most recent date while retaining an audit entry.</p><div className="field"><label>Last Boil Out Date<input type="date" value={manualDate} onChange={(event) => setManualDate(event.target.value)} required /></label></div><div className="field"><label>Initials<input {...initialsInput} /></label></div><div className="field"><label>Notes (Optional)<textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></label></div><div className="inline-actions"><button className="btn btn-secondary" type="button" onClick={() => { setManualDate(""); setInitials(""); setNotes(""); }}>Clear</button><button className="btn btn-primary" disabled={busy}>{busy ? "Saving..." : "Save Date"}</button></div></form>
            <form className="tool-box" data-tour-id="leader-clear-form" onSubmit={clearFlag}><h3 className="tool-title">Clear Boil Out Needed</h3><p className="tool-desc">Resolve or override a current needed flag.</p><div className="field"><label>Reason<select value={clearReason} onChange={(event) => setClearReason(event.target.value)} required><option value="">Select a reason</option><option value="completed">Boil-out completed</option><option value="flag-added-in-error">Flag added in error</option><option value="issue-resolved">Issue resolved</option><option value="leadership-review">Leadership review</option></select></label></div><div className="field"><label>Initials<input {...initialsInput} /></label></div><div className="field"><label>Notes (Optional)<textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></label></div><div className="inline-actions"><button className="btn btn-secondary" type="button" onClick={() => { setClearReason(""); setInitials(""); setNotes(""); }}>Clear</button><button className="btn btn-primary" disabled={busy || !fryer.needsBoilOut}>{busy ? "Saving..." : "Clear Flag"}</button></div></form>
          </div>
        </section>
      </main>

      <Modal open={dialog === "log"} title="Log Boil Out" description="Enter initials to confirm this boil-out was completed." onClose={resetDialog}><form data-tour-id="log-form" onSubmit={logBoilOut}><div className="field"><label>Initials<input autoFocus {...initialsInput} /></label></div><div className="modal-actions"><button className="btn btn-secondary" type="button" onClick={resetDialog}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? "Saving..." : "Submit"}</button></div></form></Modal>
      <Modal open={dialog === "flag"} title="Boil Out Needed" description="Select a reason, add details, and enter initials." onClose={resetDialog}><form data-tour-id="flag-form" onSubmit={flagNeeded}><div className="field"><label>Reason<select autoFocus value={reason} onChange={(event) => setReason(event.target.value)} required><option value="">Select a reason</option>{FLAG_REASONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div><div className="field"><label>Notes (Optional)<textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></label></div><div className="field"><label>Initials<input {...initialsInput} /></label></div><div className="modal-actions"><button className="btn btn-secondary" type="button" onClick={resetDialog}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? "Saving..." : "Submit"}</button></div></form></Modal>
      <Modal open={dialog === "leader"} title="Leader Tools" description="Use demo PIN 1234 to preview protected controls." onClose={() => setDialog(null)}><form data-tour-id="leader-pin-form" onSubmit={unlockLeader}><div className="field"><label>Security PIN<input autoFocus type="password" inputMode="numeric" value={pin} onChange={(event) => setPin(event.target.value)} placeholder="1234" /></label></div><div className="modal-actions"><button className="btn btn-secondary" type="button" onClick={() => setDialog(null)}>Cancel</button><button className="btn btn-primary">Submit</button></div></form></Modal>
      {notice?.type === "success" && <div className="toast show" role="status" aria-live="polite"><div className="toast-check">✓</div><div className="toast-text">{notice.text}</div></div>}
    </div>
  );
}
