import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { HistoryEntry } from "../domain/types";
import { useDemoData } from "./DemoDataContext";

export type TourInteraction = "click" | "change" | "form";
export type DemoExperience = "exhibit" | "interactive" | "free";

export interface TourStep {
  id: string;
  path: string;
  target?: string;
  interaction?: TourInteraction;
  cardPosition?: "top" | "bottom";
  scrollBlock?: "start" | "center" | "end";
  title: string;
  body: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    path: "/store/CFA00000",
    title: "Welcome to the interactive OpsTrack demo",
    body: "This is a hands-on demo. Select Next to begin, then use each highlighted control yourself to move through the workflow."
  },
  {
    id: "install-button",
    path: "/store/CFA00000",
    target: "install-button",
    interaction: "click",
    title: "Select Add to Home Screen",
    body: "Press the highlighted button to see the instructions used for keeping the dashboard readily available on a kitchen display."
  },
  {
    id: "install-instructions",
    path: "/store/CFA00000",
    target: "install-instructions",
    title: "Review the setup instructions",
    body: "These are the three steps used to add the OpsTrack shortcut to a kitchen iPad or tablet. Select Next after reviewing them."
  },
  {
    id: "install-close",
    path: "/store/CFA00000",
    target: "install-close",
    interaction: "click",
    title: "Close the instructions",
    body: "Select Got It to return to the store dashboard."
  },
  {
    id: "filter-needed",
    path: "/store/CFA00000",
    target: "filter-needed",
    interaction: "click",
    title: "Filter the kitchen view",
    body: "Press Needed to isolate fryers that currently require attention."
  },
  {
    id: "open-fryer",
    path: "/store/CFA00000",
    target: "fryer-card-4",
    interaction: "click",
    title: "Open a fryer",
    body: "Select the highlighted fryer card to open its operational record."
  },
  {
    id: "fryer-status",
    path: "/fryer/CFA00000/4",
    target: "fryer-status",
    title: "Review the current status",
    body: "This page shows the fryer status, most recent boil-out, and the timing rules configured for its equipment type."
  },
  {
    id: "log-button",
    path: "/fryer/CFA00000/4",
    target: "log-button",
    interaction: "click",
    title: "Press Log Boil Out",
    body: "Select the highlighted action to begin recording a completed boil-out."
  },
  {
    id: "log-form",
    path: "/fryer/CFA00000/4",
    target: "log-form",
    interaction: "form",
    title: "Complete the log",
    body: "Enter two or three initials, then press Submit. The tour continues after the simulated save succeeds."
  },
  {
    id: "log-result",
    path: "/fryer/CFA00000/4",
    target: "fryer-status",
    title: "The fryer updates immediately",
    body: "The completion resets the status and creates one uniquely identified history entry. Select Next when you are ready to flag an issue."
  },
  {
    id: "flag-button",
    path: "/fryer/CFA00000/4",
    target: "flag-button",
    interaction: "click",
    title: "Press Boil Out Needed",
    body: "Select the highlighted action to flag the fryer for attention."
  },
  {
    id: "flag-form",
    path: "/fryer/CFA00000/4",
    target: "flag-form",
    interaction: "form",
    title: "Describe the issue",
    body: "Choose a reason, optionally add a note, enter your initials, and press Submit."
  },
  {
    id: "flag-result",
    path: "/fryer/CFA00000/4",
    target: "fryer-status",
    title: "The needed flag is now visible",
    body: "The fryer status and audit record now reflect the issue. In production, enabled email notifications can also be queued from this action."
  },
  {
    id: "history-toggle",
    path: "/fryer/CFA00000/4",
    target: "history-toggle",
    interaction: "click",
    title: "Open Boil Out History",
    body: "Press the history control to review the actions you just completed."
  },
  {
    id: "history-result",
    path: "/fryer/CFA00000/4",
    target: "history-content",
    title: "Review the audit trail",
    body: "Each completion, flag, correction, and leader action retains its time, initials, reason, and notes."
  },
  {
    id: "leader-toggle",
    path: "/fryer/CFA00000/4",
    target: "leader-toggle",
    interaction: "click",
    title: "Open Leader Tools",
    body: "Press Leader Tools to open the protected operational controls."
  },
  {
    id: "leader-pin",
    path: "/fryer/CFA00000/4",
    target: "leader-pin-form",
    interaction: "form",
    title: "Enter the demo PIN",
    body: "Enter 1234 and press Submit to unlock the leader controls."
  },
  {
    id: "leader-tools-ready",
    path: "/fryer/CFA00000/4",
    target: "leader-clear-form",
    cardPosition: "top",
    scrollBlock: "end",
    title: "Leader controls are unlocked",
    body: "The Clear Boil Out Needed form is now available below. Review the fields, then select Next when you are ready to complete it."
  },
  {
    id: "leader-clear",
    path: "/fryer/CFA00000/4",
    target: "leader-clear-form",
    interaction: "form",
    cardPosition: "top",
    scrollBlock: "end",
    title: "Clear the needed flag",
    body: "Choose why the flag is being cleared, enter your initials, optionally add a note, and press Clear Flag."
  },
  {
    id: "leader-result",
    path: "/fryer/CFA00000/4",
    target: "fryer-status",
    title: "The leader action is recorded",
    body: "The flag is resolved and the reason is retained in history. Next, return to the store dashboard."
  },
  {
    id: "dashboard-link",
    path: "/fryer/CFA00000/4",
    target: "dashboard-link",
    interaction: "click",
    title: "Return to the dashboard",
    body: "Press Dashboard to return to the store overview."
  },
  {
    id: "leadership-link",
    path: "/store/CFA00000",
    target: "leadership-link",
    interaction: "click",
    title: "Open the leadership dashboard",
    body: "Select the highlighted settings button to manage this store."
  },
  {
    id: "add-fryer",
    path: "/leadership/CFA00000",
    target: "add-fryer-form",
    interaction: "form",
    title: "Add a demo fryer",
    body: "Enter a name, choose a type and date, then press Add. The new fryer stays only in this browser session."
  },
  {
    id: "timing-rule",
    path: "/leadership/CFA00000",
    target: "timing-rule-form",
    interaction: "form",
    title: "Save a timing rule",
    body: "Review or adjust the Needed and Overdue thresholds, then press Save."
  },
  {
    id: "recipient-toggle",
    path: "/leadership/CFA00000",
    target: "recipient-needed-toggle",
    interaction: "change",
    title: "Change an email preference",
    body: "Toggle the highlighted Needed checkbox to control whether this recipient receives needed alerts."
  },
  {
    id: "reminder-form",
    path: "/leadership/CFA00000",
    target: "reminder-form",
    interaction: "form",
    title: "Save the reminder schedule",
    body: "Choose how many days should pass between overdue reminders, then press Save reminder schedule."
  },
  {
    id: "export-report",
    path: "/leadership/CFA00000",
    target: "export-button",
    interaction: "click",
    title: "Export a completion report",
    body: "Press Export Demo CSV to download the simulated completion history."
  },
  {
    id: "finish",
    path: "/store/CFA00000",
    title: "You completed the hands-on workflow",
    body: "Explore freely, restart the tour, reset the simulated data, or use Give Feedback to share what would make OpsTrack more useful."
  }
];

