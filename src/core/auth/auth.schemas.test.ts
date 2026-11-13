import { describe, expect, it } from 'vitest';
import {
  acceptInvitationSchema,
  loginSchema,
  registerWithOrganizationSchema,
  resendVerificationEmailSchema,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from './auth.schemas';

describe('auth.schemas', () => {
  describe('registerWithOrganizationSchema (EARS-01.1)', () => {
    const validInput = {
      fullName: '  Nicolas Figueroa  ',
      email: '  Nicolas@Example.COM ',
      password: 'supersecret1',
      organizationName: ' Acme Corp ',
    };

    it('accepts a valid registration and normalizes the input', () => {
      const result = registerWithOrganizationSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fullName).toBe('Nicolas Figueroa');
        expect(result.data.email).toBe('nicolas@example.com');
        expect(result.data.organizationName).toBe('Acme Corp');
      }
    });

    it('rejects an empty payload', () => {
      expect(registerWithOrganizationSchema.safeParse({}).success).toBe(false);
    });

    it('rejects a too short full name or organization name', () => {
      const tooShortName = { ...validInput, fullName: 'N' };
      const tooShortOrg = { ...validInput, organizationName: 'A' };
      expect(registerWithOrganizationSchema.safeParse(tooShortName).success).toBe(false);
      expect(registerWithOrganizationSchema.safeParse(tooShortOrg).success).toBe(false);
    });

    it('rejects invalid emails', () => {
      const invalidEmail = { ...validInput, email: 'not-an-email' };
      expect(registerWithOrganizationSchema.safeParse(invalidEmail).success).toBe(false);
    });

    it(`rejects passwords shorter than ${PASSWORD_MIN_LENGTH} characters`, () => {
      const shortPassword = { ...validInput, password: '1234567' };
      expect(registerWithOrganizationSchema.safeParse(shortPassword).success).toBe(false);
    });

    it('accepts a password with exactly the minimum length', () => {
      const minPassword = { ...validInput, password: 'a'.repeat(PASSWORD_MIN_LENGTH) };
      expect(registerWithOrganizationSchema.safeParse(minPassword).success).toBe(true);
    });

    it(`rejects passwords longer than ${PASSWORD_MAX_LENGTH} characters`, () => {
      const longPassword = { ...validInput, password: 'a'.repeat(PASSWORD_MAX_LENGTH + 1) };
      expect(registerWithOrganizationSchema.safeParse(longPassword).success).toBe(false);
    });
  });

  describe('loginSchema (EARS-02.1)', () => {
    it('accepts a valid login', () => {
      const result = loginSchema.safeParse({
        email: 'user@nexora.app',
        password: 'anypassword',
      });
      expect(result.success).toBe(true);
    });

    it('rejects an empty password', () => {
      const result = loginSchema.safeParse({ email: 'user@nexora.app', password: '' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid emails', () => {
      const result = loginSchema.safeParse({ email: 'invalid', password: 'anypassword' });
      expect(result.success).toBe(false);
    });
  });

  describe('resendVerificationEmailSchema (EARS-03.3)', () => {
    it('accepts a valid email', () => {
      expect(
        resendVerificationEmailSchema.safeParse({ email: 'user@nexora.app' }).success,
      ).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(
        resendVerificationEmailSchema.safeParse({ email: 'nope' }).success,
      ).toBe(false);
      expect(resendVerificationEmailSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('acceptInvitationSchema (EARS-05.1)', () => {
    const validInput = {
      token: 'abc123',
      fullName: 'Colaborador Nuevo',
      password: 'supersecret1',
    };

    it('accepts a valid acceptance payload', () => {
      expect(acceptInvitationSchema.safeParse(validInput).success).toBe(true);
    });

    it('rejects an empty token', () => {
      const emptyToken = { ...validInput, token: '' };
      expect(acceptInvitationSchema.safeParse(emptyToken).success).toBe(false);
      expect(acceptInvitationSchema.safeParse({}).success).toBe(false);
    });

    it('rejects invalid passwords', () => {
      const shortPassword = { ...validInput, password: '123' };
      expect(acceptInvitationSchema.safeParse(shortPassword).success).toBe(false);
    });
  });
});
