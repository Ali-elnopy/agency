import { Icon } from "./Icons.jsx";

const roles = [
  {
    color: "orange", icon: "target", name: "Studio Lead & Admin", badge: "Full Control",
    text: "Total governance, budgets, client tenancy, system API keys.",
    tags: ["All Workspaces", "Approve & Publish", "Audit Log"], members: 4,
  },
  {
    color: "purple", icon: "eye", name: "Art Director", badge: "Review & Approve",
    text: "Asset approval flows, brand guide compliance & asset planning.",
    tags: ["Brand Assets", "Stage Gate Sign-off"], members: 18,
  },
  {
    color: "green", icon: "file", name: "Creator & Copywriter", badge: "Edit & Draft",
    text: "Draft creation, copy generation, canvas updates & revisions.",
    tags: ["Assignments", "Submit for Review"], members: 44,
  },
  {
    color: "gray", icon: "users", name: "Client Reviewer", badge: "External Sign-off",
    text: "External portal view, feedback markup, final approval & sign-off.",
    tags: ["Client Portal Only", "Approvals Access"], members: 9,
  },
];

export default function Roles() {
  return (
    <article className="panel">
      <header className="panel__head">
        <div>
          <h2 className="panel__title">
            <span className="chip is-orange"><Icon id="users" /></span>Roles &amp; Permissions
          </h2>
          <p className="panel__sub">Studio access matrix, governance levels &amp; member privileges.</p>
        </div>
        <button type="button" className="button button--primary button--sm">
          <Icon id="plus" />New Role
        </button>
      </header>

      <ul className="roles">
        {roles.map((role) => (
          <li key={role.name} className="role">
            <span className={`role__icon is-${role.color}`}><Icon id={role.icon} /></span>
            <div className="role__body">
              <div className="role__top">
                <strong>{role.name}</strong>
                <span className={`pill is-${role.color}`}>{role.badge}</span>
              </div>
              <p className="role__text">{role.text}</p>
              <p className="role__tags">
                {role.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </p>
            </div>
            <span className="role__count"><Icon id="users" />{role.members} Members</span>
          </li>
        ))}
      </ul>

      <footer className="panel__foot">
        <span className="panel__foot-note"><Icon id="check" />ISO &amp; Role-based ICOM Sync Active</span>
        <a href="#dashboard" className="link-action">
          Open Permissions Matrix <Icon id="arrow" />
        </a>
      </footer>
    </article>
  );
}
