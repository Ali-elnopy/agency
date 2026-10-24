import { describe, it, expect } from 'vitest';
import {
  TEMP_PASSWORD_LENGTH,
  generateTemporaryPassword,
} from '../credentials';

describe('generateTemporaryPassword', () => {
  it('matches the API password policy', () => {
    const password = generateTemporaryPassword();

    expect(password).toHaveLength(TEMP_PASSWORD_LENGTH);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[^A-Za-z0-9]/);
  });

  it('never uses ambiguous characters', () => {
    for (let index = 0; index < 100; index += 1) {
      expect(generateTemporaryPassword()).not.toMatch(/[0O1lI]/);
    }
  });

  it('returns a different value on every call', () => {
    const generated = new Set();

    for (let index = 0; index < 200; index += 1) {
      generated.add(generateTemporaryPassword());
    }

    expect(generated.size).toBe(200);
  });
});
