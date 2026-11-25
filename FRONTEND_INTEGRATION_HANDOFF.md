# ORVIA Agency OS — Frontend Integration Handoff

> **Scope:** Complete backend contract for **Content Items → Tasks → Submission → Internal Review → Client Review → Account Manager Mediation → Content Modification Loop**, plus Notifications and Authentication.
> **Source of Truth:** Audited directly against the live backend codebase in `/backend/src` and `/backend/prisma/schema.prisma`.

---

## 1. Backend Status

- **Status:** **READY** for frontend integration.
- **Database Migrations:** 19/19 Prisma migrations applied (`Database schema is up to date`).
- **Automated Tests:** 16/16 unit/integration test files passed (**134/134 tests**) + 1/1 live Supabase integration test passed (**135/135 total**).
- **ESLint:** **0 errors** (1 pre-existing unused-variable warning in `platform-accounts.service.js`).

---

## 2. Authentication Requirements

- **Scheme:** Bearer JWT in `Authorization` header:
  ```http
  Authorization: Bearer <accessToken>
  ```
- **Login:** `POST /api/v1/auth/login` with `{ "email": "...", "password": "..." }` → returns `{ user, accessToken, refreshToken }`.
- **Token Refresh:** `POST /api/v1/auth/refresh` with `{ "refreshToken": "<64-hex>" }` → returns rotated `{ accessToken, refreshToken }`.
- **Current User:** `GET /api/v1/auth/me` → returns `{ user }` including `user.role = { id, name }` and `user.jobTitle = { id, name } | null`.
- **Session Validation:** Access tokens carry `{ sub: "<userId>", sid: "<sessionUuid>" }`. Every authenticated request verifies the JWT signature, active `AuthSession` (not revoked, not expired), and `user.isActive === true`.
- **On `401`:** Attempt token refresh once; if refresh fails, clear stored tokens and redirect to login.

---

## 3. Roles

Canonical seeded roles (`roles.name`):

| Role | Summary |
|---|---|
| `ADMIN` | Full access across all brands, tasks, internal reviews, and client change requests. |
| `ACCOUNT_MANAGER` | Scoped to brands where `brand.accountManagerId === user.id`. Assigns tasks, performs Internal Review, mediates Client Change Requests (resolve/forward). |
| `CONTENT_CREATOR` | Team-scoped brand access (`brand.team.memberships` includes `user.id`). Creates/edits Content Plans, Campaigns, Content Items; submits assigned `CONTENT_CREATION` / `CONTENT_MODIFICATION` tasks. |
| `CREATIVE` | Team-scoped brand read; views/starts/submits own assigned `CONTENT_CREATION` / `CONTENT_MODIFICATION` tasks. |
| `CLIENT` | Own brand only (`brand.clientId === user.id`). Views own Content Plans, Campaigns, Content Items, and own Client Change Requests; submits Client Review (`APPROVE` / `REQUEST_CHANGES`). Blocked (`403`) from all Task endpoints. |

> **Backward Compatibility Note:** Legacy `CREATOR` and `EMPLOYEE` (with `jobTitle.name === 'Content Creator'`) are still supported alongside canonical `CONTENT_CREATOR`.

---

## 4. API Base Paths

Every workflow router is mounted on **both** `/api/*` and `/api/v1/*`. **Prefer `/api/v1/*` in frontend code:**

- `/api/v1/auth`
- `/api/v1/content-items`
- `/api/v1/tasks`
- `/api/v1/client-change-requests`
- `/api/v1/notifications`
- *(Also available: `/api/v1/brands`, `/api/v1/platform-accounts`, `/api/v1/content-plans`, `/api/v1/campaigns`, `/api/v1/files`)*

All responses use the standard envelope:
```json
{ "success": true, "message": "optional", "data": { ... } }
{ "success": false, "message": "Error message", "errors": [{ "field": "...", "message": "..." }] }
```

---

## 5. Complete Endpoint Table

All endpoints below require `Authorization: Bearer <accessToken>`.

