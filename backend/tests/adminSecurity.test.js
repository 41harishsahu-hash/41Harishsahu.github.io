const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const jwt = require('jsonwebtoken');
const { requireAuth, requireAdmin, generateTokens } = require('../middleware/auth');
const User = require('../models/User');

describe('TASK: Single Authorized Admin Security & Access Control Suite', () => {
  const authorizedEmail = (process.env.ADMIN_EMAIL || 'historypackersandmovers@gmail.com').toLowerCase();

  // 1. Single Authorized Email & RBAC Middleware Enforcement
  describe('Admin Authorization Middleware (requireAdmin)', () => {
    it('should reject unauthenticated request without req.user with 403', () => {
      const req = {};
      let statusCode = 200;
      let responseBody = {};
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              responseBody = data;
              return data;
            },
          };
        },
      };
      const next = jest.fn();

      requireAdmin(req, res, next);
      expect(statusCode).toBe(403);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toContain('Administrator privileges required');
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject customer role attempting admin access with 403', () => {
      const req = {
        user: {
          _id: '507f1f77bcf86cd799439011',
          role: 'customer',
          email: 'customer@example.com',
          name: 'Regular Customer',
        },
      };
      let statusCode = 200;
      let responseBody = {};
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              responseBody = data;
              return data;
            },
          };
        },
      };
      const next = jest.fn();

      requireAdmin(req, res, next);
      expect(statusCode).toBe(403);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toContain('Administrator privileges required');
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject user with role "admin" but unauthorized email with 403', () => {
      const req = {
        user: {
          _id: '507f1f77bcf86cd799439099',
          role: 'admin',
          email: 'unauthorized-hacker@gmail.com',
          name: 'Rogue Admin',
        },
      };
      let statusCode = 200;
      let responseBody = {};
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              responseBody = data;
              return data;
            },
          };
        },
      };
      const next = jest.fn();

      requireAdmin(req, res, next);
      expect(statusCode).toBe(403);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toContain('Unauthorized administrator account');
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow the single authorized admin email with role "admin"', () => {
      const req = {
        user: {
          _id: '507f1f77bcf86cd799439099',
          role: 'admin',
          email: authorizedEmail,
          name: 'System Administrator',
        },
      };
      const res = {};
      const next = jest.fn();

      requireAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  // 2. Token Security & Forgery Protection
  describe('JWT Token Security & Validation', () => {
    it('should reject requests without authorization token with 401', async () => {
      const req = {
        headers: {},
        cookies: {},
      };
      let statusCode = 200;
      let responseBody = {};
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              responseBody = data;
              return data;
            },
          };
        },
      };
      const next = jest.fn();

      await requireAuth(req, res, next);
      expect(statusCode).toBe(401);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toContain('No authorization token provided');
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject forged JWT token signed with rogue secret', async () => {
      const forgedToken = jwt.sign(
        { id: '507f1f77bcf86cd799439099', role: 'admin', email: authorizedEmail },
        'rogue_attacker_fake_secret_key_12345'
      );

      const req = {
        headers: {
          authorization: `Bearer ${forgedToken}`,
        },
      };
      let statusCode = 200;
      let responseBody = {};
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              responseBody = data;
              return data;
            },
          };
        },
      };
      const next = jest.fn();

      await requireAuth(req, res, next);
      expect(statusCode).toBe(401);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toContain('Invalid authorization token');
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject expired JWT tokens with code TOKEN_EXPIRED', async () => {
      const expiredToken = jwt.sign(
        { id: '507f1f77bcf86cd799439099', role: 'admin', email: authorizedEmail },
        process.env.JWT_ACCESS_SECRET || 'history_packers_jwt_access_super_secret_key_2026_xyz',
        { expiresIn: '-1s' }
      );

      const req = {
        headers: {
          authorization: `Bearer ${expiredToken}`,
        },
      };
      let statusCode = 200;
      let responseBody = {};
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              responseBody = data;
              return data;
            },
          };
        },
      };
      const next = jest.fn();

      await requireAuth(req, res, next);
      expect(statusCode).toBe(401);
      expect(responseBody.code).toBe('TOKEN_EXPIRED');
      expect(next).not.toHaveBeenCalled();
    });
  });

  // 3. Environment Configuration & Sanitization
  describe('Environment Configuration Integrity', () => {
    it('should verify ADMIN_EMAIL is set and is a valid Gmail address', () => {
      expect(process.env.ADMIN_EMAIL).toBeDefined();
      expect(process.env.ADMIN_EMAIL.toLowerCase()).toMatch(/^[a-z0-9._%+-]+@gmail\.com$/);
    });

    it('should verify sensitive credentials are not exposed in client VITE variables', () => {
      Object.keys(process.env).forEach((key) => {
        if (key.startsWith('VITE_')) {
          expect(key).not.toContain('SECRET');
          expect(key).not.toContain('PASS');
          expect(key).not.toContain('ADMIN_EMAIL');
        }
      });
    });
  });
});
