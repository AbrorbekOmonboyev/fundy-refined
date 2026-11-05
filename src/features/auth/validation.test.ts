import { describe, expect, it } from 'vitest';
import { isStrongPassword, isValidEmail, isValidName } from '@/features/auth/validation';

describe('sign-up checks', () => {
  it('accepts real-looking emails and rejects broken ones', () => {
    expect(isValidEmail('aziz@mail.uz')).toBe(true);
    expect(isValidEmail('  aziz@mail.uz  ')).toBe(true);
    expect(isValidEmail('aziz@mail')).toBe(false);
    expect(isValidEmail('aziz mail.uz')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('needs passwords of 8+ characters with letters and digits', () => {
    expect(isStrongPassword('fundy2026')).toBe(true);
    expect(isStrongPassword('short1')).toBe(false);
    expect(isStrongPassword('onlyletters')).toBe(false);
    expect(isStrongPassword('12345678')).toBe(false);
  });

  it('needs a name of 2 to 120 characters', () => {
    expect(isValidName('Aziz')).toBe(true);
    expect(isValidName(' A ')).toBe(false);
    expect(isValidName('x'.repeat(121))).toBe(false);
  });
});
