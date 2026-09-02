import { useDemoData } from "../state/DemoDataContext";
import { useTour } from "../state/TourContext";

export const FEEDBACK_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfVO5ZLf7eKYrulaZz8IfLqwuQl2YvL6AAZPvQfg66m9EMbcw/viewform?usp=dialog";

export function DemoBanner() {
  const { resetDemo } = useDemoData();
  const { changeExperience, experience, restart } = useTour();
  const experienceLabel = experience === "exhibit"
    ? "Exhibit experience — guided actions run automatically"
    : experience === "interactive"
      ? "Interactive experience — follow the prompts and try each action"
      : experience === "free"
        ? "Free browse — explore the simulated product at your own pace"
        : "Choose how you want to explore the demo";
  return (
    <aside className="demo-banner">
      <div><strong>OpsTrack demo</strong><span>{experienceLabel}</span></div>
      <nav aria-label="Demo actions">
        {experience && experience !== "free" && <button type="button" onClick={restart}>Restart tour</button>}
        <button type="button" onClick={changeExperience}>Change experience</button>
        <button type="button" onClick={resetDemo}>Reset data</button>
        <a href={FEEDBACK_URL} target="_blank" rel="noreferrer">Give feedback</a>
        <a href="https://opstrack.net" target="_blank" rel="noreferrer">OpsTrack home</a>
      </nav>
    </aside>
  );
}
