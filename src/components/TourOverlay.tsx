import { useEffect, useMemo, useState } from "react";
import { TOUR_STEPS, useTour } from "../state/TourContext";

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

export function TourOverlay() {
  const { active, autoPlay, index, step, next, previous, skip, setAutoPlay } = useTour();
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
      target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
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
  }, [active, step.id, step.target]);

  const cardPosition = useMemo(() => highlight && highlight.top > window.innerHeight * 0.5 ? "top" : "bottom", [highlight]);
  if (!active) return null;

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
          <span>Interactive tour</span>
          <span>{index + 1} / {TOUR_STEPS.length}</span>
        </div>
        <div className="tour-progress"><span key={step.id} className={autoPlay && !step.interaction ? "playing" : ""} /></div>
        <h2>{step.title}</h2>
        <p>{step.body}</p>
        <div className="tour-actions">
          <button className="button ghost small" type="button" onClick={skip}>Skip</button>
          <button className="button ghost small" type="button" onClick={() => setAutoPlay(!autoPlay)} disabled={Boolean(step.interaction)}>{step.interaction ? "Hands-on step" : autoPlay ? "Pause" : "Auto-play"}</button>
          <button className="button ghost small" type="button" onClick={previous} disabled={index === 0}>Back</button>
          <button className="button primary small" type="button" onClick={next} disabled={Boolean(step.interaction)}>{step.interaction ? "Complete action" : index === TOUR_STEPS.length - 1 ? "Explore demo" : "Next"}</button>
        </div>
      </section>
    </div>
  );
}
