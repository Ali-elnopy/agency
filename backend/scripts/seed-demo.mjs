#!/usr/bin/env node
/**
 * Seeds a demo workspace: 7 teams, 3 brands and 8 users (2 account managers
 * and 6 employees) with unique temporary passwords.
 *
 * It talks to the public API instead of the database, so every record goes
 * through the same validation the screens use. The script is idempotent: teams,
 * users and brands are looked up by name/email and reused, memberships are not
 * duplicated, and existing user passwords are never changed.
 *
 * Usage (PowerShell):
 *   $env:API_BASE_URL='https://orvia-agency-api.vercel.app/api'
 *   $env:SEED_ADMIN_EMAIL='admin@agency.local'
 *   $env:SEED_ADMIN_PASSWORD='...'
 *   npm run seed:demo
 */

import { randomInt } from 'node:crypto';

const API_BASE_URL = (process.env.API_BASE_URL || 'http://localhost:5001/api').replace(/\/+$/, '');
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD before running this script.');
  process.exit(1);
}

/* ------------------------------------------------------------------ data */

const TEAMS = [
  {
    name: 'Growth & Performance',
    description: 'Paid media, acquisition experiments and weekly performance reviews.',
  },
  {
    name: 'Creative & Motion Studio',
    description: 'Art direction, motion design and the assets every campaign ships with.',
  },
  {
    name: 'Social Media & Content',
    description: 'Content calendars, community management and platform-native copy.',
  },
  {
    name: 'Brand Strategy',
    description: 'Positioning, audience research and the quarterly brand roadmap.',
  },
  {
    name: 'Photography & Production',
    description: 'Studio and on-location shoots, retouching and production logistics.',
  },
  {
    name: 'Client Success',
    description: 'Account management, reporting and the day-to-day client relationship.',
  },
  {
    name: 'Web & Product Design',
    description: 'Landing pages, product design systems and design QA.',
  },
];

const BRANDS = [
  {
    name: 'Lumina Skincare',
    industry: 'Beauty & Personal Care',
    websiteUrl: 'https://lumina.example.com',
    description: 'Clean skincare line launching a hydration range for the winter season.',
    team: 'Social Media & Content',
    accountManager: 'Salma Nabil',
  },
  {
    name: 'Apex Motors',
    industry: 'Automotive',
    websiteUrl: 'https://apexmotors.example.com',
    description: 'Performance EV brand preparing a regional launch campaign.',
    team: 'Growth & Performance',
    accountManager: 'Omar Khaled',
  },
  {
    name: 'Cedar & Co.',
    industry: 'Home & Lifestyle',
    websiteUrl: 'https://cedarandco.example.com',
    description: 'Handmade home goods brand refreshing its visual identity.',
    team: 'Creative & Motion Studio',
    accountManager: 'Salma Nabil',
  },
];

const USERS = [
  {
    fullName: 'Omar Khaled',
    email: 'omar.khaled@example.com',
    roleName: 'ACCOUNT_MANAGER',
    team: 'Client Success',
    phone: '01000000101',
  },
  {
    fullName: 'Salma Nabil',
    email: 'salma.nabil@example.com',
    roleName: 'ACCOUNT_MANAGER',
    team: 'Brand Strategy',
    phone: '01000000102',
  },
  {
    fullName: 'Youssef Adel',
    email: 'youssef.adel@example.com',
    roleName: 'EMPLOYEE',
    jobTitle: 'Media Buyer',
    team: 'Growth & Performance',
    phone: '01000000103',
  },
  {
    fullName: 'Nour Hassan',
    email: 'nour.hassan@example.com',
    roleName: 'EMPLOYEE',
    jobTitle: 'Video Editor',
    team: 'Creative & Motion Studio',
    phone: '01000000104',
  },
  {
    fullName: 'Mariam Fouad',
    email: 'mariam.fouad@example.com',
    roleName: 'EMPLOYEE',
    jobTitle: 'Graphic Designer',
    team: 'Web & Product Design',
    phone: '01000000105',
  },
  {
    fullName: 'Karim Samir',
    email: 'karim.samir@example.com',
    roleName: 'EMPLOYEE',
    jobTitle: 'Photographer',
    team: 'Photography & Production',
    phone: '01000000106',
  },
  {
    fullName: 'Dina Mostafa',
    email: 'dina.mostafa@example.com',
    roleName: 'EMPLOYEE',
    jobTitle: 'Social Media Specialist',
    team: 'Social Media & Content',
    phone: '01000000107',
  },
  {
    fullName: 'Ahmed Tarek',
    email: 'ahmed.tarek@example.com',
    roleName: 'EMPLOYEE',
    jobTitle: 'Content Creator',
    team: 'Social Media & Content',
    phone: '01000000108',
  },
];

/* --------------------------------------------------------------- helpers */

const LOWER = 'abcdefghjkmnpqrstuvwxyz';
const UPPER = 'ABCDEFGHJKMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%&*?';
const ALL = LOWER + UPPER + DIGITS + SYMBOLS;

function generatePassword() {
  const pick = (source) => source[randomInt(source.length)];
  const chars = [pick(LOWER), pick(UPPER), pick(DIGITS), pick(SYMBOLS)];

  while (chars.length < 16) chars.push(pick(ALL));

  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swap = randomInt(index + 1);
    [chars[index], chars[swap]] = [chars[swap], chars[index]];
  }

  return chars.join('');
}

async function api(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.message || `${method} ${path} failed (${response.status})`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload?.data ?? payload;
}

/* ------------------------------------------------------------------ main */

console.log(`API: ${API_BASE_URL}`);

