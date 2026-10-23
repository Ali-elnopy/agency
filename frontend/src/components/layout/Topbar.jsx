import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { useBrands } from '../../context/brandsStore';
import { useWorkspace } from '../../context/workspaceStore';

const MAX_PER_GROUP = 5;

const PAGES = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    hint: 'Organization overview & studio KPIs',
    icon: '#i-dashboard',
    keywords: 'home overview stats activity briefs',
  },
  {
    id: 'clients',
    label: 'Brands',
    hint: 'Brand portfolio, managers & squads',
    icon: '#i-briefcase',
    keywords: 'brands accounts portfolio clients',
  },
  {
    id: 'teams',
    label: 'Teams',
    hint: 'Squads, capacity & members',
    icon: '#i-layers',
    keywords: 'squads capacity people teams',
  },
  {
    id: 'users',
    label: 'Users',
    hint: 'Directory, roles & access',
    icon: '#i-users',
    keywords: 'people directory members users access',
  },
  {
    id: 'roles',
    label: 'Roles & Permissions',
    hint: 'RBAC matrix & studio governance',
    icon: '#i-shield',
    keywords: 'rbac permissions access governance roles',
  },
  {
    id: 'profile',
    label: 'Profile',
    hint: 'Personal details & workspace identity',
    icon: '#i-user',
    keywords: 'account profile identity personal',
  },
  {
    id: 'settings',
    label: 'Settings',
    hint: 'Workspace preferences & security',
    icon: '#i-settings',
    keywords: 'preferences security workspace notifications settings',
  },
];

const GROUP_LABELS = {
  pages: 'Pages',
  brands: 'Brands',
  teams: 'Teams',
  users: 'People',
};

function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim();
}

function haystack(...values) {
  return normalize(values.filter(Boolean).join(' '));
}

function Highlight({ text, query }) {
  const value = String(text ?? '');
  const needle = query.trim();

  if (!needle) return value;

  const index = value.toLowerCase().indexOf(needle.toLowerCase());
  if (index === -1) return value;

  return (
    <>
      {value.slice(0, index)}
      <mark>{value.slice(index, index + needle.length)}</mark>
      {value.slice(index + needle.length)}
    </>
  );
}