| Method | Path | Allowed Roles | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/content-items` | All authenticated (`CLIENT` scoped to own brand) | List content items (filters: `contentPlanId`, `campaignId`, `type`) |
| `GET` | `/api/v1/content-items/:id` | All authenticated (`CLIENT` scoped to own brand) | Get content item details (includes `clientReviewStatus`, `clientApprovedAt`) |
| `POST` | `/api/v1/content-items` | `CONTENT_CREATOR` (team member of brand) | Create content item |
| `PATCH` | `/api/v1/content-items/:id` | `CONTENT_CREATOR` (team member of brand) | Update content item |
| `DELETE` | `/api/v1/content-items/:id` | `CONTENT_CREATOR` (team member of brand) | Delete content item |
| `POST` | `/api/v1/content-items/:id/client-review` | `CLIENT` (own brand only) | Submit Client Review (`APPROVE` or `REQUEST_CHANGES`) |
| `GET` | `/api/v1/tasks` | `ADMIN`, `ACCOUNT_MANAGER`, `CONTENT_CREATOR`, `CREATIVE` (`CLIENT` → `403`) | List tasks (role-scoped; query filters validated by `taskListQuerySchema`) |
| `GET` | `/api/v1/tasks/:id` | `ADMIN`, assigned-brand `ACCOUNT_MANAGER`, task assignee, task creator (`CLIENT` → `403`) | Get single task with `contentItem`, `assignee`, `creator`, `dependsOn` |
| `POST` | `/api/v1/tasks/direct` | `ADMIN`, `ACCOUNT_MANAGER` | Create standalone `DIRECT` task |
| `POST` | `/api/v1/tasks/content-items/:contentItemId/assign` | `ADMIN`, assigned-brand `ACCOUNT_MANAGER` | Create `CONTENT_CREATION` + dependent `REVIEW` task pair using `TaskDeadlineRule` |
| `PATCH` | `/api/v1/tasks/:id` | `ADMIN`, assigned-brand `ACCOUNT_MANAGER`, assignee, creator (`CREATIVE` → `403`, `CLIENT` → `403`) | Update task fields (reassignment & deadlines restricted to `ADMIN`/`ACCOUNT_MANAGER`) |
| `PATCH` | `/api/v1/tasks/:id/status` | `ADMIN`, assigned-brand `ACCOUNT_MANAGER`, task assignee (`CLIENT` → `403`) | Update task status (`IN_PROGRESS`, etc.; cannot bypass `/submit` or `/review`) |
| `POST` | `/api/v1/tasks/:id/submit` | Assigned `CREATIVE` or `CONTENT_CREATOR` | Submit or resubmit `CONTENT_CREATION` / `CONTENT_MODIFICATION` deliverable URL & notes |
| `PATCH` | `/api/v1/tasks/:id/review` | `ADMIN`, assigned-brand `ACCOUNT_MANAGER` | Internal Review (`COMPLETED` or `NEEDS_CHANGES` + optional `notes`); accepts either creation/modification task ID or review task ID |
| `DELETE` | `/api/v1/tasks/:id` | `ADMIN`, assigned-brand `ACCOUNT_MANAGER` | Delete task |
| `GET` | `/api/v1/client-change-requests` | `ADMIN`, `ACCOUNT_MANAGER` (assigned brands), `CLIENT` (own) (`CREATIVE`/`CONTENT_CREATOR` → `403`) | List client change requests (filters: `status`, `contentItemId`, `brandId`) |
| `GET` | `/api/v1/client-change-requests/:id` | `ADMIN`, assigned-brand `ACCOUNT_MANAGER`, owning `CLIENT` | Get single client change request |
| `PATCH` | `/api/v1/client-change-requests/:id/resolve` | `ADMIN`, assigned-brand `ACCOUNT_MANAGER` | Resolve/close `PENDING` request without creating Creative task |
| `PATCH` | `/api/v1/client-change-requests/:id/forward` | `ADMIN`, assigned-brand `ACCOUNT_MANAGER` | Accept & forward `PENDING` request → creates `CONTENT_MODIFICATION` + `REVIEW` tasks |
| `GET` | `/api/v1/notifications` | All authenticated (own only) | List user notifications |
| `GET` | `/api/v1/notifications/unread-count` | All authenticated (own only) | Get `{ unreadCount }` |
| `PATCH` | `/api/v1/notifications/:id/read` | All authenticated (own only) | Mark one notification read |
| `PATCH` | `/api/v1/notifications/read-all` | All authenticated (own only) | Mark all notifications read |

---

## 6 & 7. Request Bodies & Response Examples

### A. Create Direct Task
`POST /api/v1/tasks/direct`
```json
{
  "title": "Prepare monthly analytics deck",
  "description": "Include Instagram and TikTok metrics",
  "assignedTo": 7,
  "priority": "HIGH",
  "plannedDeadline": "2026-12-15T16:00:00.000Z"
}
```
Response (`201`):
```json
{
  "success": true,
  "message": "Direct task created successfully",
  "data": {
    "id": 99,
    "contentItemId": null,
    "type": "DIRECT",
    "title": "Prepare monthly analytics deck",
    "description": "Include Instagram and TikTok metrics",
    "assignedTo": 7,
    "createdBy": 4,
    "status": "TODO",
    "priority": "HIGH",
    "plannedDeadline": "2026-12-15T16:00:00.000Z",
    "effectiveDeadline": "2026-12-15T16:00:00.000Z",
    "startedAt": null,
    "completedAt": null,
    "submissionUrl": null,
    "submissionNotes": null,
    "submittedAt": null,
    "dependsOnTaskId": null,
    "contentItem": null,
    "assignee": { "id": 7, "fullName": "Creative User", "email": "creative@agency.co", "role": { "id": 5, "name": "CREATIVE" } },
    "creator": { "id": 4, "fullName": "Account Manager", "email": "am@agency.co", "role": { "id": 3, "name": "ACCOUNT_MANAGER" } },
    "dependsOn": null
  }
}
```

### B. Assign Content Workflow Tasks
`POST /api/v1/tasks/content-items/:contentItemId/assign`
```json
{
  "creationAssigneeId": 7,
  "reviewerId": 4
}
```
*(Both fields are optional: `creationAssigneeId` defaults to `contentItem.createdBy`; `reviewerId` defaults to `brand.accountManagerId`.)*
Response (`201`):
```json
{
  "success": true,
  "message": "Content workflow tasks assigned successfully",
  "data": {
    "creationTask": { "id": 50, "contentItemId": 10, "type": "CONTENT_CREATION", "title": "Create: Launch Reel", "status": "TODO", "priority": "MEDIUM", "assignedTo": 7, "dependsOnTaskId": null },
    "reviewTask": { "id": 51, "contentItemId": 10, "type": "REVIEW", "title": "Review: Launch Reel", "status": "TODO", "priority": "HIGH", "assignedTo": 4, "dependsOnTaskId": 50 }
  }
}
```

### C. Update Task Status (e.g., Creative Starts Work)
`PATCH /api/v1/tasks/:id/status`
```json
{
  "status": "IN_PROGRESS"
}
```
Response (`200`):
```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": { "id": 50, "status": "IN_PROGRESS", "startedAt": "2026-12-07T09:00:00.000Z" }
}
```

### D. Submit / Resubmit Content Task
`POST /api/v1/tasks/:id/submit`
```json
{
  "submissionUrl": "https://drive.google.com/file/d/reel-v1",
  "submissionNotes": "Final cut ready with captions."
}
```
*(Required: `submissionUrl` valid URL ≤ 2000 chars. Optional: `submissionNotes` ≤ 5000 chars; omitting it on resubmission preserves previous `submissionNotes`.)*
Response (`200`):
```json
{
  "success": true,
  "message": "Content submitted for review successfully",
  "data": {
    "id": 50,
    "contentItemId": 10,
    "type": "CONTENT_CREATION",
    "status": "SUBMITTED",
    "submissionUrl": "https://drive.google.com/file/d/reel-v1",
    "submissionNotes": "Final cut ready with captions.",
    "submittedAt": "2026-12-07T15:00:00.000Z",
    "contentItem": { "id": 10, "title": "Launch Reel", "type": "REEL", "reference": "https://ref.example.com", "toneOfVoice": "Bold", "caption": "Launch caption", "notes": "Keep under 30s" }
  }
}
```

### E. Internal Review (Approve or Request Changes)
`PATCH /api/v1/tasks/:id/review`
*(Accepts either the `CONTENT_CREATION`/`CONTENT_MODIFICATION` task ID or its linked `REVIEW` task ID.)*
```json
{
  "decision": "COMPLETED",
  "notes": "Approved internally."
}
```
or:
```json
{
  "decision": "NEEDS_CHANGES",
  "notes": "Please brighten the intro text."
}
```
Response (`200`):
```json
{
  "success": true,
  "message": "Task approved and completed successfully",
  "data": {
    "creationTask": { "id": 50, "type": "CONTENT_CREATION", "status": "COMPLETED", "completedAt": "2026-12-07T16:00:00.000Z", "submissionUrl": "https://drive.google.com/file/d/reel-v1", "submissionNotes": "Final cut ready with captions.", "submittedAt": "2026-12-07T15:00:00.000Z" },
    "reviewTask": { "id": 51, "type": "REVIEW", "status": "COMPLETED", "description": "Approved internally.", "completedAt": "2026-12-07T16:00:00.000Z" },
    "contentItem": { "id": 10, "title": "Launch Reel", "clientReviewStatus": "PENDING_CLIENT_REVIEW", "clientApprovedAt": null }
  }
}
```

### F. Client Review — Approve
`POST /api/v1/content-items/:id/client-review`
```json
{
  "decision": "APPROVE"
}
```
Response (`200`):
```json
{
  "success": true,
  "message": "Content approved by client successfully",
  "data": {
    "contentItem": {
      "id": 10,
      "title": "Launch Reel",
      "contentPlanId": 1,
      "clientReviewStatus": "APPROVED",
      "clientApprovedAt": "2026-12-08T10:00:00.000Z"
    }
  }
}
```

### G. Client Review — Request Changes
`POST /api/v1/content-items/:id/client-review`
```json
{
  "decision": "REQUEST_CHANGES",
  "notes": "Please update the opening frame and shorten the caption."
}
```
*(Required: `notes` must be a non-empty string ≤ 5000 chars when `decision === "REQUEST_CHANGES"`.)*
Response (`201`):
```json
{
  "success": true,
  "message": "Client change request submitted successfully",
  "data": {
    "contentItem": {
      "id": 10,
      "title": "Launch Reel",
      "contentPlanId": 1,
      "clientReviewStatus": "CHANGES_REQUESTED",
      "clientApprovedAt": null
    },
    "changeRequest": {
      "id": 1,
      "contentItemId": 10,
      "brandId": 201,
      "clientId": 101,
      "accountManagerId": 4,
      "status": "PENDING",
      "clientNotes": "Please update the opening frame and shorten the caption.",
      "accountManagerNotes": null,
      "relatedTaskId": null,
      "resolvedAt": null,
      "forwardedAt": null
    }
  }
}
```

### H. List Client Change Requests
`GET /api/v1/client-change-requests?status=PENDING&contentItemId=10&brandId=201`
Response (`200`):
```json
{
  "success": true,
  "data": {
    "requests": [ { "id": 1, "status": "PENDING", "clientNotes": "...", "contentItem": { ... }, "brand": { ... }, "client": { ... }, "accountManager": { ... }, "relatedTask": null } ],
    "total": 1
  }
}
```

### I. Account Manager — Resolve Change Request (No Creative Task)
`PATCH /api/v1/client-change-requests/:id/resolve`
```json
{
  "notes": "Discussed with client — keeping current cut."
}
```
Response (`200`):
```json
{
  "success": true,
  "message": "Client change request resolved successfully",
  "data": {
    "changeRequest": { "id": 1, "status": "RESOLVED", "accountManagerNotes": "Discussed with client — keeping current cut.", "resolvedAt": "2026-12-08T11:00:00.000Z", "relatedTaskId": null },
    "contentItem": { "id": 10, "title": "Launch Reel", "contentPlanId": 1, "clientReviewStatus": "PENDING_CLIENT_REVIEW", "clientApprovedAt": null }
  }
}
```

### J. Account Manager — Forward Change Request to Creative
`PATCH /api/v1/client-change-requests/:id/forward`
```json
{
  "notes": "Keep background music, swap first 2 seconds only.",
  "assignedTo": 7,
  "priority": "HIGH",
  "plannedDeadline": "2026-12-12T12:00:00.000Z"
}
```
*(All body fields are optional. `assignedTo` defaults to the assignee of the latest `CONTENT_CREATION`/`CONTENT_MODIFICATION` task or `contentItem.createdBy`; `priority` defaults to `HIGH`; `plannedDeadline` defaults to `TaskDeadlineRule` or `contentItem.scheduledDate`.)*
Response (`200`):
```json
{
  "success": true,
  "message": "Client change request forwarded to creative successfully",
  "data": {
    "changeRequest": { "id": 1, "status": "ACCEPTED", "accountManagerNotes": "Keep background music, swap first 2 seconds only.", "forwardedAt": "2026-12-08T11:15:00.000Z", "relatedTaskId": 100 },
    "modificationTask": { "id": 100, "contentItemId": 10, "type": "CONTENT_MODIFICATION", "title": "Modify: Launch Reel", "description": "Client Change Request:\n...\n\nAccount Manager Instructions:\n...", "assignedTo": 7, "status": "TODO", "priority": "HIGH", "dependsOnTaskId": 51 },
    "reviewTask": { "id": 101, "contentItemId": 10, "type": "REVIEW", "title": "Review: Launch Reel", "assignedTo": 4, "status": "TODO", "priority": "HIGH", "dependsOnTaskId": 100 },
    "contentItem": { "id": 10, "title": "Launch Reel", "contentPlanId": 1, "clientReviewStatus": "IN_MODIFICATION", "clientApprovedAt": null }
  }
}
```

---

## 8. Field Dictionary

### `Task`
| Field | Type | Nullable | Enum / Format | Meaning & Lifecycle |
|---|---|---|---|---|
| `id` | `number` | No | Auto-inc int | Task ID |
| `contentItemId` | `number` | Yes | FK → `ContentItem` | `null` for `DIRECT` tasks; set for workflow tasks |
| `type` | `string` | No | `TaskType` | `DIRECT`, `CONTENT_CREATION`, `CONTENT_MODIFICATION`, `REVIEW`, `PUBLISH` |
| `title` | `string` | No | max 200 | Task title (`Create: ...`, `Modify: ...`, `Review: ...`) |
| `description` | `string` | Yes | Text | Instructions; on `REVIEW` tasks stores latest Internal Review `notes`; on `CONTENT_MODIFICATION` stores combined Client + AM notes |
| `assignedTo` | `number` | No | FK → `User` | Assigned user ID (never a `CLIENT`) |
| `createdBy` | `number` | No | FK → `User` | Creator user ID |
| `status` | `string` | No | `TaskStatus` | Default `TODO` |
| `priority` | `string` | No | `TaskPriority` | Default `MEDIUM` (`HIGH` on `REVIEW` and forwarded `CONTENT_MODIFICATION`) |
| `plannedDeadline` | `string` | No | ISO-8601 | Initial planned deadline |
| `effectiveDeadline` | `string` | Yes | ISO-8601 | Active deadline; recalculated on `REVIEW` task when Creative submits (`submittedAt + Math.abs(reviewRule.offsetMinutes)`) |
| `startedAt` | `string` | Yes | ISO-8601 | Set on first transition to `IN_PROGRESS` |
| `completedAt` | `string` | Yes | ISO-8601 | Set when `COMPLETED`; cleared if moved back to `NEEDS_CHANGES`/`IN_REVIEW` |
| `submissionUrl` | `string` | Yes | URL ≤ 2000 | Deliverable URL submitted by Creative/Creator via `POST /tasks/:id/submit` |
| `submissionNotes` | `string` | Yes | Text ≤ 5000 | Optional submission notes (preserved if omitted on resubmission) |
| `submittedAt` | `string` | Yes | ISO-8601 | Timestamp of latest submission |
| `dependsOnTaskId` | `number` | Yes | FK → `Task` | `REVIEW` depends on `CONTENT_CREATION`/`CONTENT_MODIFICATION`; `CONTENT_MODIFICATION` depends on previous workflow task |
| `createdAt`, `updatedAt` | `string` | No | ISO-8601 | Timestamps |
| `contentItem`, `assignee`, `creator`, `dependsOn` | `object` | Yes | Nested | Included on `TasksModel` responses (`GET /tasks`, `GET /tasks/:id`, `PATCH /tasks/:id`, `PATCH /tasks/:id/status`) |

### `ContentItem`
| Field | Type | Nullable | Enum / Format | Meaning & Lifecycle |
|---|---|---|---|---|
| `id` | `number` | No | Auto-inc int | Content Item ID |
| `contentPlanId` | `number` | No | FK → `ContentPlan` | Parent monthly content plan (`platformAccountId` lives on `contentItem.contentPlan.platformAccountId`) |
| `campaignId` | `number` | Yes | FK → `Campaign` | Optional campaign |
| `createdBy` | `number` | No | FK → `User` | Content Creator ID |
| `scheduledDate` | `string` | No | ISO-8601 | Scheduled publish date |
| `type` | `string` | No | max 50 | Content type (e.g., `POST`, `REEL`, `STORY` — matched against `TaskDeadlineRule.contentType`) |
| `title` | `string` | No | max 200 | Content title |
| `reference` | `string` | Yes | Text ≤ 5000 | Creative inspiration / reference link |
| `toneOfVoice` | `string` | Yes | Text ≤ 5000 | Brand voice instructions |
| `caption` | `string` | Yes | Text ≤ 10000 | Post caption copy |
| `notes` | `string` | Yes | Text ≤ 5000 | Creator brief notes |
| `clientReviewStatus` | `string` | No | `ClientReviewStatus` | Default `NOT_READY`; drives Client Review UI |
| `clientApprovedAt` | `string` | Yes | ISO-8601 | Set when Client submits `APPROVE` |
| `createdAt`, `updatedAt` | `string` | No | ISO-8601 | Timestamps |

### `ClientChangeRequest`
| Field | Type | Nullable | Enum / Format | Meaning & Lifecycle |
|---|---|---|---|---|
| `id` | `number` | No | Auto-inc int | Change Request ID |
| `contentItemId` | `number` | No | FK → `ContentItem` | Target content item |
| `brandId` | `number` | No | FK → `Brand` | Brand ID |
| `clientId` | `number` | No | FK → `User` | Requesting Client ID |
| `accountManagerId` | `number` | No | FK → `User` | Responsible Account Manager ID |
| `status` | `string` | No | `ClientChangeRequestStatus` | `PENDING` → `RESOLVED` or `ACCEPTED` |
| `clientNotes` | `string` | No | Text ≤ 5000 | Original client change request notes |
| `accountManagerNotes` | `string` | Yes | Text ≤ 5000 | AM resolution note (`resolve`) or internal instructions (`forward`) |
| `relatedTaskId` | `number` | Yes | Unique FK → `Task` | Populated with created `CONTENT_MODIFICATION` task ID when forwarded (`ACCEPTED`) |
| `resolvedAt` | `string` | Yes | ISO-8601 | Set when `RESOLVED` |
| `forwardedAt` | `string` | Yes | ISO-8601 | Set when `ACCEPTED` (forwarded) |
| `createdAt`, `updatedAt` | `string` | No | ISO-8601 | Timestamps |

---

## 9. Enums (Exact Backend Values)

- **`TaskType`**: `DIRECT`, `CONTENT_CREATION`, `CONTENT_MODIFICATION`, `REVIEW`, `PUBLISH`
- **`TaskStatus`**: `TODO`, `IN_PROGRESS`, `SUBMITTED`, `IN_REVIEW`, `NEEDS_CHANGES`, `COMPLETED`, `CANCELLED`
- **`TaskPriority`**: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- **`InternalReviewDecision`**: `COMPLETED`, `NEEDS_CHANGES`
- **`ClientReviewDecision`**: `APPROVE`, `REQUEST_CHANGES`
- **`ClientReviewStatus`**: `NOT_READY`, `PENDING_CLIENT_REVIEW`, `CHANGES_REQUESTED`, `IN_MODIFICATION`, `APPROVED`
- **`ClientChangeRequestStatus`**: `PENDING`, `ACCEPTED`, `RESOLVED`

---

## 10–16 & 22. Complete End-to-End Workflow Diagram

```text
1. ContentItem created (clientReviewStatus = NOT_READY)
       ↓
