import { useState } from "react";
import { Icon } from "./Icons.jsx";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import Stats from "./Stats.jsx";
import Roles from "./Roles.jsx";
import Activity from "./Activity.jsx";

export default function Dashboard() {
  // Collapse / expand the sidebar
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app" data-collapsed={String(collapsed)}>
      <Sidebar onToggle={() => setCollapsed((c) => !c)} />

      <div className="workspace">
        <Topbar />

        <main className="content">
          <div className="crumbs">
            <nav aria-label="Breadcrumb">
              <a href="#dashboard">Home</a>
              <Icon id="chevron" />
              <strong>Dashboard</strong>
            </nav>

            <span className="pill is-green live-chip">Live Studio Ops</span>
          </div>

          <section className="page-head">
            <h1 className="page-head__title">Dashboard</h1>
            <p className="page-head__text">
              Agency Operating System &amp; Real-Time Production Velocity across active brand partners and user seats.
            </p>
          </section>

          <Stats />

          <section className="row row--admin">
            <Roles />
            <Activity />
          </section>
        </main>
      </div>
    </div>
  );
}
