# ORVIA — Figma design reference (IEIKKVfWPRcCn6hEef584D)

Captured from the Figma viewer (frame-by-frame screenshots). Frame node IDs:

| #   | Frame name                                                       | node-id  |
| --- | ---------------------------------------------------------------- | -------- |
| 1   | ORVIA - Admin: Edit User (Two-Column Suite & Lifecycle Controls) | 110-6645 |
| 2   | ORVIA - Admin: Edit Client (Aurora Skincare)                     | 110-6133 |
| 3   | ORVIA - Admin: Add User                                          | 110-5892 |
| 4   | ORVIA - Admin: Teams List & Directory                            | 109-5377 |
| 5   | ORVIA - Admin: Team Details & Member Roster                      | 109-4864 |
| 6   | Html → Body (Admin Dashboard / Organization Overview)            | 109-3432 |
| 7   | ORVIA - Client Profile: Relationships & Brand Lifecycle          | 108-2909 |
| 8   | ORVIA - Admin: Add / Edit Client Drawer & Workload Modal         | 108-2526 |
| 9   | ORVIA - Admin: Clients Directory & Workload Studio               | 108-2037 |
| 10  | Html → Body (Settings > My Profile)                              | 107-1715 |
| 11  | ORVIA - Login (All States & Logged-out Toast)                    | 107-1554 |
| 12  | ORVIA - Forgot Password & Check Email Success                    | 107-1441 |
| 13  | ORVIA - Reset Password (Strength Meter, Success & Expired Link)  | 107-1282 |

## Design language

