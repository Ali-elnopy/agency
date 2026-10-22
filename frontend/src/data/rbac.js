/**
 * RBAC domain model — single source of truth for the Roles & Permissions screen
 * and for the role picker on the User & Role Access screen.
 */

export const RBAC_ROLES = [
  {
    id: 'admin',
    name: 'Studio Lead & Admin',
    badge: 'Full Control',
    tone: 'maroon',
    members: '4 Members',
    summary: 'Total governance, billing, users & API keys',
  },
  {
    id: 'director',
    name: 'Art Director',
    badge: 'Review & Approve',
    tone: 'purple',
    members: '12 Members',
    summary: 'Brand compliance & stage gate approvals',
  },
  {
    id: 'creator',
    name: 'Creator & Copywriter',
    badge: 'Edit & Draft',
    tone: 'orange',
    members: '84 Members',
    summary: 'Draft briefs, upload 3D/motion & revisions',
  },
  {
    id: 'client',
    name: 'Client Reviewer',
    badge: 'External Sign-Off',
    tone: 'amber',
    members: '48 Stakeholders',
    summary: 'Client portal view, frame notes & approval',
  },
];

/**
 * Permission value contract:
 *   'allow'                      → granted (orange check)
 *   null                         → not granted (empty slot)
 *   { label, tone }              → scoped / conditional grant (text badge)
 */
export const PERMISSION_GROUPS = [
  {
    id: 'governance',
    index: 1,
    title: 'User Management & Workspace Governance',
    subtitle: 'User and account administration',
    capabilities: [
      {
        id: 'users',
        name: 'Add, Edit & Deactivate User Accounts',
        hint: 'Invite internal team, modify profiles, or suspend/revoke seats',
        permissions: { admin: 'allow', director: null, creator: null, client: null },
      },
      {
        id: 'roles',
        name: 'Assign Functional Roles & Modify Permissions Matrix',
        hint: 'Configure RBAC rules and custom role scopes',
        permissions: {
          admin: 'allow',
          director: { label: 'View Only', tone: 'muted' },
          creator: null,
          client: null,
        },
      },
    ],
  },
  {
    id: 'creative',
    index: 2,
    title: 'Creative Pipeline, Briefs & Brand Assets',
    subtitle: 'Creative operations, assets and brand identity',
    capabilities: [
      {
        id: 'briefs',
        name: 'Create & Edit Campaign Briefs',
        hint: 'Initialize project scopes, deliverables, and timelines',
        permissions: {
          admin: 'allow',
          director: 'allow',
          creator: { label: 'Assigned Brands', tone: 'orange' },
          client: null,
        },
      },
      {
        id: 'deliverables',
        name: 'Upload 3D, Motion & Design Deliverables',
        hint: 'Push new versions to review studio & asset CDN',
        permissions: { admin: 'allow', director: 'allow', creator: 'allow', client: null },
      },
      {
        id: 'signoff',
        name: 'Internal Stage-Gate Quality Sign-Off',
        hint: 'Approve assets before publishing to external client portal',
        permissions: {
          admin: 'allow',
          director: 'allow',
          creator: { label: 'Submit for Review', tone: 'blue' },
          client: null,
        },
      },
    ],
  },
  {
    id: 'client',
    index: 3,
    title: 'Client Portal, Approvals & Financial Billing',
    subtitle: 'Client portal, approvals and billing',
    capabilities: [
      {
        id: 'annotations',
        name: 'Live Frame Annotation & Review Comments',
        hint: 'Collaborate on video frames and design canvases',
        permissions: { admin: 'allow', director: 'allow', creator: 'allow', client: 'allow' },
      },
      {
        id: 'approvals',
        name: 'Final Client Deliverable Approval & Sign-Off',
        hint: 'Authorize production release and lock approved assets',
        permissions: { admin: 'allow', director: 'allow', creator: null, client: 'allow' },
      },
      {
        id: 'billing',
        name: 'Access Financial Retainers & Master Agency Billing',
        hint: 'View client contracts, invoices, and agency burn rates',
        permissions: {
          admin: 'allow',
          director: { label: 'Restricted', tone: 'danger' },
          creator: { label: 'Restricted', tone: 'danger' },
          client: { label: 'Restricted', tone: 'danger' },
        },
      },
    ],
  },
];
