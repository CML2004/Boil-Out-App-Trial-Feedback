import { Link } from "react-router-dom";

export function NotFoundPage() {
  return <main className="auth-page"><section className="auth-card"><img src="/logo.png" alt="OpsTrack" /><p className="eyebrow">Interactive demo</p><h1>Page not found</h1><p>Return to the demo store dashboard to continue exploring.</p><Link className="button primary" to="/store/CFA00000">Open demo dashboard</Link></section></main>;
}
