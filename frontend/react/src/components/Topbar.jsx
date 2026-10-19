import { Icon } from "./Icons.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Topbar() {
  return (
    <header className="topbar">
      <label className="search">
        <input type="search" placeholder="Search briefs, campaigns, assets, clients..." />
        <Icon id="search" />
      </label>

      <div className="topbar__right">
        <button type="button" className="icon-btn" aria-label="Help">
          <svg className="icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01" />
          </svg>
        </button>

        <ThemeToggle />

        <a href="#login" className="user" title="Sign out">
          <span className="user__text">
            <strong>Studio Lead</strong>
            <small>Admin | Creative Dir.</small>
          </span>
          <span className="avatar">SL</span>
        </a>

        <button type="button" className="button button--primary button--sm">
          <Icon id="plus" />New Brief
        </button>
      </div>
    </header>
  );
}
