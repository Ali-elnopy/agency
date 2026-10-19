import { Icon } from "./Icons.jsx";

export default function Activity() {
  return (
    <article className="panel panel--activity">
      <header className="panel__head">
        <h2 className="panel__title">Studio Activity</h2>
        <a href="#dashboard" className="link-action">View All</a>
      </header>

      <ul className="feed">
        <li className="feed__item">
          <span className="feed__avatar is-a">EV</span>
          <div className="feed__body">
            <p className="feed__who"><strong>Elena Vance</strong><span className="feed__time">8m ago</span></p>
            <p className="feed__line">
              <span className="pill is-green"><Icon id="check" />Approved</span>
              &quot;Lumina Brand Refresh Q3 Hero Motion&quot; <span className="feed__role">Studio Lead</span>
            </p>
          </div>
        </li>

        <li className="feed__item">
          <span className="feed__avatar is-b">DR</span>
          <div className="feed__body">
            <p className="feed__who"><strong>Devon Ray</strong><span className="feed__time">42m ago</span></p>
            <p className="feed__line">
              Uploaded 6 new 3D assets to &quot;Kinetic Health Launch&quot; <span className="feed__role">Content Creator</span>
            </p>
          </div>
        </li>

        <li className="feed__item">
          <span className="feed__avatar is-c">MK</span>
          <div className="feed__body">
            <p className="feed__who"><strong>Milo Kostas</strong><span className="feed__time">2h ago</span></p>
            <p className="feed__line">
              Invited 2 client stakeholders from &quot;Aura Mobility&quot; <span className="feed__role">Account Manager</span>
            </p>
          </div>
        </li>

        <li className="feed__item">
          <span className="feed__avatar is-d">SL</span>
          <div className="feed__body">
            <p className="feed__who"><strong>Sarah Lin<i className="feed__dot"></i></strong><span className="feed__time">3h ago</span></p>
            <p className="feed__line">
              Updated the &quot;Q4 Style Guide Deck&quot; <span className="feed__role">Brand Lead</span>
            </p>
          </div>
        </li>

        <li className="feed__item feed__item--sys">
          <span className="feed__avatar feed__avatar--sys"><Icon id="layers" /></span>
          <div className="feed__body">
            <p className="feed__who"><strong>System Engine</strong><span className="feed__time">5h ago</span></p>
            <p className="feed__desc">Automated cloud backup &amp; CDN distribution completed for 14 active brands.</p>
          </div>
        </li>
      </ul>
    </article>
  );
}
