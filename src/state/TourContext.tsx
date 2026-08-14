import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export interface TourStep {
  id: string;
  path: string;
  target?: string;
  title: string;
  body: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    path: "/store/CFA02851",
    title: "Welcome to the interactive OpsTrack demo",
    body: "This tour opens every major workflow using safe, simulated data. It will advance automatically, or you can use Next and Back at your own pace."
  },
  {
    id: "dashboard-statuses",
    path: "/store/CFA02851",
    target: "dashboard-grid",
    title: "See every fryer at a glance",
    body: "Cards are ordered by urgency and show operational, needed, overdue, and manually flagged states without relying on color alone."
  },
  {
    id: "dashboard-filters",
    path: "/store/CFA02851",
    target: "dashboard-filters",
    title: "Filter the kitchen view",
    body: "Live counts make it easy to isolate fryers that need attention while the dashboard continues updating in real time."
  },
  {
    id: "fryer-status",
    path: "/fryer/CFA02851/3",
    target: "fryer-status",
    title: "Open an individual fryer",
    body: "In production, an NFC tag can open this exact fryer. The page explains its status, most recent boil-out, and configured timing rules."
  },
  {
    id: "log-workflow",
    path: "/fryer/CFA02851/3",
    target: "log-workflow",
    title: "Log a completed boil-out",
    body: "A team member enters initials and submits once. The demo updates the fryer and adds a unique history entry without contacting production services."
  },
  {
    id: "flag-workflow",
    path: "/fryer/CFA02851/3",
    target: "flag-workflow",
    title: "Flag a fryer for attention",
    body: "Users can select a reason, add notes, and attach initials. The production app can also queue assignment email alerts from this action."
  },
  {
    id: "history",
    path: "/fryer/CFA02851/4",
    target: "history-section",
    title: "Review the audit history",
    body: "Every completion, manual flag, correction, and leader action remains visible with its time, initials, reason, and notes."
  },
  {
    id: "leader-tools",
    path: "/fryer/CFA02851/4",
    target: "leader-tools",
    title: "Correct operational records",
    body: "Leader tools can set the latest boil-out date or clear a needed flag while recording who made the change and why."
  },
  {
    id: "leadership-equipment",
    path: "/leadership/CFA02851",
    target: "leadership-equipment",
    title: "Manage store equipment",
    body: "The leadership dashboard supports editing, adding, and removing fryers while keeping each fryer tied to a timing rule."
  },
  {
    id: "leadership-rules",
    path: "/leadership/CFA02851",
    target: "leadership-rules",
    title: "Configure timing rules",
    body: "Each fryer type can have its own Needed and Overdue thresholds, so the dashboard reflects the store's real equipment standards."
  },
  {
    id: "leadership-alerts",
    path: "/leadership/CFA02851",
    target: "leadership-alerts",
    title: "Manage alert recipients",
    body: "Leaders can choose who receives needed and overdue messages and set how often overdue reminders repeat."
  },
  {
    id: "leadership-reporting",
    path: "/leadership/CFA02851",
    target: "leadership-reporting",
    title: "Export accountability reporting",
    body: "Completion history can be exported as CSV with initials, dates, totals, and fryer names for leadership review."
  },
  {
    id: "development-overview",
    path: "/development",
    target: "development-overview",
    title: "Monitor the full rollout",
    body: "The development dashboard summarizes active, trial, blocked, and email-enabled stores along with basic usage activity."
  },
  {
    id: "development-controls",
    path: "/development",
    target: "development-controls",
    title: "Identify and control stores",
    body: "Store nicknames, live access, trial mode, email availability, usage, and administrative links are managed from one place."
  },
  {
    id: "finish",
    path: "/store/CFA02851",
    title: "You have seen the full workflow",
    body: "Explore freely, try any action, restart the tour, reset the demo data, or use Give Feedback to share what would make OpsTrack more useful."
  }
];

interface TourValue {
  active: boolean;
  autoPlay: boolean;
  index: number;
  step: TourStep;
  next: () => void;
  previous: () => void;
  skip: () => void;
  restart: () => void;
  setAutoPlay: (value: boolean) => void;
}

const TourContext = createContext<TourValue | null>(null);
const AUTO_ADVANCE_MS = 9_000;

export function TourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [index, setIndex] = useState(0);
  const step = TOUR_STEPS[index];

  useEffect(() => {
    if (active && location.pathname !== step.path) navigate(step.path);
  }, [active, location.pathname, navigate, step.path]);

  const next = useCallback(() => {
    setIndex((current) => {
      if (current >= TOUR_STEPS.length - 1) {
        setActive(false);
        setAutoPlay(false);
        return current;
      }
      return current + 1;
    });
  }, []);

  const previous = useCallback(() => setIndex((current) => Math.max(0, current - 1)), []);
  const skip = useCallback(() => { setActive(false); setAutoPlay(false); }, []);
  const restart = useCallback(() => { setIndex(0); setActive(true); setAutoPlay(true); }, []);

  useEffect(() => {
    if (!active || !autoPlay || index >= TOUR_STEPS.length - 1) return;
    const timer = window.setTimeout(next, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [active, autoPlay, index, next]);

  const value = useMemo<TourValue>(() => ({
    active, autoPlay, index, step, next, previous, skip, restart, setAutoPlay
  }), [active, autoPlay, index, next, previous, restart, skip, step]);

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourValue {
  const value = useContext(TourContext);
  if (!value) throw new Error("useTour must be used inside TourProvider");
  return value;
}
