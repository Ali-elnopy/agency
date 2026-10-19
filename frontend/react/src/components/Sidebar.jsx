import Brand from "./Brand.jsx";
import { Icon } from "./Icons.jsx";

const items = [
  { icon: "dashboard", label: "Dashboard", active: true },
  { icon: "briefcase", label: "Brands" },
  { icon: "layers", label: "Teams" },
  { icon: "users", label: "Users & Clients" },
  { icon: "file", label: "Content" },
  { icon: "chart", label: "Analyze" },
  { icon: "settings", label: "Settings" },
];

export default function Sidebar({ onToggle }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <Brand href="#dashboard" labelClass="sb-label" />
        <button type="button" className="sidebar__collapse" aria-label="Collapse sidebar" onClick={onToggle}>
          <Icon id="panel" />
        </button>
      </div>

      <nav className="nav">
        {items.map(({ icon, label, active }) => (
          <a key={label} href="#dashboard" className={`nav__item${active ? " is-active" : ""}`}>
            <Icon id={icon} />
            <span className="sb-label">{label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar__foot">
        <a href="#dashboard" className="nav__item nav__item--kit">
          <Icon id="layers" />
          <span className="sb-label">UI Kit &amp; Tokens</span>
        </a>
        <p className="mode-chip sb-label"><i className="mode-chip__dot"></i>Sidebar Mode <b>Expanded</b></p>
      </div>
    </aside>
  );
}
