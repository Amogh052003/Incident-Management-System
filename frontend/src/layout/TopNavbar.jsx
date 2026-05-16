import { Shield, Search, Activity } from "lucide-react";
import { motion } from "framer-motion";

const PULSE = {
  scale: [1, 1.08, 1],
  opacity: [0.7, 1, 0.7],
  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
};

export default function TopNavbar({ p0Count, p1Count, totalActive }) {
  return (
    <nav className="top-navbar">
      <div className="top-navbar-left">
        <Shield size={22} className="navbar-logo-icon" />
        <span className="navbar-brand">IMS</span>
        <span className="navbar-version">v2</span>
      </div>

      <div className="top-navbar-center">
        <div className="cluster-badge">
          <motion.span className="cluster-dot" animate={PULSE} />
          prod-us-east
        </div>

        <div className="navbar-stat">
          <span className="navbar-stat-label">Active</span>
          <span className="navbar-stat-value">{totalActive}</span>
        </div>

        <div className="navbar-stat">
          <span className="navbar-stat-label">P0</span>
          <span className="navbar-stat-value severity-p0">{p0Count}</span>
        </div>

        <div className="navbar-stat">
          <span className="navbar-stat-label">P1</span>
          <span className="navbar-stat-value severity-p1">{p1Count}</span>
        </div>

        <div className="navbar-stat">
          <span className="navbar-stat-label">Signals/s</span>
          <span className="navbar-stat-value">
            <Activity size={14} className="signals-icon" />
            24
          </span>
        </div>
      </div>

      <div className="top-navbar-right">
        <Search size={18} className="navbar-icon" />
      </div>
    </nav>
  );
}