export default function Topbar({
  theme,
  onToggleTheme,
  onSignOut,
  onNewBrief,
  onOpenHelp,
  actionLabel = 'New Brief',
  onAction,
  searchPlaceholder = 'Search pages, brands, teams, people...',
  onSearchNavigate,
  onSearchBrand,
  onSearchTeam,
  onSearchUser,
}) {
  const { user } = useAuth();
  const { brands } = useBrands();
  const { users, teams } = useWorkspace();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const displayName = user?.fullName || 'Studio Lead';
  const roleDisplay = user?.role === 'ADMIN' ? 'Admin | Studio Lead' : 'Admin | Creative Dir.';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const closeSearch = useCallback(() => {
    setOpen(false);
    setActiveIndex(0);
  }, []);

  // Command/Ctrl+K focuses the global search from anywhere in the app.
  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  // Clicking anywhere outside the search closes the results panel.
  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) closeSearch();
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open, closeSearch]);

  const groups = useMemo(() => {
    const needle = normalize(search);
    const next = [];

    const pageMatches = PAGES.filter((page) =>
      !needle || haystack(page.label, page.hint, page.keywords).includes(needle),
    ).slice(0, needle ? MAX_PER_GROUP : PAGES.length);

    if (pageMatches.length) {
      next.push({
        key: 'pages',
        label: needle ? GROUP_LABELS.pages : 'Jump to',
        items: pageMatches.map((page) => ({
          key: `page-${page.id}`,
          kind: 'page',
          label: page.label,
          sublabel: page.hint,
          icon: page.icon,
          tag: 'Page',
          payload: page,
        })),
      });
    }

    if (needle) {
      const brandMatches = brands
        .filter((brand) =>
          haystack(
            brand.name,
            brand.industry,
            brand.country,
            brand.timezone,
            brand.timezoneLabel,
            brand.manager,
            brand.team,
            brand.status,
          ).includes(needle),
        )
        .slice(0, MAX_PER_GROUP);

      if (brandMatches.length) {
        next.push({
          key: 'brands',
          label: GROUP_LABELS.brands,
          items: brandMatches.map((brand) => ({
            key: `brand-${brand.id}`,
            kind: 'brand',
            label: brand.name,
            sublabel: [brand.industry, brand.country, brand.manager]
              .filter(Boolean)
              .join(' · '),
            icon: '#i-briefcase',
            tag: 'Brand',
            payload: brand,
          })),
        });
      }

      const teamMatches = teams
        .filter((team) =>
          haystack(team.name, team.description, team.status, ...(team.brandIds ?? [])).includes(
            needle,
          ),
        )
        .slice(0, MAX_PER_GROUP);

      if (teamMatches.length) {
        next.push({
          key: 'teams',
          label: GROUP_LABELS.teams,
          items: teamMatches.map((team) => {
            const memberCount = users.filter((member) => member.teamId === team.id).length;

            return {
              key: `team-${team.id}`,
              kind: 'team',
              label: team.name,
              sublabel: [`${memberCount} members`, `${team.brandIds?.length ?? 0} brands`].join(
                ' · ',
              ),
              icon: '#i-layers',
              tag: 'Team',
              payload: team,
            };
          }),
        });
      }

      const userMatches = users
        .filter((member) =>
          haystack(member.fullName, member.email, member.jobTitle, member.systemAccess).includes(
            needle,
          ),
        )
        .slice(0, MAX_PER_GROUP);

      if (userMatches.length) {
        next.push({
          key: 'users',
          label: GROUP_LABELS.users,
          items: userMatches.map((member) => ({
            key: `user-${member.id}`,
            kind: 'user',
            label: member.fullName,
            sublabel: [member.email, member.jobTitle].filter(Boolean).join(' · '),
            icon: '#i-user',
            tag: 'Person',
            payload: member,
          })),
        });
      }
    }

    return next;
  }, [search, brands, users, teams]);

  const flatItems = useMemo(() => groups.flatMap((group) => group.items), [groups]);

  useEffect(() => {
    setActiveIndex(0);
  }, [search, users, teams]);

  const choose = (item) => {
    if (!item) return;

    setSearch('');
    closeSearch();

    if (item.kind === 'page') {
      onSearchNavigate?.(item.payload.id);
    } else if (item.kind === 'brand') {
      onSearchBrand?.(item.payload.id);
    } else if (item.kind === 'team') {
      onSearchTeam?.(item.payload.name);
    } else if (item.kind === 'user') {
      onSearchUser?.(item.payload);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        flatItems.length ? (index + 1) % flatItems.length : 0,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        flatItems.length ? (index - 1 + flatItems.length) % flatItems.length : 0,
      );
      return;
    }

    if (event.key === 'Enter') {
      if (open && flatItems.length) {
        event.preventDefault();
        choose(flatItems[Math.min(activeIndex, flatItems.length - 1)]);
      }
      return;
    }

    if (event.key === 'Escape') {
      closeSearch();
      inputRef.current?.blur();
    }
  };

  return (
    <header className="topbar">
      <div
        className="search-wrap"
        ref={wrapRef}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) closeSearch();
        }}
      >
        <label className="search">
          <input
            ref={inputRef}
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            autoComplete="off"
            spellCheck="false"
            onChange={(event) => {
              setSearch(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-label="Search the workspace"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="global-search-results"
          />
          <svg aria-hidden="true" className="icon">
            <use href="#i-search" />
          </svg>
          <span className="search-kbd" aria-hidden="true">
            Ctrl K
          </span>
        </label>

        {open ? (
          <div
            className="search-results"
            id="global-search-results"
            role="listbox"
            aria-label="Search results"
            onMouseDown={(event) => event.preventDefault()}
          >
            {groups.length ? (
              groups.map((group) => (
                <div className="search-results__group" key={group.key} role="group" aria-label={group.label}>
                  <div className="search-results__title">{group.label}</div>
                  {group.items.map((item) => {
                    const index = flatItems.findIndex((entry) => entry.key === item.key);

                    return (
                      <button
                        key={item.key}
                        type="button"
                        role="option"
                        aria-selected={index === activeIndex}
                        className={`search-result${index === activeIndex ? ' is-active' : ''}`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => choose(item)}
                      >
                        <span className="search-result__icon">
                          <svg aria-hidden="true" className="icon">
                            <use href={item.icon} />
                          </svg>
                        </span>
                        <span className="search-result__text">
                          <span className="search-result__label">
                            <Highlight text={item.label} query={search} />
                          </span>
                          <span className="search-result__sub">
                            <Highlight text={item.sublabel} query={search} />
                          </span>
                        </span>
                        <span className="search-result__tag">{item.tag}</span>
                      </button>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="search-empty">
                {`No matches for “${search.trim()}”. Try a brand, team, person or page.`}
              </div>
            )}

            <div className="search-foot">
              <span>↑↓ to navigate · Enter to open · Esc to close</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="topbar__right">
        <button
          type="button"
          className="icon-btn"
          aria-label="Help"
          onClick={onOpenHelp}
          title="Help &amp; Documentation"
        >
          <svg aria-hidden="true" className="icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01" />
          </svg>
        </button>

        <button
          type="button"
          className="theme-toggle"
          aria-label="Toggle dark mode"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <svg className="icon-moon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
          </svg>
          <svg className="icon-sun" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </button>

        <a
          href="#signout"
          className="user"
          title="Click to Sign out"
          onClick={(e) => {
            e.preventDefault();
            onSignOut();
          }}
        >
          <span className="user__text">
            <strong>{displayName}</strong>
            <small>{roleDisplay}</small>
          </span>
          <span className="avatar">{initials}</span>
        </a>

        {actionLabel ? (
          <button
            type="button"
            className="button button--primary button--sm"
            onClick={onAction || onNewBrief}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-plus" />
            </svg>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </header>
  );
}
