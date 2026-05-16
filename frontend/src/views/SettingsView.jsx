import { useState, useEffect } from "react";
import { Settings, Shield, Bell, Server, Palette, Globe, Lock } from "lucide-react";

export default function SettingsView() {
  const [settings, setSettings] = useState([]);

  useEffect(() => {
    fetch("/settings").then(r => r.json())
      .then(setSettings).catch(() => {});
  }, []);

  const categories = {};
  for (const s of settings) {
    if (!categories[s.category]) categories[s.category] = [];
    categories[s.category].push(s);
  }

  const CATEGORY_META = {
    platform: { icon: Palette, title: "Platform", desc: "Theme, branding, display preferences" },
    security: { icon: Shield, title: "Security", desc: "RBAC, authentication, access policies" },
    notifications: { icon: Bell, title: "Notifications", desc: "Alert routing, escalation defaults" },
    infrastructure: { icon: Server, title: "Infrastructure", desc: "Discovery, runtime configs" },
  };

  return (
    <div className="settings-view">
      <div className="settings-view-header">
        <Settings size={16} />
        <span>Platform Settings</span>
        <span className="timeline-count">{settings.length} settings</span>
      </div>
      <div className="settings-grid">
        {Object.entries(CATEGORY_META).map(([cat, meta], gi) => {
          const Icon = meta.icon;
          const items = categories[cat] || [];
          return (
            <div key={cat} className="settings-section" style={{ animationDelay: `${gi * 0.05}s` }}>
              <div className="settings-section-header">
                <div className="settings-section-icon"><Icon size={18} /></div>
                <div>
                  <div className="settings-section-title">{meta.title}</div>
                  <div className="settings-section-desc">{meta.desc}</div>
                </div>
              </div>
              <div className="settings-section-items">
                {items.map(item => (
                  <div key={item.key} className="settings-item">
                    <span className="settings-item-key">{item.key.replace(/_/g, " ")}</span>
                    <span className="settings-item-value">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