2. AM/Admin assigns tasks: POST /api/v1/tasks/content-items/:id/assign
   → CONTENT_CREATION (TODO) + REVIEW (TODO, dependsOn = creationTask)
       ↓
3. Creative starts work: PATCH /api/v1/tasks/:creationId/status { status: "IN_PROGRESS" }
       ↓
4. Creative submits: POST /api/v1/tasks/:creationId/submit { submissionUrl, submissionNotes? }
   → CONTENT_CREATION = SUBMITTED
   → REVIEW = IN_REVIEW (effectiveDeadline recalculated)
   → Notifies AM (TASK_SUBMITTED)
       ↓
5. AM/Admin Internal Review: PATCH /api/v1/tasks/:id/review { decision, notes? }
       ├── NEEDS_CHANGES → Both tasks = NEEDS_CHANGES, notifies Creative (TASK_NEEDS_CHANGES)
       │                   → Creative modifies & resubmits (back to step 4)
       └── COMPLETED     → Both tasks = COMPLETED, ContentItem = PENDING_CLIENT_REVIEW
                           → Notifies Creative (TASK_REVIEW_APPROVED) & Client (CONTENT_READY_FOR_CLIENT_REVIEW)
       ↓
6. Client Review: POST /api/v1/content-items/:id/client-review
       ├── APPROVE         → ContentItem = APPROVED (clientApprovedAt set), notifies AM (CONTENT_CLIENT_APPROVED)
       │                     → Ready for future Publish stage
       └── REQUEST_CHANGES → ContentItem = CHANGES_REQUESTED
                           → Creates ClientChangeRequest (PENDING), notifies AM (CLIENT_CHANGE_REQUEST_CREATED)
                           → NO Creative task created; CONTENT_CREATION stays untouched
       ↓