interface TourValue {
  active: boolean;
  autoPlay: boolean;
  experience: DemoExperience | null;
  index: number;
  isAdvancing: boolean;
  step: TourStep;
  next: () => void;
  previous: () => void;
  skip: () => void;
  restart: () => void;
  changeExperience: () => void;
  chooseExperience: (experience: DemoExperience) => void;
  completeStep: (stepId: string) => void;
  setAutoPlay: (value: boolean) => void;
}

const TourContext = createContext<TourValue | null>(null);
export const AUTO_ADVANCE_MS = 9_000;
export const EXHIBIT_INFO_MS = 6_000;
export const EXHIBIT_ACTION_MS = 3_000;
const DEMO_STORE_CODE = "CFA00000";
const DEMO_FRYER_ID = "4";

function exhibitHistory(fields: Omit<HistoryEntry, "timestamp" | "actionId">): HistoryEntry {
  return { ...fields, timestamp: new Date().toISOString(), actionId: crypto.randomUUID() };
}

export function TourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { addFryer, getStore, restoreDemo, saveConfig, snapshotDemo, updateFryer } = useDemoData();
  const [experience, setExperience] = useState<DemoExperience | null>(null);
  const [active, setActive] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [index, setIndex] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const activeRef = useRef(active);
  const advancingRef = useRef(false);
  const experienceRef = useRef(experience);
  const indexRef = useRef(index);
  const snapshotsRef = useRef(new Map<number, ReturnType<typeof snapshotDemo>>());
  const step = TOUR_STEPS[index];

  if (snapshotsRef.current.size === 0) snapshotsRef.current.set(0, snapshotDemo());
  activeRef.current = active;
  experienceRef.current = experience;
  indexRef.current = index;

  useEffect(() => {
    if (active && location.pathname !== step.path) navigate(step.path);
  }, [active, location.pathname, navigate, step.path]);

  const advance = useCallback(() => {
    const current = indexRef.current;
    if (current >= TOUR_STEPS.length - 1) {
      activeRef.current = false;
      setActive(false);
      setAutoPlay(false);
      return;
    }
    const target = current + 1;
    snapshotsRef.current.set(target, snapshotDemo());
    indexRef.current = target;
    setIndex(target);
  }, [snapshotDemo]);

  const performExhibitAction = useCallback(async (stepId: string) => {
    const store = getStore(DEMO_STORE_CODE);
    if (!store) return;

    switch (stepId) {
      case "log-form":
        await updateFryer(DEMO_STORE_CODE, DEMO_FRYER_ID, {
          lastBoilOut: new Date().toISOString().slice(0, 10), needsBoilOut: false, needsReason: "", needsNotes: ""
        }, exhibitHistory({ action: "Boil-out logged", initials: "DM" }));
        break;
      case "flag-form":
        await updateFryer(DEMO_STORE_CODE, DEMO_FRYER_ID, {
          needsBoilOut: true, needsReason: "oil-quality", needsNotes: "Exhibit walkthrough"
        }, exhibitHistory({ action: "Boil-out needed flagged", initials: "DM", reason: "oil-quality", notes: "Exhibit walkthrough" }));
        break;
      case "leader-clear":
        await updateFryer(DEMO_STORE_CODE, DEMO_FRYER_ID, {
          needsBoilOut: false, needsReason: "", needsNotes: ""
        }, exhibitHistory({ action: "Boil-out needed cleared", initials: "DM", reason: "leadership-review", notes: "Exhibit walkthrough" }));
        break;
      case "add-fryer": {
        if (store.fryers.some((fryer) => fryer.name === "Exhibit Fryer")) break;
        const nextId = String(Math.max(0, ...store.fryers.map((fryer) => Number(fryer.id) || 0)) + 1);
        await addFryer(DEMO_STORE_CODE, {
          id: nextId,
          name: "Exhibit Fryer",
          type: Object.keys(store.config.typeRules)[0],
          lastBoilOut: new Date().toISOString().slice(0, 10),
          needsBoilOut: false,
          needsReason: "",
          needsNotes: "",
          history: []
        });
        break;
      }
      case "timing-rule":
        await saveConfig(DEMO_STORE_CODE, structuredClone(store.config));
        break;
      case "recipient-toggle":
        await saveConfig(DEMO_STORE_CODE, {
          ...store.config,
          usersForEmailAlerts: store.config.usersForEmailAlerts.map((recipient, recipientIndex) => recipientIndex === 0
            ? { ...recipient, assignmentAlerts: !recipient.assignmentAlerts }
            : recipient)
        });
        break;
      case "reminder-form":
        await saveConfig(DEMO_STORE_CODE, structuredClone(store.config));
        break;
      default:
        break;
    }
  }, [addFryer, getStore, saveConfig, updateFryer]);

  const next = useCallback(() => {
    const current = indexRef.current;
    const currentStep = TOUR_STEPS[current];
    if (experienceRef.current !== "exhibit" || !currentStep?.interaction) {
      advance();
      return;
    }
    if (advancingRef.current) return;
    advancingRef.current = true;
    setIsAdvancing(true);
    void performExhibitAction(currentStep.id).finally(() => {
      advancingRef.current = false;
      setIsAdvancing(false);
      if (activeRef.current && indexRef.current === current) advance();
    });
  }, [advance, performExhibitAction]);

  const previous = useCallback(() => {
    if (advancingRef.current) return;
    const target = Math.max(0, indexRef.current - 1);
    const snapshot = snapshotsRef.current.get(target);
    if (snapshot) restoreDemo(snapshot);
    indexRef.current = target;
    setIndex(target);
    setAutoPlay(false);
  }, [restoreDemo]);
  const skip = useCallback(() => {
    if (advancingRef.current) return;
    activeRef.current = false;
    setActive(false);
    setAutoPlay(false);
  }, []);
  const restart = useCallback(() => {
    if (!experienceRef.current || experienceRef.current === "free") {
      activeRef.current = false;
      setActive(false);
      setAutoPlay(false);
      setExperience(null);
      return;
    }
    const initialSnapshot = snapshotsRef.current.get(0);
    if (initialSnapshot) restoreDemo(initialSnapshot);
    snapshotsRef.current = new Map([[0, initialSnapshot ?? snapshotDemo()]]);
    indexRef.current = 0;
    activeRef.current = true;
    setIndex(0);
    setActive(true);
    setAutoPlay(experienceRef.current === "exhibit");
  }, [restoreDemo, snapshotDemo]);
  const changeExperience = useCallback(() => {
    if (advancingRef.current) return;
    activeRef.current = false;
    setActive(false);
    setAutoPlay(false);
    setExperience(null);
  }, []);
  const chooseExperience = useCallback((nextExperience: DemoExperience) => {
    const initialSnapshot = snapshotsRef.current.get(0) ?? snapshotDemo();
    restoreDemo(initialSnapshot);
    snapshotsRef.current = new Map([[0, initialSnapshot]]);
    indexRef.current = 0;
    activeRef.current = nextExperience !== "free";
    experienceRef.current = nextExperience;
    setIndex(0);
    setExperience(nextExperience);
    setActive(nextExperience !== "free");
    setAutoPlay(nextExperience === "exhibit");
    navigate(`/store/${DEMO_STORE_CODE}`);
  }, [navigate, restoreDemo, snapshotDemo]);
  const completeStep = useCallback((stepId: string) => {
    if (!activeRef.current || advancingRef.current || TOUR_STEPS[indexRef.current]?.id !== stepId) return;
    advance();
  }, [advance]);

  useEffect(() => {
    if (!active || !autoPlay || index >= TOUR_STEPS.length - 1) return;
    if (experience !== "exhibit" && step.interaction) return;
    const delay = experience === "exhibit" ? (step.interaction ? EXHIBIT_ACTION_MS : EXHIBIT_INFO_MS) : AUTO_ADVANCE_MS;
    const timer = window.setTimeout(next, delay);
    return () => window.clearTimeout(timer);
  }, [active, autoPlay, experience, index, next, step.interaction]);

  const value = useMemo<TourValue>(() => ({
    active, autoPlay, experience, index, isAdvancing, step, next, previous, skip, restart,
    changeExperience, chooseExperience, completeStep, setAutoPlay
  }), [active, autoPlay, changeExperience, chooseExperience, completeStep, experience, index, isAdvancing, next, previous, restart, skip, step]);

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourValue {
  const value = useContext(TourContext);
  if (!value) throw new Error("useTour must be used inside TourProvider");
  return value;
}
