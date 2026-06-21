import { useState, useEffect } from "react";
import TopNavbar from "./layout/TopNavbar";
import Sidebar from "./layout/Sidebar";
import Overview from "./views/Overview";
import TopologyView from "./views/TopologyView";
import IncidentsView from "./views/IncidentsView";
import ServicesView from "./views/ServicesView";
import RCAView from "./views/RCAView";
import PluginsView from "./views/PluginsView";
import GitHubView from "./views/GitHubView";
import IntegrationsView from "./views/IntegrationsView";
import SettingsView from "./views/SettingsView";
import { useIncidents } from "./hooks/useIncidents";

export default function App() {
  const { incidents, loading, p0Count, p1Count, totalActive } = useIncidents();
  const [activeView, setActiveView] = useState("overview");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("github") === "connected") {
      setActiveView("github");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const renderView = () => {
    switch (activeView) {
      case "topology": return <TopologyView />;
      case "incidents": return <IncidentsView />;
      case "services": return <ServicesView />;
      case "rca": return <RCAView />;
      case "github": return <GitHubView />;
      case "plugins": return <PluginsView />;
      case "integrations": return <IntegrationsView />;
      case "settings": return <SettingsView />;
      default: return <Overview />;
    }
  };

  return (
    <div className="app-layout">
      <TopNavbar p0Count={p0Count} p1Count={p1Count} totalActive={totalActive} />
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="main-content">{renderView()}</main>
    </div>
  );
}