7. Account Manager Mediation:
       ├── Resolve: PATCH /api/v1/client-change-requests/:id/resolve { notes? }
       │   → ChangeRequest = RESOLVED, ContentItem = PENDING_CLIENT_REVIEW
       │   → Notifies Client (CLIENT_CHANGE_REQUEST_RESOLVED), NO Creative task created
       │   → Client can now APPROVE or submit a new REQUEST_CHANGES (back to step 6)
       │
       └── Forward: PATCH /api/v1/client-change-requests/:id/forward { notes?, assignedTo?, priority?, plannedDeadline? }
           → ChangeRequest = ACCEPTED (relatedTaskId = modTask.id)
           → ContentItem = IN_MODIFICATION
           → Creates CONTENT_MODIFICATION (TODO) + new REVIEW (TODO, dependsOn = modTask.id)
           → Notifies Creative (TASK_MODIFICATION_ASSIGNED)
           → Creative submits (step 4) → Internal Review (step 5) → Client Review (step 6) [repeatable N times]
```

---

## 17. Authorization Matrix

| Action / Endpoint | `ADMIN` | `ACCOUNT_MANAGER` | `CONTENT_CREATOR` | `CREATIVE` | `CLIENT` |
|---|---|---|---|---|---|
| `GET /content-items`, `GET /content-items/:id` | All | All | All | All | Own Brand only |
| `POST/PATCH/DELETE /content-items` | `403` | `403` | Brand's Team only | `403` | `403` |
| `POST /content-items/:id/client-review` | `403` | `403` | `403` | `403` | Own Brand only (`PENDING_CLIENT_REVIEW`) |
| `GET /tasks` | All | Own + Assigned Brands | Own assigned only | Own assigned only | `403` |
| `GET /tasks/:id` | All | Assigned Brands / Own | Assigned / Created | Assigned / Created | `403` |
| `POST /tasks/direct` | Allowed | Allowed | `403` | `403` | `403` |
| `POST /tasks/content-items/:id/assign` | All Brands | Assigned Brands only | `403` | `403` | `403` |
| `PATCH /tasks/:id` | All | Assigned Brands / Own | Own (no reassign/deadlines) | `403` (use `/status` or `/submit`) | `403` |
| `PATCH /tasks/:id/status` | All* | Assigned Brands* | Own* | Own* | `403` |
| `POST /tasks/:id/submit` | `403` | `403` | Assigned `CONTENT_CREATION`/`CONTENT_MODIFICATION` | Assigned `CONTENT_CREATION`/`CONTENT_MODIFICATION` | `403` |
| `PATCH /tasks/:id/review` | All Brands | Assigned Brands only | `403` | `403` | `403` |
| `DELETE /tasks/:id` | All Brands | Assigned Brands only | `403` | `403` | `403` |
| `GET /client-change-requests` & `/:id` | All | Assigned Brands only | `403` | `403` | Own requests only |
| `PATCH /client-change-requests/:id/resolve` | All | Assigned Brands only | `403` | `403` | `403` |
| `PATCH /client-change-requests/:id/forward` | All | Assigned Brands only | `403` | `403` | `403` |

*\*`PATCH /tasks/:id/status` blocks `CREATIVE`/`CONTENT_CREATOR` from manually setting `SUBMITTED` (`400`) or `COMPLETED`/`NEEDS_CHANGES` (`403`) on content workflow tasks, and blocks anyone from setting `REVIEW` tasks to `COMPLETED`/`NEEDS_CHANGES` (`400`, must use `/review`).*

---

## 18. Notification Types

All notifications are returned by `GET /api/v1/notifications` with `{ id, type, title, message, data, isRead, readAt, createdAt }`.

| `type` | Trigger | Receiver | `data` Payload | Suggested Frontend Navigation |
|---|---|---|---|---|
| `TASK_SUBMITTED` | Creative submits/resubmits creation or modification task | Reviewer (AM) | `{ taskId, reviewTaskId, contentItemId, submissionUrl }` | Open Internal Review view for `taskId` / `reviewTaskId` |
| `TASK_REVIEW_APPROVED` | AM approves Internal Review (`COMPLETED`) | Assigned Creative/Creator | `{ taskId, reviewTaskId, contentItemId, decision, notes }` | Open Task details (`taskId`) |
| `TASK_NEEDS_CHANGES` | AM requests changes in Internal Review (`NEEDS_CHANGES`) | Assigned Creative/Creator | `{ taskId, reviewTaskId, contentItemId, decision, notes }` | Open Task resubmit view (`taskId`) |
| `CONTENT_READY_FOR_CLIENT_REVIEW` | Internal Review approves (`COMPLETED`) | Brand `CLIENT` | `{ contentItemId, taskId, reviewTaskId }` | Open Client Review view for `contentItemId` |
| `CONTENT_CLIENT_APPROVED` | Client submits `APPROVE` | Brand `ACCOUNT_MANAGER` | `{ contentItemId, brandId, clientId }` | Open Content Item details (`contentItemId`) |
| `CLIENT_CHANGE_REQUEST_CREATED` | Client submits `REQUEST_CHANGES` | Brand `ACCOUNT_MANAGER` | `{ changeRequestId, contentItemId, brandId, clientId, clientNotes }` | Open Client Change Request (`changeRequestId`) |
| `CLIENT_CHANGE_REQUEST_RESOLVED` | AM resolves request without modification | `CLIENT` | `{ changeRequestId, contentItemId, brandId, notes }` | Open Content Item Client Review (`contentItemId`) |
| `TASK_MODIFICATION_ASSIGNED` | AM forwards change request to Creative | Assigned Creative/Creator | `{ changeRequestId, taskId, reviewTaskId, contentItemId, clientNotes, accountManagerNotes }` | Open Modification Task (`taskId`) |

---

## 19. Error Handling

| HTTP Status | Meaning | Example Response |
|---|---|---|
| `400` | Zod validation error, invalid ID, invalid workflow transition (e.g., reviewing non-`SUBMITTED` task, client reviewing `NOT_READY`/`IN_MODIFICATION` item, forwarding already `RESOLVED` request, using `/status` to complete a `REVIEW` task) | `{ "success": false, "message": "Validation failed", "errors": [{ "field": "notes", "message": "Notes are required when requesting changes" }] }` |
| `401` | Missing/expired/invalid JWT or revoked session | `{ "success": false, "message": "Authentication required" }` |
| `403` | Role forbidden or cross-brand/unassigned access | `{ "success": false, "message": "You can only review tasks for your assigned brands" }` |
| `404` | Resource does not exist (or hidden by client scoping) | `{ "success": false, "message": "Content item not found" }` |
| `409` | Conflict (e.g., workflow tasks already assigned for a content item) | `{ "success": false, "message": "Workflow tasks have already been assigned for this content item" }` |
| `500` | Unexpected server error (opaque message) | `{ "success": false, "message": "Internal server error" }` |

---

## 20. Frontend Actions / Buttons Mapping

| Role | Entity & State | Button / Action | Endpoint | Payload |
|---|---|---|---|---|
| `CREATIVE` / `CONTENT_CREATOR` | Task (`CONTENT_CREATION` or `CONTENT_MODIFICATION`) in `TODO` | **Start Task** | `PATCH /api/v1/tasks/:id/status` | `{ "status": "IN_PROGRESS" }` |
| `CREATIVE` / `CONTENT_CREATOR` | Task (`CONTENT_CREATION` or `CONTENT_MODIFICATION`) in `TODO` / `IN_PROGRESS` / `NEEDS_CHANGES` | **Submit / Resubmit Work** | `POST /api/v1/tasks/:id/submit` | `{ "submissionUrl": "...", "submissionNotes": "..." }` |
| `ACCOUNT_MANAGER` / `ADMIN` | Task (`CONTENT_CREATION` / `CONTENT_MODIFICATION` in `SUBMITTED`, or `REVIEW` in `IN_REVIEW`) | **Approve (Internal)** | `PATCH /api/v1/tasks/:id/review` | `{ "decision": "COMPLETED", "notes": "..." }` |
| `ACCOUNT_MANAGER` / `ADMIN` | Same as above | **Request Changes (Internal)** | `PATCH /api/v1/tasks/:id/review` | `{ "decision": "NEEDS_CHANGES", "notes": "..." }` |
| `CLIENT` | ContentItem in `PENDING_CLIENT_REVIEW` | **Approve Content** | `POST /api/v1/content-items/:id/client-review` | `{ "decision": "APPROVE" }` |
| `CLIENT` | ContentItem in `PENDING_CLIENT_REVIEW` | **Request Changes** | `POST /api/v1/content-items/:id/client-review` | `{ "decision": "REQUEST_CHANGES", "notes": "..." }` |
| `ACCOUNT_MANAGER` / `ADMIN` | ClientChangeRequest in `PENDING` | **Resolve (No Change Needed)** | `PATCH /api/v1/client-change-requests/:id/resolve` | `{ "notes": "..." }` |
| `ACCOUNT_MANAGER` / `ADMIN` | ClientChangeRequest in `PENDING` | **Forward to Creative** | `PATCH /api/v1/client-change-requests/:id/forward` | `{ "notes": "...", "assignedTo": 7 }` |

---

## 21. Frontend UI State Mapping

### Task Status Badges
- `TODO` → "Waiting to start"
- `IN_PROGRESS` → "In progress"
- `SUBMITTED` → "Submitted for review"
- `IN_REVIEW` → "Under internal review"
- `NEEDS_CHANGES` → "Changes required"
- `COMPLETED` → "Completed"
- `CANCELLED` → "Cancelled"

### ContentItem `clientReviewStatus`
- `NOT_READY` → Hide Client Review actions (internal production in progress)
- `PENDING_CLIENT_REVIEW` → Show **Approve** and **Request Changes** buttons to `CLIENT`
- `CHANGES_REQUESTED` → Show "Change request sent — waiting for Account Manager" (hide Client Review buttons)
- `IN_MODIFICATION` → Show "Modification in progress" (hide Client Review buttons until Internal Review completes)
- `APPROVED` → Show "Approved" badge with `clientApprovedAt` timestamp

### ClientChangeRequest `status`
- `PENDING` → Show **Resolve** and **Forward to Creative** buttons to `ACCOUNT_MANAGER` / `ADMIN`
- `RESOLVED` → Show "Resolved without modification" + `accountManagerNotes` + `resolvedAt`
- `ACCEPTED` → Show "Forwarded to Creative" + link to `relatedTask` (`relatedTaskId`) + `forwardedAt`

---

## 23. Frontend Integration Checklist

### Authentication
- [ ] Login via `POST /api/v1/auth/login` and store `accessToken` + `refreshToken`
- [ ] Attach `Authorization: Bearer <accessToken>` on all API calls
- [ ] Handle `401` with `POST /api/v1/auth/refresh` and fallback to login

### Tasks & Submission
- [ ] Render task list from `GET /api/v1/tasks` (hide Tasks nav for `CLIENT`)
- [ ] Render both `CONTENT_CREATION` and `CONTENT_MODIFICATION` tasks for `CREATIVE`/`CONTENT_CREATOR`
- [ ] Use `PATCH /api/v1/tasks/:id/status` for `IN_PROGRESS`, and `POST /api/v1/tasks/:id/submit` for submitting/resubmitting deliverables
- [ ] Display `submissionUrl`, `submissionNotes`, `submittedAt`, and `REVIEW.description` (review notes)

### Internal Review
- [ ] Use `PATCH /api/v1/tasks/:id/review` for `COMPLETED` and `NEEDS_CHANGES` (never `/status`)
- [ ] Refresh ContentItem state after approval (`clientReviewStatus` → `PENDING_CLIENT_REVIEW`)

### Client Review & Account Manager Mediation
- [ ] Show Client Review controls to `CLIENT` **only** when `contentItem.clientReviewStatus === 'PENDING_CLIENT_REVIEW'`
- [ ] Require non-empty `notes` in UI when Client selects `REQUEST_CHANGES`
- [ ] Build Account Manager Change Requests queue from `GET /api/v1/client-change-requests?status=PENDING`
- [ ] Wire **Resolve** (`PATCH /:id/resolve`) and **Forward to Creative** (`PATCH /:id/forward`)
- [ ] Hide Client Change Requests UI from `CREATIVE` and `CONTENT_CREATOR`

### Notifications
- [ ] Poll/fetch `GET /api/v1/notifications` and `GET /api/v1/notifications/unread-count`
- [ ] Route clicks by `notification.type` and `notification.data` IDs, and mark read via `PATCH /api/v1/notifications/:id/read`

---

## 24. Test Results

- **Vitest (unit & integration):** `16/16` test files passed, `134/134` tests passed (`tests/client-review-workflow.test.js`: 9/9, `tests/tasks-internal-review.test.js`: 7/7, `tests/tasks-workflow-and-submission.test.js`: 6/6, `src/modules/tasks/tasks.authorization.test.js`: 19/19, `tests/content-management-access.test.js`: 4/4, plus all auth/users/brands/notifications/content-plans/content-items/onboarding tests).
- **Vitest (live Supabase integration):** `tests/content-plan-notifications.supabase.test.js` `1/1` passed.
- **ESLint:** `0` errors, `1` pre-existing warning (`validateBrand` unused in `platform-accounts.service.js`).
- **Prisma Migrations:** `19/19` applied (`Database schema is up to date`).

---

## 25. Known Limitations / Assumptions

1. **No multi-round submission history table:** `Task` stores single-slot `submissionUrl`, `submissionNotes`, `submittedAt`, and `REVIEW.description`. Each forwarded client change request creates a *new* `CONTENT_MODIFICATION` + `REVIEW` task pair (preserving prior rounds' tasks), while multiple internal `NEEDS_CHANGES` resubmissions on the *same* task overwrite `submissionUrl`/`submittedAt` (preserving `submissionNotes` if omitted).
2. **`TaskDeadlineRule` seeding:** `prisma/seed.js` does not seed `task_deadline_rules`. Initial `POST /api/v1/tasks/content-items/:id/assign` requires active rules for `(contentItem.type, 'CONTENT_CREATION')` and `(contentItem.type, 'REVIEW')`; `forward` gracefully falls back to `plannedDeadline` or `contentItem.scheduledDate` if rules are absent.
3. **Publish stage not yet implemented:** `clientReviewStatus === 'APPROVED'` marks the content item ready for publishing; `PUBLISH` task automation is out of scope for this phase.
4. **JSON body limit:** Global `express.json({ limit: '10kb' })` applies to all JSON requests; file uploads must go through `POST /api/v1/files/upload` (`multipart/form-data`, up to 50MB) and pass the returned URL as `submissionUrl`.
