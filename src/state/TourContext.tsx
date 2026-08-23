import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type TourInteraction = "click" | "change" | "form";

export interface TourStep {
  id: string;
  path: string;
  target?: string;
  interaction?: TourInteraction;
  title: string;
  body: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    path: "/store/CFA02851",
    title: "Welcome to the interactive OpsTrack demo",
    body: "This is a hands-on demo. Select Next to begin, then use each highlighted control yourself to move through the workflow."
  },
  {
    id: "install-button",
    path: "/store/CFA02851",
    target: "install-button",
    interaction: "click",
    title: "Select Add to Home Screen",
    body: "Press the highlighted button to see the instructions used for keeping the dashboard readily available on a kitchen display."
  },
  {
    id: "install-close",
    path: "/store/CFA02851",
    target: "install-close",
    interaction: "click",
    title: "Close the instructions",
    body: "Select Got It to return to the live store view."
  },
  {
    id: "filter-needed",
    path: "/store/CFA02851",
    target: "filter-needed",
    interaction: "click",
    title: "Filter the kitchen view",
    body: "Press Needed to isolate fryers that currently require attention."
  },
  {
    id: "open-fryer",
    path: "/store/CFA02851",
    target: "fryer-card-3",
    interaction: "click",
    title: "Open a fryer",
    body: "Select the highlighted fryer card to open its operational record."
  },
  {
    id: "fryer-status",
    path: "/fryer/CFA02851/3",
    target: "fryer-status",
    title: "Review the current status",
    body: "This page shows the fryer status, most recent boil-out, and the timing rules configured for its equipment type."
  },
  {
    id: "log-button",
    path: "/fryer/CFA02851/3",
    target: "log-button",
    interaction: "click",
    title: "Press Log Boil Out",
    body: "Select the highlighted action to begin recording a completed boil-out."
  },
  {
    id: "log-form",
    path: "/fryer/CFA02851/3",
    target: "log-form",
    interaction: "form",
    title: "Complete the log",
    body: "Enter two or three initials, then press Submit. The tour continues after the simulated save succeeds."
  },
  {
    id: "log-result",
    path: "/fryer/CFA02851/3",
    target: "fryer-status",
    title: "The fryer updates immediately",
    body: "The completion resets the status and creates one uniquely identified history entry. Select Next when you are ready to flag an issue."
  },
  {
    id: "flag-button",
    path: "/fryer/CFA02851/3",
    target: "flag-button",
    interaction: "click",
    title: "Press Boil Out Needed",
    body: "Select the highlighted action to flag the fryer for attention."
  },
  {
    id: "flag-form",
    path: "/fryer/CFA02851/3",
    target: "flag-form",
    interaction: "form",
    title: "Describe the issue",
    body: "Choose a reason, optionally add a note, enter your initials, and press Submit."
  },
  {
    id: "flag-result",
    path: "/fryer/CFA02851/3",
    target: "fryer-status",
    title: "The needed flag is now visible",
    body: "The fryer status and audit record now reflect the issue. In production, enabled email notifications can also be queued from this action."
  },
  {
    id: "history-toggle",
    path: "/fryer/CFA02851/3",
    target: "history-toggle",
    interaction: "click",
    title: "Open Boil Out History",
    body: "Press the history control to review the actions you just completed."
  },
  {
    id: "history-result",
    path: "/fryer/CFA02851/3",
    target: "history-content",
    title: "Review the audit trail",
    body: "Each completion, flag, correction, and leader action retains its time, initials, reason, and notes."
  },
  {
    id: "leader-toggle",
    path: "/fryer/CFA02851/3",
    target: "leader-toggle",
    interaction: "click",
    title: "Open Leader Tools",
    body: "Press Leader Tools to open the protected operational controls."
  },
  {
    id: "leader-pin",
    path: "/fryer/CFA02851/3",
    target: "leader-pin-form",
    interaction: "form",
    title: "Enter the demo PIN",
    body: "Enter 1234 and press Submit to unlock the leader controls."
  },
  {
    id: "leader-clear",
    path: "/fryer/CFA02851/3",
    target: "leader-clear-form",
    interaction: "form",
    title: "Clear the needed flag",
    body: "Choose why the flag is being cleared, enter your initials, optionally add a note, and press Clear Flag."
  },
  {
    id: "leader-result",
    path: "/fryer/CFA02851/3",
    target: "fryer-status",
    title: "The leader action is recorded",
    body: "The flag is resolved and the reason is retained in history. Next, return to the store dashboard."
  },
  {
    id: "dashboard-link",
    path: "/fryer/CFA02851/3",
    target: "dashboard-link",
    interaction: "click",
    title: "Return to the dashboard",
    body: "Press Dashboard to return to the store overview."
  },
  {
    id: "leadership-link",
    path: "/store/CFA02851",
    target: "leadership-link",
    interaction: "click",
    title: "Open the leadership dashboard",
    body: "Select the highlighted settings button to manage this store."
  },
  {
    id: "add-fryer",
    path: "/leadership/CFA02851",
    target: "add-fryer-form",
    interaction: "form",
    title: "Add a demo fryer",
    body: "Enter a name, choose a type and date, then press Add. The new fryer stays only in this browser session."
  },
  {
    id: "timing-rule",
    path: "/leadership/CFA02851",
    target: "timing-rule-form",
    interaction: "form",
    title: "Save a timing rule",
    body: "Review or adjust the Needed and Overdue thresholds, then press Save."
  },
  {
    id: "recipient-toggle",
    path: "/leadership/CFA02851",
    target: "recipient-needed-toggle",
    interaction: "change",
    title: "Change an email preference",
    body: "Toggle the highlighted Needed checkbox to control whether this recipient receives needed alerts."
  },
  {
    id: "reminder-form",
    path: "/leadership/CFA02851",
    target: "reminder-form",
    interaction: "form",
    title: "Save the reminder schedule",
    body: "Choose how many days should pass between overdue reminders, then press Save reminder schedule."
  },
  {
    id: "export-report",
    path: "/leadership/CFA02851",
    target: "export-button",
    interaction: "click",
    title: "Export a completion report",
    body: "Press Export Demo CSV to download the simulated completion history."
  },
  {
    id: "finish",
    path: "/store/CFA02851",
    title: "You completed the hands-on workflow",
    body: "Explore freely, restart the tour, reset the simulated data, or use Give Feedback to share what would make OpsTrack more useful."
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
  completeStep: (stepId: string) => void;
  setAutoPlay: (value: boolean) => void;
}

const TourContext = createContext<TourValue | null>(null);
const AUTO_ADVANCE_MS = 9_000;

export function TourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
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
  const restart = useCallback(() => { setIndex(0); setActive(true); setAutoPlay(false); }, []);
  const completeStep = useCallback((stepId: string) => {
    if (!active) return;
    setIndex((current) => {
      if (TOUR_STEPS[current]?.id !== stepId) return current;
      if (current >= TOUR_STEPS.length - 1) {
        setActive(false);
        setAutoPlay(false);
        return current;
      }
      return current + 1;
    });
  }, [active]);

  useEffect(() => {
    if (!active || !autoPlay || step.interaction || index >= TOUR_STEPS.length - 1) return;
    const timer = window.setTimeout(next, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [active, autoPlay, index, next, step.interaction]);

  const value = useMemo<TourValue>(() => ({
    active, autoPlay, index, step, next, previous, skip, restart, completeStep, setAutoPlay
  }), [active, autoPlay, completeStep, index, next, previous, restart, skip, step]);

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourValue {
  const value = useContext(TourContext);
  if (!value) throw new Error("useTour must be used inside TourProvider");
  return value;
}
