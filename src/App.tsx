import { BrowserRouter, Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import { DemoBanner } from "./components/DemoBanner";
import { TourOverlay } from "./components/TourOverlay";
import { FryerPage } from "./pages/FryerPage";
import { LeadershipPage } from "./pages/LeadershipPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { StoreDashboardPage } from "./pages/StoreDashboardPage";
import { DemoDataProvider } from "./state/DemoDataContext";
import { TourProvider } from "./state/TourContext";

function LegacyStoreRedirect() {
  const [search] = useSearchParams();
  return <Navigate replace to={`/store/${search.get("store") || "CFA02851"}`} />;
}

function LegacyFryerRedirect() {
  const [search] = useSearchParams();
  return <Navigate replace to={`/fryer/${search.get("store") || "CFA02851"}/${search.get("id") || "1"}`} />;
}

function DemoRoutes() {
  return (
    <TourProvider>
      <DemoBanner />
      <Routes>
        <Route path="/" element={<Navigate replace to="/store/CFA02851" />} />
        <Route path="/store/:storeCode" element={<StoreDashboardPage />} />
        <Route path="/fryer/:storeCode/:fryerId" element={<FryerPage />} />
        <Route path="/leadership/:storeCode" element={<LeadershipPage />} />
        <Route path="/development" element={<Navigate replace to="/store/CFA02851" />} />
        <Route path="/index.html" element={<LegacyStoreRedirect />} />
        <Route path="/fryer.html" element={<LegacyFryerRedirect />} />
        <Route path="/leadership-dashboard.html" element={<Navigate replace to="/leadership/CFA02851" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <TourOverlay />
    </TourProvider>
  );
}

export function App() {
  return <DemoDataProvider><BrowserRouter><DemoRoutes /></BrowserRouter></DemoDataProvider>;
}
