import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Modal } from "../components/Modal";
import { countFryerStatuses, daysSince, formatShortDate, getFryerStatus, getStatusSortRank } from "../domain/status";
import type { FryerStatus } from "../domain/types";
import { useDemoData } from "../state/DemoDataContext";
import { useTour } from "../state/TourContext";

type Filter = "all" | FryerStatus;

export function StoreDashboardPage() {
  const storeCode = String(useParams().storeCode || "CFA02851").toUpperCase();
  const { getStore } = useDemoData();
  const { completeStep } = useTour();
  const store = getStore(storeCode);
  const [filter, setFilter] = useState<Filter>("all");
  const [showInstall, setShowInstall] = useState(false);

  const fryerCards = useMemo(() => {
    if (!store) return [];
    return store.fryers.map((fryer) => ({
      fryer,
      status: getFryerStatus(fryer, store.config.typeRules),
      days: daysSince(fryer.lastBoilOut)
    })).sort((left, right) => getStatusSortRank(left.status) - getStatusSortRank(right.status) || right.days - left.days);
  }, [store]);
  const counts = useMemo(() => countFryerStatuses(fryerCards.map((item) => item.status)), [fryerCards]);
  const cards = fryerCards.filter((item) => filter === "all" || item.status === filter);
  const closeInstall = () => {
    setShowInstall(false);
    completeStep("install-close");
  };

  if (!store) return <div className="empty-state">That demo store is not available.</div>;

  return (
    <div className="page-shell store-page">
      <div className="page-content">
        <header className="header">
          <div className="title-stack">
            <h1>{`Store ${storeCode.replace("CFA", "")}`}</h1>
            <div className="last-updated">{store.config.nickname} • Demo data is live in this tab</div>
          </div>
          <div className="header-right">
            <button className="header-btn" type="button" data-tour-id="install-button" onClick={() => { setShowInstall(true); completeStep("install-button"); }}>Add to Home Screen</button>
            <Link className="settings-link" data-tour-id="leadership-link" to={`/leadership/${storeCode}`} title="Leadership Dashboard" aria-label="Leadership Dashboard" onClick={() => completeStep("leadership-link")}>⚙</Link>
          </div>
        </header>

        <div className="status-banner trial show">Interactive Demo Mode — No production data is changed</div>
        <div className="controls" data-tour-id="dashboard-filters" aria-label="Filter fryers">
          {(["all", "ok", "needed", "overdue"] as Filter[]).map((value) => (
            <button key={value} className={`filter-btn ${filter === value ? "active" : ""}`} data-tour-id={value === "needed" ? "filter-needed" : undefined} onClick={() => { setFilter(value); if (value === "needed") completeStep("filter-needed"); }} type="button">
              {value.toUpperCase()} ({counts[value]})
            </button>
          ))}
        </div>

        {cards.length ? (
          <section className="grid" data-tour-id="dashboard-grid">
            {cards.map(({ fryer, status, days }) => (
              <Link key={fryer.id} className={`card ${status}`} data-tour-id={fryer.id === "3" ? "fryer-card-3" : undefined} to={`/fryer/${storeCode}/${fryer.id}`} onClick={() => { if (fryer.id === "3") completeStep("open-fryer"); }}>
                <div><div className="fryer-id">{fryer.name}</div><div className="status">{status === "ok" ? "OPERATIONAL" : status.toUpperCase()}</div></div>
                <div>
                  <div className="label">Last Boil Out</div>
                  <div className="value">{formatShortDate(fryer.lastBoilOut)}</div>
                  <div className="meta">{days} day{days === 1 ? "" : "s"} ago<br />{fryer.type}</div>
                </div>
              </Link>
            ))}
          </section>
        ) : <div className="empty-state">No fryers found for this filter.</div>}
        <footer className="footer">Tap a fryer to try logging, flags, history, and leader tools</footer>
      </div>

      <Modal open={showInstall} title="Add to Home Screen" onClose={closeInstall}>
        <p>This is how a store can keep its dashboard available on a kitchen iPad or tablet.</p>
        <ol className="modal-steps"><li>Open the browser Share or menu button.</li><li>Select Add to Home Screen.</li><li>Confirm the OpsTrack shortcut.</li></ol>
        <div className="install-url">{window.location.href}</div>
        <div className="modal-actions"><button className="btn btn-primary" data-tour-id="install-close" type="button" onClick={closeInstall}>Got It</button></div>
      </Modal>
    </div>
  );
}
