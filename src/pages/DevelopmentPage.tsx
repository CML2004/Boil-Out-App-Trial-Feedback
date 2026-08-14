import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import type { DemoStore } from "../domain/types";
import { useDemoData } from "../state/DemoDataContext";

type StoreTab = "active" | "blocked";
const allowsAccess = (store: DemoStore) => store.config.storeStatus.isLive || store.config.featureFlags.testingMode;

export function DevelopmentPage() {
  const { stores, saveConfig, removeStore } = useDemoData();
  const [tab, setTab] = useState<StoreTab>("active");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 4_000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const activeCount = stores.filter(allowsAccess).length;
  const visible = useMemo(() => stores.filter((store) => (tab === "active") === allowsAccess(store)), [stores, tab]);
  const mutate = async (action: () => Promise<void>, message: string) => {
    try { await action(); setNotice(message); setError(""); }
    catch { setError("The simulated change could not be saved."); }
  };

  return (
    <AppShell eyebrow="System administration • Interactive demo" title="Development dashboard" subtitle="Store rollout, feature access, and usage activity" actions={<Link className="button ghost small" to="/store/CFA02851">Store demo</Link>}>
      {error && <div className="notice error" role="alert">{error}</div>}
      {notice && <div className="notice success" role="status">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}
      <section className="metric-strip" data-tour-id="development-overview">
        <div><span>Total stores</span><strong>{stores.length}</strong></div>
        <div><span>Active / trial</span><strong>{activeCount}</strong></div>
        <div><span>Paywall blocked</span><strong>{stores.length - activeCount}</strong></div>
        <div><span>Email live</span><strong>{stores.filter((store) => store.config.featureFlags.emailAlertsLive).length}</strong></div>
      </section>
      <div className="dashboard-toolbar"><div className="segmented"><button className={tab === "active" ? "active" : ""} type="button" onClick={() => setTab("active")}>Active ({activeCount})</button><button className={tab === "blocked" ? "active" : ""} type="button" onClick={() => setTab("blocked")}>Paywall blocked ({stores.length - activeCount})</button></div><span className="sync-label">Simulated usage data</span></div>
      {visible.length ? <section className="store-admin-list" data-tour-id="development-controls">{visible.map((store) => (
        <article className="store-admin-card" key={store.storeCode}>
          <div className="store-admin-heading"><div><p className="eyebrow">{store.storeCode}</p><h2>{store.config.nickname || store.storeName}</h2>{store.config.nickname && <p className="store-admin-name">{store.storeName}</p>}</div><div className="row-actions"><Link className="button ghost small" to={`/store/${store.storeCode}`}>Store</Link><Link className="button ghost small" to={`/leadership/${store.storeCode}`}>Leadership</Link></div></div>
          <div className="store-metrics"><span>Last seen<strong>{new Date(store.usage.lastSeenAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</strong></span><span>Last page<strong>{store.usage.lastSeenPage}</strong></span><span>Page views<strong>{store.usage.totalPageViews}</strong></span><span>Events<strong>{store.eventCount}</strong></span></div>
          <NicknameEditor store={store} save={(nickname) => mutate(() => saveConfig(store.storeCode, { ...store.config, nickname: nickname.trim() || undefined }), `${store.storeCode} nickname updated.`)} />
          <div className="feature-controls">
            <label><input type="checkbox" checked={store.config.storeStatus.isLive} onChange={(event) => mutate(() => saveConfig(store.storeCode, { ...store.config, storeStatus: { isLive: event.target.checked }, featureFlags: { ...store.config.featureFlags, ...(event.target.checked ? { testingMode: false } : {}) } }), `${store.storeCode} live access updated.`)} /> Store live</label>
            <label><input type="checkbox" checked={store.config.featureFlags.emailAlertsLive} onChange={(event) => mutate(() => saveConfig(store.storeCode, { ...store.config, featureFlags: { ...store.config.featureFlags, emailAlertsLive: event.target.checked } }), `${store.storeCode} email access updated.`)} /> Email alerts live</label>
            <label><input type="checkbox" checked={store.config.featureFlags.testingMode} onChange={(event) => mutate(() => saveConfig(store.storeCode, { ...store.config, storeStatus: { isLive: event.target.checked ? false : store.config.storeStatus.isLive }, featureFlags: { ...store.config.featureFlags, testingMode: event.target.checked } }), `${store.storeCode} trial access updated.`)} /> Trial mode</label>
          </div>
          {!allowsAccess(store) && <button className="button danger" type="button" onClick={() => { if (!window.confirm(`Remove ${store.storeCode} from this demo?`)) return; mutate(() => removeStore(store.storeCode), `${store.storeCode} removed from the demo.`); }}>Remove blocked store</button>}
        </article>
      ))}</section> : <div className="empty-state">No stores in this view. Reset the demo to restore removed stores.</div>}
    </AppShell>
  );
}

function NicknameEditor({ store, save }: { store: DemoStore; save: (nickname: string) => Promise<void> }) {
  const saved = store.config.nickname || "";
  const [nickname, setNickname] = useState(saved);
  const [busy, setBusy] = useState(false);
  useEffect(() => setNickname(saved), [saved]);
  return <form className="store-nickname-form" onSubmit={async (event) => { event.preventDefault(); setBusy(true); try { await save(nickname); } finally { setBusy(false); } }}><label>Store nickname<input value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength={80} placeholder="Example: Downtown" /></label><button className="button primary small" disabled={busy || nickname.trim() === saved}>{busy ? "Saving…" : "Save nickname"}</button></form>;
}
