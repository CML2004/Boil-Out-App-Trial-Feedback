import { useDemoData } from "../state/DemoDataContext";
import { useTour } from "../state/TourContext";

export const FEEDBACK_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfVO5ZLf7eKYrulaZz8IfLqwuQl2YvL6AAZPvQfg66m9EMbcw/viewform?usp=dialog";

export function DemoBanner() {
  const { resetDemo } = useDemoData();
  const { restart } = useTour();
  return (
    <aside className="demo-banner">
      <div><strong>Interactive demo</strong><span>Changes are simulated and reset when this page reloads.</span></div>
      <nav aria-label="Demo actions">
        <button type="button" onClick={restart}>Restart tour</button>
        <button type="button" onClick={resetDemo}>Reset data</button>
        <a href={FEEDBACK_URL} target="_blank" rel="noreferrer">Give feedback</a>
        <a href="https://opstrack.net" target="_blank" rel="noreferrer">OpsTrack home</a>
      </nav>
    </aside>
  );
}
