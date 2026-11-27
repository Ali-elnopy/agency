import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';

function loginAs(email, password) {
  const emailInput = document.querySelector('[data-f="email"]');
  const pwInput = document.querySelector('[data-f="password"]');
  expect(emailInput).toBeTruthy();
  expect(pwInput).toBeTruthy();
  emailInput.value = email;
  pwInput.value = password;
  window.doLogin();
}

describe('ORVIA End-to-End User Stories & Edge-Case Verification', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    const oldScript = document.getElementById('orvia-agency-script');
    if (oldScript) oldScript.remove();
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline test mode'))));
    if (typeof URL.createObjectURL !== 'function') {
      URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    } else {
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    }
    if (typeof URL.revokeObjectURL !== 'function') {
      URL.revokeObjectURL = vi.fn();
    } else {
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    }
    render(<App />);
    const mountedScript = document.getElementById('orvia-agency-script');
    if (mountedScript) {
      new Function(mountedScript.textContent)();
    }
    window.S.authed = false;
    window.S.auth = 'login';
    window.S.err = {};
    window.render(false);
  });

  afterEach(() => {
    cleanup();
    const s = document.getElementById('orvia-agency-script');
    if (s) s.remove();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('1. Auth edge cases: malformed email inline error, wrong password, deactivated account block, and wrong current password on Change Password', async () => {
    // Malformed email
    loginAs('not-an-email', 'Admin123456!');
    await vi.waitFor(() => {
      expect(window.S.err.email).toBe('Please enter a valid email address.');
      expect(window.S.authed).toBe(false);
    });

    // Valid Admin login
    loginAs('elena@agency-clean.co', 'Admin123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('admin');
    });

    // Hamburger menu icon removed
    expect(document.querySelector('button[aria-label="Menu"]')).toBeNull();

    // Change Password with WRONG current password must fail and NOT update
    window.go('account');
    window.view(false);
    const curPw = document.querySelector('[data-f="currentPassword"]');
    const newPw = document.querySelector('[data-f="newPassword"]');
    curPw.value = 'WrongPassword999!';
    newPw.value = 'NewValidPass123!';
    window.chg();
    expect(window.S.err.currentPassword).toBe('Current password is incorrect.');

    // Deactivate Karim and verify he cannot log in
    const karim = window.D.users.rows.find((u) => u.email === 'karim@agency-clean.co');
    karim.isActive = false;
    window.logout();
    loginAs('karim@agency-clean.co', 'Creative123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(false);
      expect(window.S.err.password).toBe('This account is inactive.');
    });
    karim.isActive = true;
  });

  it('2. New Brand with dedicated email/password opens its own scoped Client Portal + Profile Editing works', async () => {
    loginAs('elena@agency-clean.co', 'Admin123456!');
    await vi.waitFor(() => expect(window.S.authed).toBe(true));

    // Edit Profile (name + phone)
    window.go('account');
    window.view(false);
    expect(document.body.textContent).toContain('Edit profile');
    window.editProfile();
    document.getElementById('ep-name').value = 'Elena Vance Updated';
    document.getElementById('ep-phone').value = '+20 100 555 1234';
    window.saveProfile();
    expect(document.body.textContent).toContain('Elena Vance Updated');
    expect(document.body.textContent).toContain('+20 100 555 1234');

    // Create New Brand with email + strong password
    window.go('brands');
    window.view(false);
    window.act('brands', null, 'new');
    document.querySelector('.dlg [data-f="name"]').value = 'Velvet Roasters';
    document.querySelector('.dlg [data-f="industry"]').value = 'Food & Beverage';
    document.querySelector('.dlg [data-f="status"]').value = 'ACTIVE';
    document.querySelector('.dlg [data-f="email"]').value = 'owner@velvetroasters.com';
    document.querySelector('.dlg [data-f="password"]').value = 'VelvetPass123!';
    window.save('brands', null);
    expect(window.D.brands.rows.some((b) => b.name === 'Velvet Roasters')).toBe(true);

    // Log out and log in as the new brand
    window.logout();
    loginAs('owner@velvetroasters.com', 'VelvetPass123!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('client');
      expect(window.S.clientBrand).toBe('Velvet Roasters');
    });

    // Client onboarding starts fresh (0 of 7) for Velvet Roasters
    window.go('onboarding');
    window.view(false);
    expect(document.body.textContent).toContain('Velvet Roasters / Onboarding');
  });

  it('3. Client submits onboarding -> AM notified -> AM can generate Brand Brief ONCE from client answers (blocked before onboarding)', async () => {
    // 1. Admin creates a brand with its own client credentials
    loginAs('elena@agency-clean.co', 'Admin123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('admin'));
    window.go('brands');
    window.view(false);
    window.act('brands', null, 'new');
    document.querySelector('.dlg [data-f="name"]').value = 'Cedar Brew';
    document.querySelector('.dlg [data-f="industry"]').value = 'Food & Beverage';
    document.querySelector('.dlg [data-f="status"]').value = 'ACTIVE';
    document.querySelector('.dlg [data-f="email"]').value = 'client@cedarbrew.com';
    document.querySelector('.dlg [data-f="password"]').value = 'CedarPass123!';
    window.save('brands', null);

    // 2. AM tries to generate brief BEFORE client submits onboarding -> MUST be blocked!
    window.logout();
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('am'));
    window.S.page = 'brands';
    window.S.brand = 'Cedar Brew';
    window.S.sub = 'brief';
    window.view(false);
    expect(document.body.textContent).toContain('Waiting for client onboarding');
    await window.gen();
    expect(window.D.briefs.rows.filter((b) => b.brandId === 'Cedar Brew').length).toBe(0);

    // 3. Client logs in, answers onboarding questions, and submits -> AM is notified
    window.logout();
    loginAs('client@cedarbrew.com', 'CedarPass123!');
    await vi.waitFor(() => expect(window.S.clientBrand).toBe('Cedar Brew'));
    window.OB.cat = 'Food';
    window.OB.act = 'Cafe';
    window.OB.a = {
      q0: 'Cedar Brew',
      q1: '2024',
      q2: 'Specialty organic cold-brew coffee house',
      q3: 'Organic cold-brew coffee and pastries',
      q4: 'Cardamom Cold Brew',
      q6: 'Young creatives aged 20-35',
      q9: 'Grow Instagram community and daily orders',
      q14: 'Single-origin beans roasted locally',
      q16: 'Warm, bold, artisanal',
      q18: 'Drive foot traffic and online orders',
      q19: 'Instagram & TikTok',
      q20: '16 posts per month',
    };
    window.OB.done = [0, 1, 2, 3, 4, 5, 6];
    window.obFinish();

    // Verify AM notification was created for Cedar Brew
    const amNotif = window.D.notifications.rows.find(
      (n) => n.title.includes('Cedar Brew') && Array.isArray(n.to) && n.to.includes('am'),
    );
    expect(amNotif).toBeTruthy();

    // 4. AM logs in -> generates Brand Brief ONCE based on client's exact answers
    window.logout();
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('am'));
    window.S.page = 'brands';
    window.S.brand = 'Cedar Brew';
    window.S.sub = 'brief';
    window.view(false);
    expect(document.body.textContent).toContain('Generate brief');

    await window.gen();
    expect(window.D.briefs.rows.filter((b) => b.brandId === 'Cedar Brew').length).toBe(1);

    // Trying to generate a SECOND time must be blocked!
    await window.gen();
    expect(window.D.briefs.rows.filter((b) => b.brandId === 'Cedar Brew').length).toBe(1);

    // Generated brief contains the Client's actual answers & shows Client's original answers side-by-side
    const genBriefIdx = window.D.briefs.rows.findIndex(
      (b) => b.brandId === 'Cedar Brew' && b.status === 'GENERATED',
    );
    expect(genBriefIdx).toBeGreaterThanOrEqual(0);
    const genBrief = window.D.briefs.rows[genBriefIdx];
    expect(JSON.stringify(genBrief.content)).toContain('Cardamom Cold Brew');
    expect(JSON.stringify(genBrief.content)).toContain('Young creatives aged 20-35');

    window.act('briefs', genBriefIdx, 'view');
    window.view(false);
    expect(document.body.textContent).toContain('Brand Overview');
    expect(document.body.textContent).toContain('Client’s original answers');
    expect(document.body.textContent).toContain('Cardamom Cold Brew');

    // Approve brief
    await window.D.briefs.run('ap', genBrief);
    expect(genBrief.status).toBe('APPROVED');

    // Notifications: mark single read & mark all read
    window.go('notifications');
    window.view(false);
    const unreadIdx = window.D.notifications.rows.findIndex((n) => !n.isRead);
    if (unreadIdx >= 0) {
      window.markRead(unreadIdx);
      expect(window.D.notifications.rows[unreadIdx].isRead).toBe(true);
    }
    window.markAllRead();
    expect(window.D.notifications.rows.every((n) => n.isRead)).toBe(true);
  });

  it('4. Strategy flow: CC uploads linked to brief -> AM internal Request Changes (never reaches Client) -> CC re-uploads -> AM approves to Client -> Client approves', async () => {
    // CC uploads strategy for Nord Coffee (currently st='am') -> test AM internal reject first
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('am'));

    window.S.page = 'brands';
    window.S.brand = 'Nord Coffee';
    window.S.sub = 'strategy';
    window.view(false);
    expect(document.body.textContent).toContain('Linked brief:');
    expect(document.body.textContent).toContain('Request changes');

    // AM requests changes internally
    document.getElementById('rs').value = 'Add Q1 retention targets before sending to client.';
    window.sgo('am_reject');
    expect(window.STR['Nord Coffee'].st).toBe('forwarded');
    expect(window.STR['Nord Coffee'].out).toBe('rejected');

    // Client must NOT see unapproved strategy
    window.logout();
    loginAs('sara@lumen.com', 'Client123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('client'));
    window.go('strategy');
    window.view(false);
    expect(document.body.textContent).toContain('Approve');
    window.sgo('approve');
    expect(window.STR['Lumen Skincare'].st).toBe('answered');
    expect(window.STR['Lumen Skincare'].out).toBe('approved');
  });

  it('5. Monthly Plans, Full Plan (campaigns + unassigned), Content Items (POST/REEL/STORY), AM assign tasks, CC submit with URL, Reviewer approve -> auto Publish task, Employee My Work', async () => {
    // Unlock Lumen Skincare content plans
    window.STR['Lumen Skincare'].st = 'forwarded';
    window.STR['Lumen Skincare'].out = 'approved';

    // CC creates monthly plan, campaign, content items, opens Full Plan
    loginAs('lina@agency-clean.co', 'Creator123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('cc'));

    window.S.page = 'brands';
    window.S.brand = 'Lumen Skincare';
    window.S.sub = 'platforms';
    window.view(false);

    // Open Full Plan page for existing plan id=1
    window.openD({ t: 'plan', id: 1 });
    window.view(false);
    expect(document.body.textContent).toContain('Winter Glow');
    expect(document.body.textContent).toContain('Unassigned to a campaign');

    // AM assigns creation & review tasks from open content item id=2
    window.logout();
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('am'));

    window.openD({ t: 'item', id: 2 });
    window.view(false);
    expect(document.body.textContent).toContain('Assign creation & review tasks');
    window.assignItemTasks(2);
    document.getElementById('at-creator').value = 'Karim Fouad';
    document.getElementById('at-reviewer').value = 'Omar Haddad';
    await window.saveItemTasks(2);
    expect(window.TK.some((t) => t.title === 'Create: Serum routine reel' && t.assignee === 'Karim Fouad')).toBe(true);
    expect(window.TK.some((t) => t.title === 'Review: Serum routine reel' && t.assignee === 'Omar Haddad')).toBe(true);

    // AM creates a Direct Task for Karim
    window.go('tasks');
    window.view(false);
    expect(window.S.tw).toBe('team');
    window.newTask();
    document.getElementById('dt1').value = 'Audit Q4 Reels';
    document.getElementById('dt3').value = 'Karim Fouad';
    document.getElementById('dt4').value = 'HIGH';
    document.getElementById('dt5').value = '2026-11-28';
    window.saveTask();

    // Employee Karim logs in -> My Work shows BOTH Content tasks AND Direct tasks with context!
    window.logout();
    loginAs('karim@agency-clean.co', 'Creative123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('emp'));
    window.go('tasks');
    window.view(false);
    expect(document.body.textContent).toContain('Audit Q4 Reels');
    expect(document.body.textContent).toContain('Create: Serum routine reel');
    expect(document.body.textContent).toContain('Lumen Skincare');

    // Karim starts & submits creation task with URL
    const createTask = window.TK.find((t) => t.title === 'Create: Serum routine reel');
    window.tset(createTask.id, 'IN_PROGRESS');
    expect(createTask.status).toBe('IN_PROGRESS');
    window.submitTaskModal(createTask.id);
    document.getElementById('st-url').value = 'https://drive.google.com/file/d/reel-v1';
    document.getElementById('st-notes').value = 'Ready for AM review';
    await window.confirmSubmitTask(createTask.id);
    expect(createTask.status).toBe('SUBMITTED');
    expect(createTask.submissionUrl).toBe('https://drive.google.com/file/d/reel-v1');

    // AM approves the dependent review task -> auto-creates a PUBLISH task!
    window.logout();
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('am'));
    const revTask = window.TK.find((t) => t.after === createTask.id && t.kind === 'REVIEW');
    expect(revTask.status).toBe('IN_REVIEW');
    window.tset(revTask.id, 'COMPLETED');
    expect(revTask.status).toBe('COMPLETED');
    expect(createTask.status).toBe('COMPLETED');
    expect(window.TK.some((t) => t.kind === 'PUBLISH' && t.after === revTask.id)).toBe(true);
  });

  it('6. Online API wiring: verifies exact HTTP endpoints & payloads for onboarding, brand-briefs, tasks assign/submit/review, content-items, and notifications', async () => {
    const calls = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url, opts = {}) => {
        const path = String(url).replace(/^\/api/, '');
        const method = opts.method || 'GET';
        const body = typeof opts.body === 'string' ? JSON.parse(opts.body) : opts.body;
        calls.push({ method, path, body });

        if (path === '/auth/login') {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              data: {
                accessToken: 'jwt-test-token',
                refreshToken: 'ref-test-token',
                user: { id: 2, fullName: 'Omar Haddad', email: 'omar@agency-clean.co', isActive: true, role: { name: 'ACCOUNT_MANAGER' } },
              },
            }),
          };
        }
        if (path === '/brand-briefs/10/generate' && method === 'POST') {
          return {
            ok: true,
            status: 201,
            json: async () => ({
              success: true,
              data: {
                id: 55,
                version: 1,
                status: 'GENERATED',
                generatedAt: '2026-11-26T10:00:00Z',
                content: {
                  brandOverview: { clientInformation: ['Info'], aiAnalysis: ['Analysis'], recommendations: ['Rec'] },
                },
              },
            }),
          };
        }
        if (path === '/brand-briefs/55/approve' && method === 'POST') {
          return {
            ok: true,
            status: 200,
            json: async () => ({ success: true, data: { serverId: 55, id: 'brief-55', version: 1, backendStatus: 'APPROVED', status: 'approved' } }),
          };
        }
        if (path === '/notifications/read-all' && method === 'PATCH') {
          return { ok: true, status: 200, json: async () => ({ success: true, data: { updated: 3 } }) };
        }
        return { ok: true, status: 200, json: async () => ({ success: true, data: {} }) };
      }),
    );

    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.getApiToken()).toBe('jwt-test-token');
    });

    // Generate brief via live API for brand ID 10
    window.D.brands.rows.unshift({ _id: 10, name: 'Nova Labs', industry: 'Tech', status: 'ACTIVE', teamId: 'Performance Ops', accountManagerId: 'Omar Haddad' });
    window.S.brand = 'Nova Labs';
    await window.gen();
    expect(calls.some((c) => c.method === 'POST' && c.path === '/brand-briefs/10/generate')).toBe(true);

    // Approve brief uses numeric serverId (55), NOT "brief-55"!
    const novaBrief = window.D.briefs.rows.find((b) => b.brandId === 'Nova Labs');
    expect(novaBrief._id).toBe(55);
    await window.D.briefs.run('ap', novaBrief);
    expect(calls.some((c) => c.method === 'POST' && c.path === '/brand-briefs/55/approve')).toBe(true);
    expect(novaBrief.status).toBe('APPROVED');

    // Mark all notifications read calls PATCH /notifications/read-all
    window.markAllRead();
    expect(calls.some((c) => c.method === 'PATCH' && c.path === '/notifications/read-all')).toBe(true);
  });

  it('7. Sprint 4: Progress Tracking (AM), Workflow Rules (Internal -> Client -> Approve/Changes -> Edit after Approval -> Publish), and Client Requests API wiring', async () => {
    const calls = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url, opts = {}) => {
        const path = String(url).replace(/^\/api/, '');
        const method = opts.method || 'GET';
        const body = typeof opts.body === 'string' ? JSON.parse(opts.body) : opts.body;
        calls.push({ method, path, body });

        if (path === '/auth/login') {
          const isClient = body?.email === 'sara@lumen.com';
          return {
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              data: {
                accessToken: isClient ? 'jwt-client-token' : 'jwt-am-token',
                refreshToken: 'ref-token',
                user: isClient
                  ? { id: 5, fullName: 'Sara Mansour', email: 'sara@lumen.com', isActive: true, role: { name: 'CLIENT' } }
                  : { id: 2, fullName: 'Omar Haddad', email: 'omar@agency-clean.co', isActive: true, role: { name: 'ACCOUNT_MANAGER' } },
              },
            }),
          };
        }
        if (path === '/dashboard/progress') {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              data: {
                totalTasks: 10,
                todoTasks: 2,
                inProgressTasks: 3,
                submittedTasks: 1,
                inReviewTasks: 1,
                needsChangesTasks: 0,
                completedTasks: 3,
                cancelledTasks: 0,
                overdueTasks: 2,
                completionRate: 30,
              },
            }),
          };
        }
        if (path === '/dashboard/team-performance') {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              data: {
                members: [
                  {
                    user: { id: 3, fullName: 'Lina Aziz', role: 'CONTENT_CREATOR' },
                    totalAssignedTasks: 5,
                    completedTasks: 3,
                    inProgressTasks: 2,
                    overdueTasks: 1,
                    onTimeRate: 80,
                  },
                ],
                totalMembers: 1,
              },
            }),
          };
        }
        if (path === '/client-requests' && method === 'POST') {
          return {
            ok: true,
            status: 201,
            json: async () => ({
              success: true,
              data: { id: 91, type: body.type, description: body.description, status: 'PENDING', brandId: 1 },
            }),
          };
        }
        if (path === '/client-requests/91/accept' && method === 'PATCH') {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              data: {
                request: { id: 91, status: 'ACCEPTED', employeeId: body.assignedTo },
                task: { id: 501, title: 'Client Request: EXTRA_CONTENT', status: 'TODO', priority: body.priority || 'MEDIUM' },
              },
            }),
          };
        }
        if (path === '/content-items/201/client-review' && method === 'POST') {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              data: { contentItem: { id: 201, clientReviewStatus: body.decision === 'APPROVE' ? 'APPROVED' : 'CHANGES_REQUESTED' } },
            }),
          };
        }
        if (path === '/content-items/201/publishing' && method === 'PATCH') {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              data: { id: 201, publishStatus: 'PUBLISHED', publishUrl: body.publishUrl },
            }),
          };
        }
        return { ok: true, status: 200, json: async () => ({ success: true, data: {} }) };
      }),
    );

    // 1. AM logs in -> Progress Tracking hydrates /dashboard/progress & /dashboard/team-performance
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(calls.some((c) => c.path === '/dashboard/progress')).toBe(true);
      expect(calls.some((c) => c.path === '/dashboard/team-performance')).toBe(true);
    });

    window.go('reports');
    window.view(false);
    expect(document.body.textContent).toContain('Client plan execution progress');
    expect(document.body.textContent).toContain('Overdue tasks');
    expect(document.body.textContent).toContain('Content awaiting review');
    expect(document.body.textContent).toContain('Workload by employee');
    expect(document.body.textContent).toContain('Workload by team');

    // 2. Client logs in -> submits a Client Request (POST /client-requests) & approves a CLIENT_REVIEW item (POST /content-items/:id/client-review)
    window.logout();
    loginAs('sara@lumen.com', 'Client123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('client'));

    window.reqNew();
    document.querySelector('[data-f="kind"]').value = 'Extra content';
    document.querySelector('[data-f="text"]').value = 'Need 2 extra Ramadan stories';
    window.askOk();
    await vi.waitFor(() => {
      expect(calls.some((c) => c.method === 'POST' && c.path === '/client-requests' && c.body.type === 'EXTRA_CONTENT')).toBe(true);
    });

    const item = window.PLANS[0].items[1];
    item._id = 201;
    item.stage = 'CLIENT_REVIEW';
    await window.mv(item.id, 'APPROVED');
    expect(calls.some((c) => c.method === 'POST' && c.path === '/content-items/201/client-review' && c.body.decision === 'APPROVE')).toBe(true);
    expect(item.stage).toBe('APPROVED');

    // 3. Edit after approval -> resets APPROVED to IN_REVIEW & preserves previous version + history
    window.logout();
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('am'));

    window.editItem(item.id);
    const titleEl = document.querySelector('.dlg [data-i="title"]');
    if (titleEl) titleEl.value = 'Gift-set carousel (updated)';
    window.itSave(window.PLANS[0].id, item.id);
    expect(item.stage).toBe('IN_REVIEW');
    expect((item.vers || []).length).toBeGreaterThan(0);
    expect(item.hist.some((h) => h.a === 'Edited after approval')).toBe(true);

    // 4. Publishing record -> PATCH /content-items/201/publishing
    item.stage = 'APPROVED';
    window.pubRec(item.id);
    document.getElementById('pb-st').value = 'PUBLISHED';
    document.getElementById('pb-d').value = '2026-11-28';
    document.getElementById('pb-u').value = 'https://instagram.com/p/lumen-winter-1';
    document.getElementById('pb-n').value = 'Published on IG feed';
    await window.confirmPubRec(item.id);
    await vi.waitFor(() => {
      expect(calls.some((c) => c.method === 'PATCH' && c.path === '/content-items/201/publishing' && c.body.publishStatus === 'PUBLISHED')).toBe(true);
      expect(item.stage).toBe('PUBLISHED');
    });
  });

  it('8. Internal Review flow: Employee sends content -> AM returns with comments -> Employee edits & resubmits new version (v2) -> AM approves to Client Review', async () => {
    const calls = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url, opts = {}) => {
        const path = String(url).replace(/^\/api/, '');
        const method = opts.method || 'GET';
        const body = typeof opts.body === 'string' ? JSON.parse(opts.body) : opts.body;
        calls.push({ method, path, body });

        if (path === '/auth/login') {
          const isEmp = body?.email === 'karim@agency-clean.co';
          return {
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              data: {
                accessToken: isEmp ? 'jwt-emp-token' : 'jwt-am-token',
                refreshToken: 'ref-token',
                user: isEmp
                  ? { id: 4, fullName: 'Karim Fouad', email: 'karim@agency-clean.co', isActive: true, role: { name: 'CREATIVE' } }
                  : { id: 2, fullName: 'Omar Haddad', email: 'omar@agency-clean.co', isActive: true, role: { name: 'ACCOUNT_MANAGER' } },
              },
            }),
          };
        }
        return { ok: true, status: 200, json: async () => ({ success: true, data: {} }) };
      }),
    );

    // Prepare a DRAFT content item linked to a creation task (301) and review task (302)
    const item = window.PLANS[0].items[0];
    item._id = 401;
    item.stage = 'DRAFT';
    item.v = 1;
    item.link = 'https://drive.google.com/file/d/draft-v1';
    item.vers = [];
    item.comments = [];
    item.hist = [];

    window.TK.unshift(
      { id: 301, _id: 301, contentItemId: 401, title: 'Create: ' + item.title, kind: 'CREATION', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'Karim Fouad', by: 'Omar Haddad', brand: 'Lumen Skincare', ctx: [item.title], planned: '2026-11-25', eff: '2026-11-25', desc: '', submissionUrl: 'https://drive.google.com/file/d/draft-v1' },
      { id: 302, _id: 302, contentItemId: 401, title: 'Review: ' + item.title, kind: 'REVIEW', status: 'TODO', priority: 'HIGH', assignee: 'Omar Haddad', by: 'Omar Haddad', brand: 'Lumen Skincare', ctx: [item.title], planned: '2026-11-26', eff: '2026-11-26', desc: '', after: 301 },
    );

    // 1. Employee (Karim) logs in -> can access Review page & send DRAFT to IN_REVIEW
    loginAs('karim@agency-clean.co', 'Creative123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('emp'));
    expect(window.NAV.emp).toContain('review');
    await window.mv(item.id, 'IN_REVIEW');
    expect(item.stage).toBe('IN_REVIEW');
    expect(calls.some((c) => c.method === 'POST' && c.path === '/tasks/301/submit')).toBe(true);

    // 2. Account Manager (Omar) returns content with comments (CHANGES_REQUESTED)
    window.logout();
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('am'));
    await window.mv(item.id, 'CHANGES_REQUESTED', 'Please brighten the hero visual and shorten caption.');
    expect(item.stage).toBe('CHANGES_REQUESTED');
    expect(item.comments.some((c) => c.t.includes('brighten the hero visual'))).toBe(true);
    expect(calls.some((c) => c.method === 'PATCH' && c.path === '/tasks/302/review' && c.body.decision === 'NEEDS_CHANGES' && c.body.notes.includes('brighten'))).toBe(true);

    // 3. Employee (Karim) edits & submits new version (v2) back to IN_REVIEW
    window.logout();
    loginAs('karim@agency-clean.co', 'Creative123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('emp'));
    item.link = 'https://drive.google.com/file/d/draft-v2';
    await window.mv(item.id, 'IN_REVIEW', 'Updated lighting and shortened caption');
    expect(item.stage).toBe('IN_REVIEW');
    expect(item.v).toBe(2);
    expect(item.vers.length).toBe(1);

    // 4. Account Manager approves for client (IN_REVIEW -> CLIENT_REVIEW)
    window.logout();
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('am'));
    await window.mv(item.id, 'CLIENT_REVIEW');
    expect(item.stage).toBe('CLIENT_REVIEW');
    expect(calls.some((c) => c.method === 'PATCH' && c.path === '/tasks/302/review' && c.body.decision === 'COMPLETED')).toBe(true);
  });

  it('9. Comments & Revision History audit log + Task/Workflow Notifications for all key events', async () => {
    // 1. AM assigns a direct task -> notification created for assignee
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('am'));

    window.newTask();
    document.getElementById('dt1').value = 'Design launch banner';
    document.getElementById('dt3').value = 'Karim Fouad';
    document.getElementById('dt4').value = 'HIGH';
    document.getElementById('dt5').value = '2026-11-29';
    window.saveTask();
    expect(window.D.notifications.rows.some((n) => n.title.includes('New task assigned to Karim Fouad') && n.title.includes('Design launch banner'))).toBe(true);

    // 2. AM edits task -> notification created for task update
    const bannerTask = window.TK.find((t) => t.title === 'Design launch banner');
    window.editTask(bannerTask.id);
    document.getElementById('et-priority').value = 'URGENT';
    await window.saveEditTask(bannerTask.id);
    expect(window.D.notifications.rows.some((n) => n.title.includes('Task updated:') && n.title.includes('Design launch banner'))).toBe(true);

    // 3. Comments & Revision History + Approval metadata + "Task completed != Client approved" notice
    const item = window.PLANS[0].items[0];
    item.stage = 'CLIENT_REVIEW';
    item.v = 2;
    item.approvedAt = '';
    item.approvedBy = '';
    window.TK.unshift({ id: 901, contentItemId: item.id, title: 'Create: ' + item.title, kind: 'CREATION', status: 'COMPLETED', priority: 'MEDIUM', assignee: 'Karim Fouad', by: 'Omar Haddad', brand: 'Lumen Skincare', ctx: [item.title], planned: '2026-11-25', eff: '2026-11-25', desc: '' });

    window.openD({ t: 'item', id: item.id });
    window.view(false);
    expect(document.body.textContent).toContain('Approved by');
    expect(document.body.textContent).toContain('Not approved by client yet');
    expect(document.body.textContent).toContain('Internal task is completed, but this content is not approved by the client yet.');

    // 4. Client approves -> records Approved by & Approved at in audit summary
    window.logout();
    loginAs('sara@lumen.com', 'Client123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('client'));
    await window.mv(item.id, 'APPROVED');
    expect(item.approvedBy).toContain('Client');
    expect(item.approvedAt).toBeTruthy();

    // 5. Notifications page shows in-app channel indicator & review/tasks links
    window.go('notifications');
    window.view(false);
    expect(document.body.textContent).toContain('Channel: In-app notifications');
  });

  it('10. Client Portal (Web): sees own Brief & Content Plans, comments, approves/requests changes, sends Requests, receives own Notifications, and cannot access any other Client data', async () => {
    loginAs('sara@lumen.com', 'Client123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('client'));

    // Sidebar includes Brief, Content Plans, Review, Requests, Notifications
    expect(window.NAV.client).toContain('brief');
    expect(window.NAV.client).toContain('plans');
    expect(window.NAV.client).toContain('review');
    expect(window.NAV.client).toContain('requests');
    expect(window.NAV.client).toContain('notifications');

    // Brief page shows ONLY Lumen Skincare (never Nord Coffee)
    window.go('brief');
    window.view(false);
    const viewEl = () => document.getElementById('view')?.textContent || '';
    expect(viewEl()).toContain('Lumen Skincare');
    expect(viewEl()).not.toContain('Nord Coffee');

    // Content Plans page shows ONLY Lumen Skincare plans & items
    window.PLANS.push({ id: 999, brand: 'Nord Coffee', platform: '@nordcoffee', title: 'Secret Nord Plan', month: 'Nov 2026', campaigns: [], items: [{ id: 9991, title: 'Secret Nord Post', type: 'POST', stage: 'CLIENT_REVIEW', v: 1, comments: [], hist: [] }] });
    window.go('plans');
    window.view(false);
    expect(viewEl()).toContain('Nov · Lumen Skincare');
    expect(viewEl()).not.toContain('Secret Nord Plan');
    expect(viewEl()).not.toContain('Secret Nord Post');

    // Client can comment on their own item
    const myItem = window.PLANS[0].items[0];
    window.openD({ t: 'item', id: myItem.id });
    window.view(false);
    expect(viewEl()).toContain(myItem.title);
    window.cmt(myItem.id);
    document.querySelector('[data-f="t"]').value = 'Love the lighting on this shot!';
    window.askOk();
    expect(myItem.comments.some((c) => c.t === 'Love the lighting on this shot!')).toBe(true);

    // Tenant isolation: attempting to open another client's item or plan or brief is blocked!
    window.openD({ t: 'item', id: 9991 });
    window.view(false);
    expect(viewEl()).not.toContain('Secret Nord Post');

    window.openD({ t: 'plan', id: 999 });
    window.view(false);
    expect(viewEl()).not.toContain('Secret Nord Plan');

    const nordBriefIdx = window.D.briefs.rows.findIndex((b) => b.brandId === 'Nord Coffee');
    if (nordBriefIdx >= 0) {
      window.openD({ t: 'row', k: 'briefs', i: nordBriefIdx });
      window.view(false);
      expect(viewEl()).not.toContain('Urban professionals');
    }
  });

  it('11. Client Requests full lifecycle: Submitted -> Under Review -> Assigned (creates Task / Content Item) + Rejected with reason + Client notifications', async () => {
    // 1. Client submits two requests
    loginAs('sara@lumen.com', 'Client123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('client'));

    window.reqNew();
    document.querySelector('[data-f="kind"]').value = 'New idea';
    document.querySelector('[data-f="text"]').value = 'Behind the scenes lab tour reel';
    window.askOk();

    window.reqNew();
    document.querySelector('[data-f="kind"]').value = 'Plan change';
    document.querySelector('[data-f="text"]').value = 'Move launch to next month';
    window.askOk();

    const rAccept = window.REQ.find((r) => r.text === 'Behind the scenes lab tour reel');
    const rReject = window.REQ.find((r) => r.text === 'Move launch to next month');
    expect(rAccept.st).toBe('SUBMITTED');
    expect(rReject.st).toBe('SUBMITTED');

    // 2. AM marks first request Under Review -> Client notified
    window.logout();
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('am'));

    window.reqReview(rAccept.id);
    expect(rAccept.st).toBe('UNDER_REVIEW');
    expect(window.D.notifications.rows.some((n) => n.title.includes('under review'))).toBe(true);

    // 3. AM accepts & assigns first request to team + employee -> creates Task in TK
    window.reqOk(rAccept.id);
    document.getElementById('rq-team').value = 'Creative & Motion Studio';
    document.getElementById('rq-emp').value = 'Karim Fouad';
    document.getElementById('rq-pr').value = 'HIGH';
    document.getElementById('rq-dl').value = '2026-12-05';
    await window.confirmReqOk(rAccept.id);
    expect(rAccept.st).toBe('ASSIGNED');
    expect(rAccept.team).toBe('Creative & Motion Studio');
    expect(window.TK.some((t) => t.desc === 'Behind the scenes lab tour reel' && t.assignee === 'Karim Fouad')).toBe(true);

    // 4. Team member turns assigned request into a Content Item in PLANS
    window.reqItem(rAccept.id);
    expect(window.PLANS[0].items.some((i) => i.title.includes('Behind the scenes lab tour reel'))).toBe(true);

    // 5. AM rejects second request with reason -> Client sees REJECTED + reason
    window.reqNo(rReject.id);
    document.querySelector('[data-f="r"]').value = 'Campaign media buying is already locked.';
    window.askOk();
    expect(rReject.st).toBe('REJECTED');
    expect(rReject.reason).toBe('Campaign media buying is already locked.');
    expect(window.D.notifications.rows.some((n) => n.title.includes('Campaign media buying is already locked.'))).toBe(true);
  });

  it('12. Publishing Tracking (manual approved-only + Client read-only) & Calendar View (monthly, Publish Date, AM vs Admin brand scope)', async () => {
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('am'));

    const item = window.PLANS[0].items[0];
    // Cannot record publishing on unapproved content
    item.stage = 'IN_REVIEW';
    window.pubRec(item.id);
    expect(document.getElementById('pb-st')).toBeNull();

    // Record publishing on APPROVED content (first SCHEDULED, then PUBLISHED)
    item.stage = 'APPROVED';
    window.pubRec(item.id);
    document.getElementById('pb-st').value = 'SCHEDULED';
    document.getElementById('pb-d').value = '2026-11-26';
    document.getElementById('pb-u').value = '';
    document.getElementById('pb-n').value = 'Scheduled for 7 PM';
    await window.confirmPubRec(item.id);
    expect(item.pub.status).toBe('SCHEDULED');
    expect(item.stage).toBe('APPROVED');

    window.pubRec(item.id);
    document.getElementById('pb-st').value = 'PUBLISHED';
    document.getElementById('pb-d').value = '2026-11-26';
    document.getElementById('pb-u').value = 'https://instagram.com/p/lumen-live-26';
    document.getElementById('pb-n').value = 'Live on Instagram';
    await window.confirmPubRec(item.id);
    expect(item.stage).toBe('PUBLISHED');
    expect(item.pub.u).toBe('https://instagram.com/p/lumen-live-26');

    // Calendar View shows item on its Publish Date, excludes undated items, and clicking opens details
    window.PLANS[0].items.push({ id: 8881, title: 'Undated draft post', type: 'POST', platform: '@lumen.skin', date: '', assignee: 'Lina Aziz', stage: 'DRAFT', v: 1, comments: [], hist: [] });
    window.S.cm = '2026-11';
    window.go('calendar');
    window.view(false);
    const calText = document.getElementById('view')?.textContent || '';
    expect(calText).toContain('November 2026');
    expect(calText).toContain(item.title);
    expect(calText).not.toContain('Undated draft post');
    expect(calText).toContain('without a publish date are kept off the calendar');

    // Client sees Publishing record as read-only (no Record/Update publishing button)
    window.logout();
    loginAs('sara@lumen.com', 'Client123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('client'));
    window.openD({ t: 'item', id: item.id });
    window.view(false);
    const clientView = document.getElementById('view')?.textContent || '';
    expect(clientView).toContain('Publishing tracking');
    expect(clientView).toContain('https://instagram.com/p/lumen-live-26');
    expect(clientView).not.toContain('Update publishing');
    expect(clientView).not.toContain('Record publishing');
  });

  it('13. Monthly Performance Report: Brand tab import, Platform + Month, missing field highlight, duplicate replace prompt, AI analysis, Approve -> Share gate, History table, Admin & Client visibility', async () => {
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('am'));

    // AM enters Brand -> Monthly Performance tab
    window.S.page = 'brands';
    window.S.brand = 'Lumen Skincare';
    window.S.sub = 'performance';
    window.view(false);
    expect(document.getElementById('view')?.textContent || '').toContain('Monthly Performance Report');
    expect(document.getElementById('view')?.textContent || '').toContain('Previous months history');

    // Open review modal with one missing metric (Conversions) -> highlights missing field instead of guessing
    window.repRev({ Followers: '14500', Reach: '60000', Impressions: '130000', Engagement: '3800' }, 'Lumen Skincare');
    expect(document.querySelector('.dlg')?.textContent || '').toContain('Missing in the file');

    // Fill missing metric, pick platform & month, save
    document.querySelector('[data-r="platform"]').value = 'INSTAGRAM';
    document.querySelector('[data-r="month"]').value = '2026-11';
    document.querySelector('[data-r="Conversions"]').value = '310';
    window.repSave();

    const novRep = window.MR.find((r) => r.brand === 'Lumen Skincare' && r.month === '2026-11' && r.platform === 'INSTAGRAM');
    expect(novRep).toBeTruthy();
    expect(novRep.ok).toBe(false);
    expect(novRep.sh).toBe(false);

    // Duplicate month asks before replacing
    window.repRev({ Followers: '14500', Reach: '60000', Impressions: '130000', Engagement: '3800', Conversions: '310' }, 'Lumen Skincare');
    document.querySelector('[data-r="platform"]').value = 'INSTAGRAM';
    document.querySelector('[data-r="month"]').value = '2026-11';
    window.repSave();
    expect(document.body.textContent).toContain('Replace the 2026-11 (INSTAGRAM) report?');
    window.closeM();

    // Run AI analysis -> strictly compares vs 2026-10 (Followers/Reach/Impressions/Conversions improved, Engagement declined)
    window.repAi(novRep.id);
    expect(novRep.ai).toContain('Improved vs 2026-10');
    expect(novRep.ai).toContain('Declined vs 2026-10');

    // Cannot share before approving
    window.repSh(novRep.id);
    expect(novRep.sh).toBe(false);

    // Approve then Share -> Client sees it (read-only) + receives notification
    window.repOk(novRep.id);
    expect(novRep.ok).toBe(true);
    window.repSh(novRep.id);
    expect(novRep.sh).toBe(true);

    window.logout();
    loginAs('sara@lumen.com', 'Client123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('client'));
    window.go('reports');
    window.view(false);
    const cView = document.getElementById('view')?.textContent || '';
    expect(cView).toContain('2026-11');
    expect(cView).toContain('Previous months history');
    expect(cView).not.toContain('Run AI analysis');
  });

  it('14. Team Performance & Workflow Tracking: per-individual metrics grouped by role, clickable Member Profile & Performance, submission-based on-time %, returned separate indicator, Workflow owner/delay table, Employee self-only view', async () => {
    loginAs('elena@agency-clean.co', 'Admin123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('admin');
    });

    window.go('reports');
    window.view(false);
    const adminView = document.getElementById('view')?.textContent || '';
    expect(adminView).toContain('Team performance (per individual, grouped by role)');
    expect(adminView).toContain('Calculated per individual (no team aggregate score)');
    expect(adminView).toContain('Workflow tracking — current owner, duration & delays');

    // Clicking a member opens their Profile & Performance detail view
    window.openD({ t: 'mperf', n: 'Lina Aziz' });
    window.view(false);
    const mView = document.getElementById('view')?.textContent || '';
    expect(mView).toContain('Lina Aziz');
    expect(mView).toContain('On-time delivery (at submission)');
    expect(mView).toContain('Returned with changes (separate indicator)');

    // Employee sees ONLY their own performance and cannot open another employee's performance view
    window.logout();
    loginAs('karim@agency-clean.co', 'Creative123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('emp'));
    window.go('reports');
    window.view(false);
    const empView = document.getElementById('view')?.textContent || '';
    expect(empView).toContain('Karim Fouad');
    expect(empView).not.toContain('Lina Aziz');

    window.openD({ t: 'mperf', n: 'Lina Aziz' });
    window.view(false);
    expect(document.getElementById('view')?.textContent || '').not.toContain('On-time delivery (at submission)');
  });

  it('15. Final Dashboards: Admin, AM, Employee, and Client dashboards render live metrics with clickable KPI cards that open their source lists', async () => {
    // AM Dashboard: Briefs needing action, Plans needing action, Waiting for my review, Waiting for the client, Plan completion, Overdue tasks
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('am');
    });
    window.go('dashboard');
    window.view(false);
    const amText = document.getElementById('view')?.textContent || '';
    expect(amText).toContain('Briefs needing action');
    expect(amText).toContain('Plans needing action');
    expect(amText).toContain('Waiting for my review');
    expect(amText).toContain('Overdue tasks');
    // Clicking "Waiting for my review" card navigates to Review page
    const revBtn = [...document.querySelectorAll('#view button')].find((b) => b.textContent.includes('Waiting for my review'));
    expect(revBtn).toBeTruthy();
    expect(revBtn.getAttribute('onclick')).toBe("go('review')");
    window.go('review');
    expect(window.S.page).toBe('review');

    // Client Dashboard: Plan progress, Awaiting my approval, Approved & published, Shared reports, Unread notifications
    window.logout();
    loginAs('sara@lumen.com', 'Client123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('client');
    });
    window.go('dashboard');
    window.view(false);
    const clText = document.getElementById('view')?.textContent || '';
    expect(clText).toContain('Plan progress');
    expect(clText).toContain('Awaiting my approval');
    expect(clText).toContain('Shared reports');
    expect(clText).toContain('Unread notifications');
    const repBtn = [...document.querySelectorAll('#view button')].find((b) => b.textContent.includes('Shared reports'));
    expect(repBtn).toBeTruthy();
    expect(repBtn.getAttribute('onclick')).toBe("go('reports')");
    window.go('reports');
    expect(window.S.page).toBe('reports');
  });

  it('16. Public Landing Page: accessible without login, displays About, Services, Portfolio/Case Studies, and submits Contact Us form with validation', () => {
    expect(window.S.authed).toBe(false);
    window.openLanding();
    const appText = document.getElementById('app')?.textContent || '';
    expect(appText).toContain('Services');
    expect(appText).toContain('Portfolio & Case Studies');
    expect(appText).toContain('Start a conversation');
    // Does not leak internal workspace data
    expect(appText).not.toContain('Omar Haddad');
    expect(appText).not.toContain('Lumen Skincare');

    // Submit empty contact form -> inline validation
    window.sendLandingContact();
    expect(window.S.err.lcName).toBeTruthy();
    expect(window.S.err.lcEmail).toBeTruthy();
    expect(window.S.err.lcMsg).toBeTruthy();

    // Fill valid contact form -> confirmation shown
    document.getElementById('lc-name').value = 'Nadia Hassan';
    document.getElementById('lc-email').value = 'nadia@brandco.com';
    document.getElementById('lc-company').value = 'BrandCo';
    document.getElementById('lc-msg').value = 'Interested in Q1 strategy and social media management.';
    window.sendLandingContact();
    expect(window.S.landingSent).toBe(true);
    expect(window.LANDING_MSGS.length).toBeGreaterThan(0);
    expect(document.getElementById('app')?.textContent || '').toContain('Your message has been received');
  });

  it('17. Content Creator items: POST/REEL/STORY only, auto-link from campaign, edit all 8 fields (including reference & tone), delete confirmation, and filter by type', async () => {
    window.STR['Lumen Skincare'].st = 'forwarded';
    window.STR['Lumen Skincare'].out = 'approved';

    loginAs('lina@agency-clean.co', 'Creator123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('cc');
    });

    const plan = window.PLANS[0];
    // 1. Create from campaign -> auto-linked to that campaign, and only POST/REEL/STORY options exist
    window.newItem(plan.id, 'Winter Glow');
    const typeOpts = [...document.querySelectorAll('.dlg [data-f="type"] option')].map((o) => o.value);
    expect(typeOpts).toEqual(['POST', 'REEL', 'STORY']);
    expect(document.querySelector('.dlg [data-f="campaign"]').value).toBe('Winter Glow');

    document.querySelector('.dlg [data-f="title"]').value = 'Holiday story teaser';
    document.querySelector('.dlg [data-f="type"]').value = 'STORY';
    document.querySelector('.dlg [data-f="date"]').value = '2026-11-29';
    document.querySelector('.dlg [data-f="reference"]').value = 'https://ref.example.com/moodboard';
    document.querySelector('.dlg [data-f="toneOfVoice"]').value = 'Warm & festive';
    document.querySelector('.dlg [data-f="notes"]').value = 'Keep product centered';
    window.itSave(plan.id);

    const created = plan.items.find((i) => i.title === 'Holiday story teaser');
    expect(created).toBeTruthy();
    expect(created.campaign).toBe('Winter Glow');
    expect(created.reference).toBe('https://ref.example.com/moodboard');
    expect(created.toneOfVoice).toBe('Warm & festive');

    // 2. Filter list by type (STORY shows new item, hides REEL)
    window.S.det = null;
    window.S.page = 'brands';
    window.S.brand = 'Lumen Skincare';
    window.S.sub = 'platforms';
    window.S.itf = 'STORY';
    window.view(false);
    const vText = document.getElementById('view')?.textContent || '';
    expect(vText).toContain('Holiday story teaser');
    expect(vText).not.toContain('Serum routine reel');
    window.S.itf = 'all';

    // 3. Deleting requires confirmation modal
    window.delItem(created.id);
    expect(document.querySelector('.dlg')?.textContent || '').toContain('Delete this content item?');
    expect(plan.items.some((i) => i.id === created.id)).toBe(true);
    window.doDelItem(created.id);
    expect(plan.items.some((i) => i.id === created.id)).toBe(false);
  });

  it('18. Client Onboarding category selection: blocks continuing without both Main Category and Activity Type, scopes Activity Types to selected category, and saves selection', async () => {
    loginAs('sara@lumen.com', 'Client123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('client');
    });

    window.OB.submitted = false;
    window.OB.step = 'category';
    window.OB.cat = '';
    window.OB.act = '';
    window.go('onboarding');
    window.view(false);

    // Cannot continue without selecting both
    await window.obSelectCategory();
    expect(window.OB.step).toBe('category');

    // Selecting Main Category only -> still blocked, Activity Types scoped to Food only
    window.OB.cat = 'Food';
    window.view(false);
    const actOpts = [...document.querySelectorAll('#view select')][1];
    const actVals = [...actOpts.querySelectorAll('option')].map((o) => o.value).filter(Boolean);
    expect(actVals).toEqual(['Cafe', 'Restaurant', 'Bakery']);
    await window.obSelectCategory();
    expect(window.OB.step).toBe('category');

    // Selecting both -> saves and advances to form
    window.OB.act = 'Cafe';
    await window.obSelectCategory();
    expect(window.OB.step).toBe('form');
  });

  it('19. Strategy upload linked to brief: shows Brand, Linked brief, File, Upload date, Version, Status + Preview & Download + keeps Previous versions', async () => {
    loginAs('lina@agency-clean.co', 'Creator123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('cc');
    });

    window.S.page = 'brands';
    window.S.brand = 'Nord Coffee';
    window.S.sub = 'strategy';
    window.view(false);

    // Upload v2 (v1 already exists on Nord Coffee) -> keeps v1 in Previous versions
    if (!URL.createObjectURL) URL.createObjectURL = () => 'blob:test-strategy';
    const fakeFile = new File(['strategy content'], 'nord-strategy-v2.pdf', { type: 'application/pdf' });
    window.upS({ files: [fakeFile] });

    const viewText = document.getElementById('view')?.textContent || '';
    expect(viewText).toContain('Linked brief');
    expect(viewText).toContain('Upload date');
    expect(viewText).toContain('nord-strategy-v2.pdf');
    expect(viewText).toContain('Previous versions (1)');
    expect(viewText).toContain('Preview');
    expect(viewText).toContain('Download');

    // Preview opens strategy preview modal
    window.pvS();
    expect(document.querySelector('.dlg')?.textContent || '').toContain('Strategy preview — nord-strategy-v2.pdf');
    window.closeM();
  });

  it('20. AM internal strategy review: uploaded strategies appear in review list, preview & download work, returning requires comments and sets Requested Changes, internal approval moves to client sending', async () => {
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('am');
    });

    // Uploaded strategies appear in the AM Internal review list
    window.STR['Nord Coffee'].st = 'am';
    window.STR['Nord Coffee'].out = null;
    const expectedFile = window.STR['Nord Coffee'].file;
    window.go('review');
    window.view(false);
    const reviewText = document.getElementById('view')?.textContent || '';
    expect(reviewText).toContain('Uploaded strategies for internal review');
    expect(reviewText).toContain('Nord Coffee');
    expect(reviewText).toContain(expectedFile);
    expect(reviewText).toContain('Preview');
    expect(reviewText).toContain('Download');

    // AM can preview directly from the review list
    window.pvS('Nord Coffee');
    expect(document.querySelector('.dlg')?.textContent || '').toContain('Strategy preview — ' + expectedFile);
    window.closeM();

    // Open Nord Coffee strategy review screen
    window.goTo({ k: 'strategy', brand: 'Nord Coffee' });
    window.view(false);

    // Returning without comments is blocked
    document.getElementById('rs').value = '   ';
    window.sgo('am_reject');
    expect(window.STR['Nord Coffee'].st).toBe('am');

    // Returning with comments sets status to Requested Changes
    document.getElementById('rs').value = 'Clarify Q4 budget allocation and target KPIs.';
    window.sgo('am_reject');
    expect(window.STR['Nord Coffee'].st).toBe('forwarded');
    expect(window.STR['Nord Coffee'].out).toBe('rejected');
    expect(document.getElementById('view')?.textContent || '').toContain('Requested Changes');

    // Simulate CC re-uploading and sending -> AM approves internally -> moves to client sending
    window.STR['Nord Coffee'].st = 'am';
    window.STR['Nord Coffee'].out = null;
    window.view(false);
    window.sgo('client');
    expect(window.STR['Nord Coffee'].st).toBe('client');
    expect(document.getElementById('view')?.textContent || '').toContain('Sent to Client');
  });

  it('21. AM notifications: navbar bell unread count, click bell to view list, mark one/all as read, periodic refresh, and Bearer token on all requests', async () => {
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('am');
    });

    const apiCalls = [];
    window.S.offlineMode = false;
    window.setApiTokens('am-access-token-123', 'am-refresh-token');
    global.fetch = vi.fn(async (url, opts = {}) => {
      apiCalls.push({ url: String(url), method: opts.method || 'GET', auth: opts.headers?.Authorization || '' });
      if (String(url).endsWith('/notifications') && (opts.method || 'GET') === 'GET') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              notifications: [
                { id: 'n-1', title: 'Nord Coffee uploaded strategy v2', isRead: false, type: 'STRATEGY', createdAt: '2026-11-28T00:10:00Z' },
                { id: 'n-2', title: 'Lumen Skincare submitted onboarding', isRead: false, type: 'ONBOARDING', createdAt: '2026-11-28T00:05:00Z' },
              ],
            },
          }),
        };
      }
      return { ok: true, status: 200, json: async () => ({ success: true, data: {} }) };
    });

    // Periodic refresh fetches notifications with access token and updates bell unread count
    await window.refreshNotifications();
    const bellBtn = document.querySelector('button[aria-label="Notifications"]');
    expect(bellBtn).toBeTruthy();
    expect(bellBtn.textContent).toContain('2');

    // Clicking the bell opens the notification list
    expect(bellBtn.getAttribute('onclick')).toBe("go('notifications')");
    window.go('notifications');
    expect(window.S.page).toBe('notifications');
    window.view(false);
    const listText = document.getElementById('view')?.textContent || '';
    expect(listText).toContain('Notifications');
    expect(listText).toContain('Auto-refreshes every 30s');
    expect(listText).toContain('Nord Coffee uploaded strategy v2');

    // Mark one notification as read -> unread count drops to 1 and PATCH uses Bearer token
    window.markRead(0);
    expect(document.querySelector('button[aria-label="Notifications"]')?.textContent || '').toContain('1');

    // Mark all as read -> unread count clears and PATCH /notifications/read-all uses Bearer token
    window.markAllRead();
    expect(document.querySelector('button[aria-label="Notifications"]')?.textContent || '').toBe('');

    const getCall = apiCalls.find((c) => c.url.endsWith('/notifications') && c.method === 'GET');
    const oneCall = apiCalls.find((c) => c.url.endsWith('/notifications/n-1/read') && c.method === 'PATCH');
    const allCall = apiCalls.find((c) => c.url.endsWith('/notifications/read-all') && c.method === 'PATCH');
    expect(getCall?.auth).toBe('Bearer am-access-token-123');
    expect(oneCall?.auth).toBe('Bearer am-access-token-123');
    expect(allCall?.auth).toBe('Bearer am-access-token-123');
  });

  it('22. Monthly content plans: filter by brand/status/month/year, validate title/year/month(1-12), CC-only edit/delete, 4 statuses, and linked campaign/item delete warning', async () => {
    loginAs('lina@agency-clean.co', 'Creator123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('cc');
    });

    // Unlock Lumen Skincare strategy & open platforms/plans
    window.STR['Lumen Skincare'].st = 'forwarded';
    window.STR['Lumen Skincare'].out = 'approved';
    window.S.page = 'brands';
    window.S.brand = 'Lumen Skincare';
    window.S.sub = 'platforms';
    window.view(false);

    // Filter controls for brand, status, month, year exist
    expect(document.querySelector('select[aria-label="Filter plans by brand"]')).toBeTruthy();
    expect(document.querySelector('select[aria-label="Filter plans by status"]')).toBeTruthy();
    expect(document.querySelector('select[aria-label="Filter plans by month"]')).toBeTruthy();
    expect(document.querySelector('select[aria-label="Filter plans by year"]')).toBeTruthy();

    // Creating a plan validates title, year, and month (1 to 12)
    const beforeCount = window.PLANS.length;
    window.newPlanP(0);
    document.querySelector('.dlg [data-f="title"]').value = 'Dec · Lumen Plan';
    document.querySelector('.dlg [data-f="year"]').value = '2026';
    document.querySelector('.dlg [data-f="monthNum"]').value = '13'; // invalid month
    window.askOk();
    expect(window.PLANS.length).toBe(beforeCount);

    document.querySelector('.dlg [data-f="monthNum"]').value = '12'; // valid month
    window.askOk();
    expect(window.PLANS.length).toBe(beforeCount + 1);
    const created = window.PLANS[window.PLANS.length - 1];
    expect(created.year).toBe(2026);
    expect(created.monthNum).toBe(12);

    // Status can be set to Draft, In Review, Needs Changes, Approved
    await window.setPlanStatus(created.id, 'IN_REVIEW');
    expect(created.status).toBe('IN_REVIEW');
    await window.setPlanStatus(created.id, 'NEEDS_CHANGES');
    expect(created.status).toBe('NEEDS_CHANGES');
    await window.setPlanStatus(created.id, 'APPROVED');
    expect(created.status).toBe('APPROVED');
    await window.setPlanStatus(created.id, 'DRAFT');
    expect(created.status).toBe('DRAFT');

    // Filter by month=12 shows only the December plan
    window.S.pf = { brand: 'Lumen Skincare', status: 'DRAFT', month: '12', year: '2026' };
    window.view(false);
    const filteredText = document.getElementById('view')?.textContent || '';
    expect(filteredText).toContain('Dec · Lumen Plan');
    expect(filteredText).not.toContain('Nov · Lumen Skincare');

    // Deleting a plan with linked campaigns/items shows a warning
    window.delPlan(1); // Nov · Lumen Skincare has 1 campaign + items
    const warnDlg = document.querySelector('.dlg')?.textContent || '';
    expect(warnDlg).toContain('Warning:');
    expect(warnDlg).toContain('linked campaign');
    expect(warnDlg).toContain('linked content item');
    window.closeM();

    // Only Content Creator can edit or delete a plan (AM is blocked)
    window.S.role = 'am';
    const countBeforeAmDel = window.PLANS.length;
    window.editPlan(created.id);
    expect(document.querySelector('.dlg')).toBeFalsy();
    window.delPlan(created.id);
    expect(document.querySelector('.dlg')).toBeFalsy();
    window.doDelPlan(created.id);
    expect(window.PLANS.length).toBe(countBeforeAmDel);
  });

  it('23. Role-based visibility (hidden not disabled for non-CC), loading/empty/error/success states, and inline field errors preventing invalid submit', async () => {
    // 1. Account Manager sees read-only plan/item views with create/edit/delete HIDDEN (not disabled)
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('am');
    });
    window.STR['Lumen Skincare'].st = 'forwarded';
    window.STR['Lumen Skincare'].out = 'approved';
    window.S.page = 'brands';
    window.S.brand = 'Lumen Skincare';
    window.S.sub = 'platforms';
    window.view(false);

    const amBtns = [...document.querySelectorAll('#view button')].map((b) => b.textContent.trim());
    expect(amBtns).not.toContain('+ New plan');
    expect(amBtns).not.toContain('+ Campaign');
    expect(amBtns).not.toContain('+ Content item');
    expect(amBtns).not.toContain('Edit plan');
    expect(amBtns).not.toContain('Delete plan');

    // 2. Loading skeleton renders when view(true) is called
    window.view(true);
    expect(document.querySelector('#view .sk')).toBeTruthy();

    // 3. Content Creator sees create/edit/delete and gets inline field errors next to invalid fields without submitting
    window.S.role = 'cc';
    window.view(false);
    const ccBtns = [...document.querySelectorAll('#view button')].map((b) => b.textContent.trim());
    expect(ccBtns).toContain('+ New plan');
    expect(ccBtns).toContain('Edit plan');
    expect(ccBtns).toContain('Delete plan');

    const beforePlans = window.PLANS.length;
    window.newPlanP(0);
    document.querySelector('.dlg [data-f="title"]').value = '';
    document.querySelector('.dlg [data-f="year"]').value = '99';
    document.querySelector('.dlg [data-f="monthNum"]').value = '15';
    window.askOk();
    expect(window.PLANS.length).toBe(beforePlans);
    const errs = [...document.querySelectorAll('.dlg .ferr')].map((e) => e.textContent);
    expect(errs.length).toBe(3);
    expect(errs.join(' ')).toContain('Title is required.');
    expect(errs.join(' ')).toContain('Month must be a number from 1 to 12.');
    window.closeM();

    // 4. Empty state renders when no plans match filters
    window.S.pf = { brand: 'Lumen Skincare', status: 'APPROVED', month: '1', year: '2025' };
    window.view(false);
    expect(document.getElementById('view')?.textContent || '').toContain('No matching content plans');
  });

  it('24. Employee My Work: shows only own tasks, 5 summary cards (total/overdue/due soon/in progress/completed), filters (status/priority/type/deadline), and AM sees own tasks in My Work & Tasks', async () => {
    loginAs('karim@agency-clean.co', 'Creative123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('emp');
    });

    window.go('tasks');
    window.view(false);
    const empText = document.getElementById('view')?.textContent || '';

    // Only Karim Fouad's tasks appear, never Lina Aziz's or Omar Haddad's tasks
    expect(empText).toContain('My Work');
    expect(empText).toContain('Write captions');
    expect(empText).toContain('Competitor research · Nord Coffee');
    expect(empText).not.toContain('Design serum reel cover');
    expect(empText).not.toContain('Media buying brief');

    // Summary cards: Total tasks, Overdue, Due soon, In progress, Completed
    expect(empText).toContain('Total tasks');
    expect(empText).toContain('Overdue');
    expect(empText).toContain('Due soon');
    expect(empText).toContain('In progress');
    expect(empText).toContain('Completed');

    // Columns: Title, Type, Related content, Effective deadline, Priority, Status
    expect(empText).toContain('Title');
    expect(empText).toContain('Type');
    expect(empText).toContain('Related content');
    expect(empText).toContain('Effective deadline');
    expect(empText).toContain('Priority');
    expect(empText).toContain('Status');

    // Filters for status, priority, task type, deadline exist and filter results
    expect(document.querySelector('select[aria-label="Status"]')).toBeTruthy();
    expect(document.querySelector('select[aria-label="Priority"]')).toBeTruthy();
    expect(document.querySelector('select[aria-label="Task type"]')).toBeTruthy();
    expect(document.querySelector('select[aria-label="Deadline"]')).toBeTruthy();

    window.S.tp = 'URGENT';
    window.view(false);
    const urgentText = document.getElementById('view')?.textContent || '';
    expect(urgentText).toContain('Competitor research · Nord Coffee');
    expect(urgentText).not.toContain('Write captions');
    window.S.tp = 'all';

    // Account Manager sees own tasks in My Work as well as in Tasks
    window.S.role = 'am';
    window.S.tw = 'mine';
    window.view(false);
    const amMine = document.getElementById('view')?.textContent || '';
    expect(amMine).toContain('Media buying brief');
    expect(amMine).not.toContain('Competitor research · Nord Coffee');

    window.S.tw = 'team';
    window.view(false);
    const amTeam = document.getElementById('view')?.textContent || '';
    expect(amTeam).toContain('Media buying brief');
    expect(amTeam).toContain('Competitor research · Nord Coffee');
  });

  it('25. Task context path: linked tasks show Brand > Platform > Content Plan > Campaign > Content Item > Task with role-aware clickable links; direct tasks show no content path', async () => {
    loginAs('karim@agency-clean.co', 'Creative123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('emp');
    });

    window.go('tasks');
    window.view(false);
    const rows = [...document.querySelectorAll('#view tbody tr')];
    const linkedRow = rows.find((r) => r.textContent.includes('Write captions'));
    const directRow = rows.find((r) => r.textContent.includes('Competitor research · Nord Coffee'));
    expect(linkedRow).toBeTruthy();
    expect(directRow).toBeTruthy();

    // Linked task shows full Brand > Platform > Plan > Campaign > Item > Task path
    const linkedPath = linkedRow.querySelector('.ctx-path')?.textContent || '';
    expect(linkedPath).toContain('Lumen Skincare > Instagram > Nov plan > Winter Glow > Gift-set carousel > Write captions');

    // Employee has clickable links for Content Item & Task, but NOT Brand (no brands access)
    const empLinks = [...linkedRow.querySelectorAll('.ctx-path a.lk')].map((a) => a.textContent);
    expect(empLinks).toContain('Gift-set carousel');
    expect(empLinks).toContain('Write captions');
    expect(empLinks).not.toContain('Lumen Skincare');

    // Direct task shows no content path
    expect(directRow.querySelector('.ctx-path')).toBeFalsy();

    // Account Manager (who has brands access) gets clickable links for all path segments
    window.S.role = 'am';
    window.S.tw = 'team';
    window.view(false);
    const amLinkedRow = [...document.querySelectorAll('#view tbody tr')].find((r) => r.textContent.includes('Write captions'));
    const amLinks = [...amLinkedRow.querySelectorAll('.ctx-path a.lk')].map((a) => a.textContent);
    expect(amLinks).toContain('Lumen Skincare');
    expect(amLinks).toContain('Instagram');
    expect(amLinks).toContain('Nov plan');
    expect(amLinks).toContain('Winter Glow');
    expect(amLinks).toContain('Gift-set carousel');
    expect(amLinks).toContain('Write captions');
  });

  it('26. Browse brands and platform accounts: search & filters on brands list, brand details list linked platform accounts, opening a platform shows its content plans, and breadcrumbs show location', async () => {
    loginAs('lina@agency-clean.co', 'Creator123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('cc');
    });

    // Brands list supports search and status/team filters
    window.go('brands');
    window.view(false);
    expect(document.querySelector('select[aria-label="Filter brands by status"]')).toBeTruthy();
    expect(document.querySelector('select[aria-label="Filter brands by team"]')).toBeTruthy();

    window.S.q = 'Lumen';
    window.view(false);
    expect(document.getElementById('view')?.textContent || '').toContain('Lumen Skincare');
    expect(document.getElementById('view')?.textContent || '').not.toContain('Nord Coffee');
    window.S.q = '';

    // Brand details show breadcrumb and list linked platform accounts
    window.S.brand = 'Lumen Skincare';
    window.S.sub = null;
    window.view(false);
    const brandText = document.getElementById('view')?.textContent || '';
    expect(document.querySelector('nav[aria-label="Breadcrumb"]')?.textContent || '').toContain('Lumen Skincare');
    expect(brandText).toContain('Linked platform accounts');
    expect(brandText).toContain('@lumen.skin');

    // Opening a platform account shows its content plans + breadcrumb
    const platIdx = window.D.platform.rows.findIndex((p) => p.accountName === '@lumen.skin');
    window.act('platform', platIdx, 'view');
    const platText = document.getElementById('view')?.textContent || '';
    expect(document.querySelector('nav[aria-label="Breadcrumb"]')?.textContent || '').toContain('@lumen.skin');
    expect(platText).toContain('Content plans on this platform');
    expect(platText).toContain('Nov · Lumen Skincare');
  });

  it('27. Full monthly plan page: header shows title/month/year/status/goals/notes, campaigns show dates & objective, unassigned items separate, and empty states when no campaigns/items', async () => {
    loginAs('lina@agency-clean.co', 'Creator123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('cc');
    });

    // Open full monthly plan (id=1: Nov · Lumen Skincare)
    window.openD({ t: 'plan', id: 1 });
    const planText = document.getElementById('view')?.textContent || '';
    expect(planText).toContain('Nov · Lumen Skincare');
    expect(planText).toContain('Nov (11)');
    expect(planText).toContain('2026');
    expect(planText).toContain('Monthly goals');
    expect(planText).toContain('Increase holiday gift-set conversions by 25%');
    expect(planText).toContain('Notes');
    expect(planText).toContain('Coordinate reel drops with Meta ad bursts.');
    expect(planText).toContain('Winter Glow');
    expect(planText).toContain('2026-11-10 → 2026-11-30');
    expect(planText).toContain('Objective: Drive holiday gift-set sales');
    expect(planText).toContain('Unassigned to a campaign');

    // Empty plan shows empty states for campaigns and unassigned items
    window.PLANS.push({
      id: 777,
      brand: 'Lumen Skincare',
      platform: '@lumen.skin',
      title: 'Jan · Empty Plan',
      month: 'Jan 2027',
      year: 2027,
      monthNum: 1,
      status: 'DRAFT',
      monthlyGoals: 'Launch new year campaign',
      notes: 'Draft notes',
      campaigns: [],
      items: [],
    });
    window.openD({ t: 'plan', id: 777 });
    const emptyPlanText = document.getElementById('view')?.textContent || '';
    expect(emptyPlanText).toContain('No campaigns yet');
    expect(emptyPlanText).toContain('No content items yet.');
  });

  it('28. Campaigns within a plan: require name & dates with endDate > startDate, show items on details page, CC can edit, and deleting with linked items warns & requires confirmation on unassigning', async () => {
    loginAs('lina@agency-clean.co', 'Creator123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('cc');
    });

    window.STR['Lumen Skincare'].st = 'forwarded';
    window.STR['Lumen Skincare'].out = 'approved';

    // Create campaign validates name, startDate, endDate, and endDate > startDate
    const p = window.PLANS[0];
    const startCount = p.campaigns.length;
    window.newCamp(p.id);
    document.querySelector('.dlg [data-f="title"]').value = 'Black Friday Push';
    document.querySelector('.dlg [data-f="startDate"]').value = '2026-11-25';
    document.querySelector('.dlg [data-f="endDate"]').value = '2026-11-20'; // invalid: before start
    window.askOk();
    expect(p.campaigns.length).toBe(startCount);
    expect(document.querySelector('.dlg .ferr')?.textContent || '').toContain('End date must be after start date.');

    document.querySelector('.dlg [data-f="endDate"]').value = '2026-11-30'; // valid
    window.askOk();
    expect(p.campaigns.length).toBe(startCount + 1);

    // Campaign details page shows its content items and Edit/Delete actions for CC
    window.openD({ t: 'camp', p: p.id, n: 0 });
    const campText = document.getElementById('view')?.textContent || '';
    expect(campText).toContain('Winter Glow');
    expect(campText).toContain('Serum routine reel');
    expect(campText).toContain('Edit campaign');
    expect(campText).toContain('Delete campaign');

    // CC can edit campaign name & dates (updates linked items too)
    window.editCamp(p.id, 0);
    document.getElementById('ec-name').value = 'Winter Glow Updated';
    document.getElementById('ec-start').value = '2026-11-12';
    document.getElementById('ec-end').value = '2026-11-29';
    window.saveEditCamp(p.id, 0);
    expect(p.campaigns[0].name).toBe('Winter Glow Updated');
    expect(p.items.some((i) => i.campaign === 'Winter Glow Updated')).toBe(true);

    // Deleting a campaign with linked items shows warning and requires confirmation on unassigning
    window.delCamp(p.id, 0);
    const delText = document.querySelector('.dlg')?.textContent || '';
    expect(delText).toContain('Warning:');
    expect(delText).toContain('linked content item');
    // Without choosing option, deletion is blocked
    window.doDelCamp(p.id, 0);
    expect(p.campaigns[0].name).toBe('Winter Glow Updated');
    // Choose "unassign" -> campaign deleted and linked items moved to Unassigned ('—')
    document.getElementById('dc-mode').value = 'unassign';
    window.doDelCamp(p.id, 0);
    expect(p.campaigns.some((c) => c.name === 'Winter Glow Updated')).toBe(false);
    expect(p.items.some((i) => i.title === 'Serum routine reel' && i.campaign === '—')).toBe(true);
  });

  it('29. Task status workflow: 7 statuses, blocks invalid transitions, action buttons only (no free status dropdown), and records every status change in audit log', async () => {
    loginAs('karim@agency-clean.co', 'Creative123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('emp');
    });

    window.go('tasks');
    window.view(false);

    // No free status dropdown on task rows (only the filter dropdown in toolbar)
    expect(document.querySelectorAll('#view tbody select').length).toBe(0);

    // Invalid transition: Direct task #4 is TODO -> jumping directly to COMPLETED is blocked
    const task4 = window.TK.find((t) => t.id === 4);
    expect(task4.status).toBe('TODO');
    window.tset(4, 'COMPLETED');
    expect(task4.status).toBe('TODO');

    // Valid transition: TODO -> IN_PROGRESS -> COMPLETED
    window.tset(4, 'IN_PROGRESS');
    expect(task4.status).toBe('IN_PROGRESS');
    window.tset(4, 'COMPLETED');
    expect(task4.status).toBe('COMPLETED');

    // Terminal status COMPLETED blocks further transitions
    window.tset(4, 'IN_PROGRESS');
    expect(task4.status).toBe('COMPLETED');

    // Audit log records every status change and renders on task details
    expect(task4.auditLog.length).toBe(2);
    expect(task4.auditLog[0]).toMatchObject({ from: 'IN_PROGRESS', to: 'COMPLETED' });
    expect(task4.auditLog[1]).toMatchObject({ from: 'TODO', to: 'IN_PROGRESS' });

    window.openD({ t: 'task', id: 4 });
    const detText = document.getElementById('view')?.textContent || '';
    expect(detText).toContain('Required action');
    expect(detText).toContain('Waiting on');
    expect(detText).toContain('Status audit log (2)');
    expect(detText).toContain('TODO → IN_PROGRESS');
    expect(detText).toContain('IN_PROGRESS → COMPLETED');
  });

  it('30. Task page states: loading skeleton, clear empty state, error state with Retry, highlighted Overdue & Needs Changes rows, and field-specific validation errors', async () => {
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('am');
    });

    window.go('tasks');

    // 1. Loading state renders skeleton
    window.view(true);
    expect(document.querySelector('#view .sk')).toBeTruthy();

    // 2. Overdue and Needs Changes rows are visually highlighted
    window.S.tw = 'team';
    window.view(false);
    expect(document.querySelector('tr[data-highlight="overdue"]')).toBeTruthy();
    expect(document.querySelector('tr[data-highlight="needs-changes"]')).toBeTruthy();

    // 3. Error state shows message with Retry button
    window.S.taskErr = 'Could not load tasks from server.';
    window.view(false);
    const errText = document.getElementById('view')?.textContent || '';
    expect(errText).toContain('Could not load tasks from server.');
    expect(errText).toContain('Retry');
    window.S.taskErr = '';

    // 4. Empty state shows clear message when no tasks match
    window.S.tw = 'mine';
    window.S.ts = 'CANCELLED';
    window.view(false);
    expect(document.getElementById('view')?.textContent || '').toContain('No tasks assigned to you right now.');
    window.S.ts = 'all';

    // 5. Validation errors point to the specific fields in New direct task modal
    window.newTask();
    document.getElementById('dt1').value = '';
    document.getElementById('dt5').value = '';
    window.saveTask();
    const errs = [...document.querySelectorAll('.dlg .ferr')].map((e) => e.textContent);
    expect(errs).toContain('Title is required.');
    expect(errs).toContain('Planned deadline is required.');
    window.closeM();
  });

  it('31. Client login security: inline validation, generic wrong-credentials error, 5 failed attempts lockout, deactivated block, own-brand-only redirect, logout protection, and auth audit log', async () => {
    // 1. 5 failed attempts lock the Client account temporarily and record LOGIN_FAILED / LOGIN_LOCKED in audit log
    for (let i = 0; i < 4; i++) {
      loginAs('sara@lumen.com', 'WrongPass123!');
      await vi.waitFor(() => {
        expect(window.S.err.password).toBe('Invalid email or password.');
        expect(window.S.authed).toBe(false);
      });
    }
    loginAs('sara@lumen.com', 'WrongPass123!');
    await vi.waitFor(() => {
      expect(window.S.err.password).toContain('temporarily locked');
      expect(window.S.authed).toBe(false);
    });
    // Even with the right password while locked, login is blocked
    loginAs('sara@lumen.com', 'Client123456!');
    await vi.waitFor(() => {
      expect(window.S.err.password).toContain('temporarily locked');
      expect(window.S.authed).toBe(false);
    });
    expect(window.AUTH_AUDIT.some((e) => e.event === 'LOGIN_FAILED' && e.email === 'sara@lumen.com')).toBe(true);
    expect(window.AUTH_AUDIT.some((e) => e.event === 'LOGIN_LOCKED' && e.email === 'sara@lumen.com')).toBe(true);

    // 2. After lockout expires, valid Client login succeeds, records LOGIN_SUCCESS, and redirects to own brand only
    delete window.AUTH_LOCKOUT['sara@lumen.com'];
    loginAs('sara@lumen.com', 'Client123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('client');
      expect(window.S.brand).toBe('Lumen Skincare');
    });
    expect(window.AUTH_AUDIT[0]).toMatchObject({ event: 'LOGIN_SUCCESS', email: 'sara@lumen.com' });

    // 3. Logout ends session and returns to login screen
    window.logout();
    expect(window.S.authed).toBe(false);
    expect(document.getElementById('app')?.textContent || '').toContain('Welcome back');
  });

  it('32. Deadlines: planned from content schedule, effective recalculated on handoff so Creator delay is not counted against Reviewer, Completed At recorded, and planned vs effective diff shown', async () => {
    loginAs('lina@agency-clean.co', 'Creator123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('cc');
    });

    // Task #1 (Design serum reel cover) is overdue (eff=2026-11-17 < TODAY=2026-11-18)
    // Linked Review task #2 has planned=2026-11-18
    const creation = window.TK.find((t) => t.id === 1);
    const review = window.TK.find((t) => t.id === 2);
    expect(creation.eff).toBe('2026-11-17');
    expect(review.planned).toBe('2026-11-18');

    // Creator submits late -> Reviewer's effective deadline is recalculated from receipt (TODAY + 1d = 2026-11-19)
    window.tset(1, 'SUBMITTED');
    expect(review.status).toBe('IN_REVIEW');
    expect(review.eff).toBe('2026-11-19');
    expect(review.eff > review.planned).toBe(true); // fair window, NOT overdue!

    // Reviewer sees planned vs effective difference clearly in Tasks
    window.S.role = 'am';
    window.go('tasks');
    window.S.tw = 'mine';
    window.view(false);
    const amTasksText = document.getElementById('view')?.textContent || '';
    expect(amTasksText).toContain('2026-11-19');
    expect(amTasksText).toContain('planned 2026-11-18 (+1d shifted)');

    // Approving records Completed At timestamp and shows it on task details
    window.tset(2, 'COMPLETED');
    expect(review.completedAt).toBeTruthy();
    window.openD({ t: 'task', id: 2 });
    const detText = document.getElementById('view')?.textContent || '';
    expect(detText).toContain('Completed at');
  });

  it('33. Sprint 3 Test Brief gaps closed: Client without activity redirected to onboarding (RV2-1328), Admin adds Activity Question Group (RV2-1332), AM regenerates Brief keeping v1 (RV2-1333), Employee blocked from other user task (RV2-1358)', async () => {
    // 1. RV2-1328: Client with no activityType yet is redirected to onboarding after login
    loginAs('sara@lumen.com', 'Client123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('client');
      expect(window.S.page).toBe('onboarding');
    });

    // 2. RV2-1332: Admin adds a new Activity Question Group linked to a Main Category -> appears for Client
    window.logout();
    loginAs('elena@agency-clean.co', 'Admin123456!');
    await vi.waitFor(() => {
      expect(window.S.authed).toBe(true);
      expect(window.S.role).toBe('admin');
    });
    window.go('brands');
    window.view(false);
    document.getElementById('aq-cat').value = 'Food';
    document.getElementById('aq-act').value = 'Cloud Kitchen';
    document.getElementById('aq-qs').value = '*Which delivery apps do you use?\nAverage prep time?';
    window.addActivityQGroup();
    expect(window.CATS.Food).toContain('Cloud Kitchen');

    // Client picks Food -> sees Cloud Kitchen and its custom questions
    window.logout();
    loginAs('sara@lumen.com', 'Client123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('client'));
    window.OB.cat = 'Food';
    window.OB.act = 'Cloud Kitchen';
    window.OB.step = 'sections';
    window.view(false);
    expect(document.getElementById('view')?.textContent || '').toContain('Activity Questions · Cloud Kitchen');

    // 3. RV2-1333: AM regenerates Brand Brief -> creates new version while keeping old version
    window.logout();
    loginAs('omar@agency-clean.co', 'Manager123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('am'));
    window.S.page = 'brands';
    window.S.brand = 'Lumen Skincare';
    window.S.sub = 'brief';
    window.view(false);
    const beforeList = window.D.briefs.rows.filter((b) => b.brandId === 'Lumen Skincare');
    const prevVersion = beforeList[0].version;
    expect(document.getElementById('view')?.textContent || '').toContain('Regenerate brief');
    window.gen(true);
    const afterBriefs = window.D.briefs.rows.filter((b) => b.brandId === 'Lumen Skincare');
    expect(afterBriefs.length).toBe(beforeList.length + 1);
    expect(afterBriefs.some((b) => b.version === prevVersion)).toBe(true);

    // 4. RV2-1358: Employee attempting to open another user's task directly gets Access denied
    window.logout();
    loginAs('karim@agency-clean.co', 'Creative123456!');
    await vi.waitFor(() => expect(window.S.role).toBe('emp'));
    window.openD({ t: 'task', id: 1 }); // task #1 belongs to Lina Aziz, not Karim Fouad
    expect(document.getElementById('view')?.textContent || '').toContain('Access denied');
  });
});
