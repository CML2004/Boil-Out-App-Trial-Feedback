import { useEffect, useMemo, useState } from "react";
import {
  AUTO_ADVANCE_MS,
  EXHIBIT_ACTION_MS,
  EXHIBIT_INFO_MS,
  TOUR_STEPS,
  useTour,
  type DemoExperience
} from "../state/TourContext";

interface HighlightRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

function measure(element: Element): HighlightRect {
  const rect = element.getBoundingClientRect();
  const padding = 8;
  const top = Math.max(0, rect.top - padding);
  const left = Math.max(0, rect.left - padding);
  const right = Math.min(window.innerWidth, rect.right + padding);
  const bottom = Math.min(window.innerHeight, rect.bottom + padding);
  return { top, left, right, bottom, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
}

const EXPERIENCE_OPTIONS: Array<{ id: DemoExperience; label: string; badge: string; description: string }> = [
  {
    id: "exhibit",
    label: "Exhibit",
    badge: "Watch",
    description: "See a guided walkthrough that fills forms, performs demo actions, and moves forward automatically."
  },
  {
    id: "interactive",
    label: "Interactive",
    badge: "Recommended",
    description: "Follow the guided tour and use each highlighted OpsTrack control yourself."
  },
  {
    id: "free",
    label: "Free browse",
    badge: "Explore",
    description: "Dismiss the tour and explore every simulated screen at your own pace."
  }
];

function ExperienceChooser({ chooseExperience }: { chooseExperience: (experience: DemoExperience) => void }) {
  return (
    <div className="tour-layer" aria-live="polite">
      <div className="tour-shade tour-shade-full" />
      <section className="experience-picker" role="dialog" aria-modal="true" aria-labelledby="experience-title">
        <div className="eyebrow">OpsTrack interactive demo</div>
        <h2 id="experience-title">Choose your demo experience</h2>
        <p>Select the pace and level of participation that works best for you. You can change this later from the demo banner.</p>
        <div className="experience-options">
          {EXPERIENCE_OPTIONS.map((option) => (
            <button key={option.id} type="button" autoFocus={option.id === "interactive"} onClick={() => chooseExperience(option.id)}>
              <span className="experience-option-top"><strong>{option.label}</strong><small>{option.badge}</small></span>
              <span>{option.description}</span>
              <span className="experience-option-arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export function TourOverlay() {
  const {
    active, autoPlay, chooseExperience, experience, index, isAdvancing,
    next, previous, setAutoPlay, skip, step
  } = useTour();
  const [highlight, setHighlight] = useState<HighlightRect | null>(null);

  useEffect(() => {
    if (!active || !step.target) {
      setHighlight(null);
      return;
    }

    let stopped = false;
    let attempts = 0;
    let target: Element | null = null;
    let retryTimer = 0;

    const update = () => {
      if (!stopped && target) setHighlight(measure(target));
    };

    const locate = () => {
      if (stopped) return;
      target = document.querySelector(`[data-tour-id="${step.target}"]`);
      if (!target && attempts < 40) {
        attempts += 1;
        retryTimer = window.setTimeout(locate, 100);
        return;
      }
      if (!target) {
        setHighlight(null);
        return;
      }
      target.scrollIntoView({ behavior: "smooth", block: step.scrollBlock ?? "center", inline: "nearest" });
      window.setTimeout(update, 360);
      update();
    };

    locate();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      stopped = true;
      window.clearTimeout(retryTimer);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, step.id, step.scrollBlock, step.target]);

  const cardPosition = useMemo(
    () => step.cardPosition ?? (highlight && highlight.top > window.innerHeight * 0.5 ? "top" : "bottom"),
    [highlight, step.cardPosition]
  );
  if (!experience) return <ExperienceChooser chooseExperience={chooseExperience} />;
  if (!active) return null;

  const exhibit = experience === "exhibit";
  const progressDuration = exhibit
    ? (step.interaction ? EXHIBIT_ACTION_MS : EXHIBIT_INFO_MS)
    : AUTO_ADVANCE_MS;
  const title = exhibit && step.id === "finish" ? "Exhibit walkthrough complete" : step.title;
  const body = exhibit && step.id === "welcome"
    ? "This guided exhibit walks through OpsTrack and performs each simulated action for you. Pause or move between steps whenever you want."
    : exhibit && step.id === "finish"
      ? "Explore freely, restart the exhibit, choose a different experience, or use Give Feedback to share what would make OpsTrack more useful."
      : exhibit && step.id === "export-report"
        ? "This is where a leader exports the simulated completion report. The exhibit previews the control without downloading a file."
        : `${step.body}${exhibit && step.interaction ? " This action will run automatically." : ""}`;
  const nextLabel = isAdvancing
    ? "Working…"
    : index === TOUR_STEPS.length - 1
      ? "Explore demo"
      : exhibit && step.interaction
        ? "Run now"
        : step.interaction
          ? "Skip action"
          : "Next";

  return (
    <div className="tour-layer" aria-live="polite">
      {highlight ? (
        <>
          <div className="tour-shade" style={{ inset: `0 0 ${window.innerHeight - highlight.top}px 0` }} />
          <div className="tour-shade" style={{ inset: `${highlight.bottom}px 0 0 0` }} />
          <div className="tour-shade" style={{ inset: `${highlight.top}px ${window.innerWidth - highlight.left}px ${window.innerHeight - highlight.bottom}px 0` }} />
          <div className="tour-shade" style={{ inset: `${highlight.top}px 0 ${window.innerHeight - highlight.bottom}px ${highlight.right}px` }} />
          <div className="tour-focus-ring" style={{ top: highlight.top, left: highlight.left, width: highlight.width, height: highlight.height }} />
        </>
      ) : <div className="tour-shade tour-shade-full" />}

      <section className={`tour-card ${cardPosition}`} role="dialog" aria-modal="true" aria-label="Interactive demo tour">
        <div className="tour-progress-row">
          <span>{exhibit ? "Exhibit tour" : "Interactive tour"}</span>
          <span>{index + 1} / {TOUR_STEPS.length}</span>
        </div>
        <div className="tour-progress"><span key={step.id} className={autoPlay && (exhibit || !step.interaction) ? "playing" : ""} style={{ animationDuration: `${progressDuration}ms` }} /></div>
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="tour-actions">
          <button className="button ghost small" type="button" onClick={skip} disabled={isAdvancing}>Exit tour</button>
          <button className="button ghost small" type="button" onClick={() => setAutoPlay(!autoPlay)} disabled={isAdvancing || (!exhibit && Boolean(step.interaction))}>{exhibit ? (autoPlay ? "Pause" : "Resume") : step.interaction ? "Hands-on step" : autoPlay ? "Pause" : "Auto-play"}</button>
          <button className="button ghost small" type="button" onClick={previous} disabled={isAdvancing || index === 0}>Back</button>
          <button className="button primary small" type="button" onClick={next} disabled={isAdvancing}>{nextLabel}</button>
        </div>
      </section>
    </div>
  );
}
