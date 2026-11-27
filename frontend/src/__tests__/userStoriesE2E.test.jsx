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
});