- Two-tone brand: warm cream surface (#FAF6F1 / #FFF9F4) + deep indigo/plum sidebar & hero (#241A3F → #2E2150).
- Accent: ORVIA orange gradient (#F2703D → #E2542A). Secondary violet (#6D5BD0 / #7C6BF0).
- Typography: Inter (UI) + Playfair Display italic (hero quotes). Uppercase letter-spaced micro-labels ("WELCOME BACK", "CLIENTS · TEAMS · …").
- Cards: white, rounded ~14-16px, 1px warm border, soft shadow.
- Chips/pills: rounded-full, tinted backgrounds (green "Active", orange "Live", violet).
- Sidebar: dark plum, active item = orange gradient pill, uppercase section label.

## Auth pages (standalone, split layout)

### Login (107-1554) — sandbox states: Default, Logged-out Toast, Validation Error, Wrong Credentials, Deactivated Warning, Authenticating, Session Expired

- Left (cream): ORVIA logo; "WELCOME BACK"; "Sign in to your workspace"; sub "Access your creative operations, briefs, pipelines, and client approvals."
- Work Email field, Password field + "Forgot password?", checkbox "Keep me signed in for 30 days" + "Only on your trusted agency workstation", orange "Log in to ORVIA →", divider "OR ENTERPRISE IDENTITY", white button "Sign in with SAML SSO / Okta", footer "SOC2 Type II & 256-bit SSL Protected" + "Privacy · Terms · Contact Support".
- Right (dark gradient hero): pills "Creative Flow Engine 4.2", "99.98% SLA Availability", "12.4k Campaigns Live"; wave graphic; quote “From brief to impact.”; sub; bottom nav CLIENTS · TEAMS · CONTENT · REVIEW · APPROVE · ANALYZE.

### Forgot Password (107-1441) — Request Form | Sent State

- Header "← Back to Login"; toggle Request Form / Sent State.
- "Forgot your password?"; sub; "Work Email Address" input (placeholder name@agency.com); orange "Send reset link →"; security notice box; footer "End-to-end 256-bit encryption", "Privacy Policy · Help Desk".

### Reset Password (107-1282) — 1 Reset Form | 2 Success | 3 Expired Link

- Chip "Secure Credential Update"; "Reset your password"; sub; "New Password" input; "Password Strength — Strong (4/4)" bar; "Password requirements" checklist (4 green checks); "Confirm New Password" + "✓ Passwords match"; orange "Update password & sign in →"; "← Return To Login"; footer "Need assistance? Contact Support" | "Studio Security Protocol 2.4".

## App shell — sidebar navigation

Two variants appear in the frames:

- "ADMIN CORE": Dashboard, Clients, Teams, Users, Roles & Permissions, Settings
- "WORKSPACE": Dashboard, Users & Clients, Teams, Content, Review, Analyze, Settings
  Sidebar footer: user card (avatar, name, role) + collapse button.

## Dashboard — "Admin Dashboard / Organization Overview" (109-3432)

- Quick Admin Actions bar: text + "＋ ADD CLIENT", "＋ Add User", "＋ Create Team".
- 3 stat cards: ACTIVE CLIENTS 12 (+4 new brands / 3 archived); TOTAL EMPLOYEES 24 (Active 5, Mgr 4, Creators 16); ACTIVE TEAMS 5 (Avg/team size 4.8).
- "Clients per Account Manager" (bar list) + "Attention Required (3 Issues)".
- "WORKLOAD ALLOCATION MATRIX" table (Account Manager | Assigned Team | Active Clients | Capacity State) with capacity chips.
- Attention Required: Clients without AM (Lumina Health, Solaris Energy → Assign Manager), Clients without a Team (Apex Dynamics → Assign Team), note, "SYSTEM INTEGRITY Healthy" note.

## Clients Directory & Workload Studio (108-2037)

- Tabs "All Clients (18)" / "By Account Manager (Workload)"; search; "Export CSV"; "Filter Persona"; "+ Add Client".
- Info banner "CORE RULE One Client = One Brand".
- Filters: All Managers, All Teams, Status, Include archived, Clear filters.
- Table: BRAND/CLIENT | ACCOUNT MANAGER | RESPONSIBLE TEAM | STATUS | CREATED | ACTIONS.
- Rows: Lumina Health, Kinetic Motors, Aurora Skincare, Vertex AI, Nova Robotics, Bloom Care Group.
- Footer: "Showing 1-8 of 20" + pagination; stat bar: TOTAL CLIENTS 18 · ACCOUNT MANAGERS 5 · OPERATIONAL SQUADS 6 · EMPLOYEES 24 · PORTFOLIO AUM 4.8/5★ · AVG RETENTION 3.8 yrs.

## Client Profile — Lumina Health (108-2909)

- Tabs: Overview, Requirements Intake, All Briefs & Classifications, Strategy (Soon), Content Plans (Soon).
- Header with HealthTech meta + "Edit Client" / "Archive Client".
- Stat bar: Active Monthly Retainer $24,500/mo; Active Deliverables 7 In Pipeline; Health Score 98% High Sentiment; Next Studio Milestone Brief Sign-Off (Today).
- Brand Information (description, industry, founded/scale, digital footprint), Primary Client Contact (Dr. Aris Thorne), Account Manager (Marcus Vance), Responsible Team (Brand Strategy & Growth Squad).

## Edit Client — Aurora Skincare (110-6133)

- States: Live Active View, Archived (Read-Only), Validation Errors, Sync Error Banner, 404 View, 403 Denied.
- Header: logo, name, Active Pipeline chip, Created/meta, Tenant ID; "Client Portal", "Archive".
- Brand Information (logo change, Brand Name, Primary Industry & Market, Website URL, Brand Core Positioning, "Unified Creative Ecosystem" note).
- Key Client Contact (name, title, email + Portal Active, phone).
- Right: Client Overview (3 Active Briefs / 14 Assets Live / 98% On-Time; Account Manager, Dedicated Team, Client Since, Last Interaction, Portal Access; Q4 Creative Velocity 86/100; Activity Log).

## Add / Edit Client Drawer & Workload Modal (108-2526)

- Drawer "Add Client" Step 1 of 3: Brand Identity (logo upload, Brand Name, Activity/Industry, Website, Short Description), Key Contact Person (name, phone, email + Valid corporate domain), footer Cancel / "Save & Onboard Client →".
- State toolbar: SUITE STATE, ADD MODE, EDIT MODE, VALIDATION ERRORS, …

## Teams List & Directory (109-5377)

- States: Default Grid, Modal Open, Skeleton, Empty State, No Results, API Error, Success Toast, No Permission.
- Header "Teams — 6 Teams Active"; badges Total Talent 42, Active Brands 27; "+ Create Team".
- Filters: search, All Squads / Creative / Strategy / Performance, sort.
- 6 team cards: Brand Strategy & Growth, Creative & Motion Studio, Performance Content Squad, Editorial & Brand Voice, Social Operations & Community, Digital Product Design. Each: status chips, title, blurb, avatar stack + lead, CLIENT ECOSYSTEM tags, capacity chip, "View Team →".

## Team Details & Member Roster (109-4864)

- States: Overview, Add Employees, Move Member, Remove Member, Edit Team, Test Toast.
- Header: team + Active, Edit / Delete Team; meta.
- Stat cards: Total Team Members 8 Employees; Assigned Client Brands 5 Active Brands; Ongoing Creative Briefs 14 Briefs Active.
- Team Members table: EMPLOYEE | ROLE & DISCIPLINE | JOINED SQUAD | ASSIGNED BRIEFS | ACTIONS.

## Add User (110-5892)

- Breadcrumb Users > Add User; header + "• Live Workspace Sync".
- Step 01 Personal Details (photo, Full Name, Phone, Work Email).
- Step 02 Access & Team Assignment (Workspace Role, Functional Team Pod, role info box, "Send onboarding invitation email immediately" toggle).

## Edit User (110-6645)

- Header: avatar, Active Account, Account Manager, Created / Last active / ID.
- Personal Details (photo change, Full Name, Work Email Verified, Phone, Job Title) with unsaved-changes bar (Cancel / Save changes).
- Team Assignment (pod card + Change Assigned Team select).
- Role & Permissions (role card + Change role).
- Right: Member Summary (Access Role, Team Pod, Status, Joined, Last Login), Active Portfolios, links, Weekly Brief Throughput sparkline.

## Settings > My Profile (107-1715) — preview states: Default View, Validation Errors, Wrong Current Password, Unsaved Changes, Loading/Saving, Success Toasts, Upload Error

- Breadcrumb "Settings › My Profile"; header + sub.
- "My details" (Active Account chip): upload photo, Full Name, Country + Phone, Work Email (managed), Role Assignment + Assigned Squad, Cancel / Save changes.
- "Security": Current Password, New Password, Security strength bar, Confirm New Password, "Passwords match correctly", "Update password", "Log out"; Active Sessions → "Log out of all devices".