const session = await api('/auth/login', {
  method: 'POST',
  body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
});
const token = session.accessToken;

if (!token) {
  console.error('Login succeeded but no access token was returned.');
  process.exit(1);
}

console.log(`Signed in as ${ADMIN_EMAIL}`);

const jobTitles = (await api('/meta/job-titles', { token })).jobTitles ?? [];
const jobTitleId = new Map(jobTitles.map((title) => [title.name.toLowerCase(), title.id]));

const existingTeams = await api('/teams', { token });
const teamsByName = new Map(existingTeams.map((team) => [team.name.toLowerCase(), team]));

const teamsCreated = [];
const teamsReused = [];

for (const team of TEAMS) {
  const found = teamsByName.get(team.name.toLowerCase());

  if (found) {
    teamsReused.push(found.name);
    continue;
  }

  const created = await api('/teams', { method: 'POST', token, body: team });
  teamsByName.set(team.name.toLowerCase(), created);
  teamsCreated.push(created.name);
  console.log(`+ team ${created.name}`);
}

const userList = await api('/users', { token });
const usersByEmail = new Map(userList.users.map((user) => [user.email.toLowerCase(), user]));
const usersByName = new Map(userList.users.map((user) => [user.fullName.toLowerCase(), user]));

const createdUsers = [];
const reusedUsers = [];
const memberships = [];

for (const user of USERS) {
  let record = usersByEmail.get(user.email.toLowerCase());

  if (record) {
    reusedUsers.push({ email: record.email, note: 'password unchanged' });
  } else {
    const password = generatePassword();
    const jobTitle = user.jobTitle ? jobTitleId.get(user.jobTitle.toLowerCase()) : null;

    if (user.roleName === 'EMPLOYEE' && !jobTitle) {
      throw new Error(`Job title "${user.jobTitle}" is not configured in the database.`);
    }

    record = await api('/users', {
      method: 'POST',
      token,
      body: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone ?? null,
        password,
        roleName: user.roleName,
        jobTitleId: jobTitle,
      },
    });

    usersByEmail.set(record.email.toLowerCase(), record);
    usersByName.set(record.fullName.toLowerCase(), record);
    createdUsers.push({ ...user, id: record.id, password });
    console.log(`+ user ${record.fullName} <${record.email}>`);
  }

  const team = teamsByName.get(user.team.toLowerCase());

  if (!team) {
    throw new Error(`Team "${user.team}" was not found while assigning ${user.email}.`);
  }

  try {
    await api(`/teams/${team.id}/members`, {
      method: 'POST',
      token,
      body: { userId: record.id },
    });
    memberships.push(`${user.fullName} -> ${team.name}`);
  } catch (error) {
    if (error.status !== 409) throw error;
    // 409 means the membership already exists, which is fine on a re-run.
  }
}

const brandList = (await api('/brands', { token })).brands ?? [];
const brandsByName = new Map(brandList.map((brand) => [brand.name.toLowerCase(), brand]));

const brandsCreated = [];
const brandsReused = [];

for (const brand of BRANDS) {
  const team = teamsByName.get(brand.team.toLowerCase());
  const accountManager = usersByName.get(brand.accountManager.toLowerCase());
  const payload = {
    name: brand.name,
    industry: brand.industry,
    websiteUrl: brand.websiteUrl,
    description: brand.description,
    teamId: team?.id ?? null,
    accountManagerId: accountManager?.id ?? null,
  };

  const found = brandsByName.get(brand.name.toLowerCase());

  if (found) {
    await api(`/brands/${found.id}`, { method: 'PATCH', token, body: payload });
    brandsReused.push(found.name);
    continue;
  }

  const created = await api('/brands', { method: 'POST', token, body: payload });
  brandsCreated.push(created.name);
  console.log(`+ brand ${created.name}`);
}

/* --------------------------------------------------------------- summary */

const finalTeams = await api('/teams', { token });
const finalBrands = (await api('/brands', { token })).brands ?? [];
const finalUsers = (await api('/users', { token })).users ?? [];

console.log('\n================ DEMO WORKSPACE ================');

console.log(`\nTeams (${finalTeams.length})`);
for (const team of finalTeams) {
  console.log(`  #${team.id}  ${team.name}  —  ${team._count?.memberships ?? 0} member(s)`);
}

console.log(`\nBrands (${finalBrands.length})`);
for (const brand of finalBrands) {
  console.log(
    `  #${brand.id}  ${brand.name}  —  team: ${brand.team?.name ?? '—'}  —  AM: ${
      brand.accountManager?.fullName ?? '—'
    }  —  ${brand.status}`,
  );
}

console.log(`\nUsers (${finalUsers.length})`);
for (const user of finalUsers) {
  console.log(
    `  #${user.id}  ${user.fullName.padEnd(16)}  ${user.email.padEnd(30)}  ${
      user.role?.name
    }  ${user.isActive ? 'active' : 'inactive'}`,
  );
}

if (createdUsers.length) {
  console.log('\nNew user credentials (shown once)');
  for (const user of createdUsers) {
    console.log(`  ${user.email.padEnd(30)}  ${user.password.padEnd(18)}  ${user.roleName}`);
  }
} else {
  console.log('\nNo new users were created; existing passwords are unchanged.');
}

console.log('\n-----------------------------------------------');
console.log(`teams created: ${teamsCreated.length}, reused: ${teamsReused.length}`);
console.log(`users created: ${createdUsers.length}, reused: ${reusedUsers.length}`);
console.log(`brands created: ${brandsCreated.length}, updated: ${brandsReused.length}`);
console.log(`memberships added: ${memberships.length}`);
