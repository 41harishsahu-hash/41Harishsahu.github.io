const http = require('http');
const app = require('../app');
const {
  normalizeIndianMobile,
  registerSchema,
  enquirySchema,
  bookingCreateSchema,
} = require('../validators/schemas');
const { generateTokens, verifyAccessToken, requireAdmin } = require('../middleware/auth');
const {
  isCloudinaryConfigured,
  getCloudinaryStatus,
  resolveCredentials,
  parseCloudinaryUrl,
  isValidCloudName,
  maskCloudName,
} = require('../config/cloudinary');
const { getUploadStatus } = require('../controllers/uploadController');

// Create standard Node HTTP request/response instances for Express (runs 100% inside sandboxed environment)
const executeRequest = (method, url, body = {}, headers = {}) => {
  return new Promise((resolve) => {
    let statusCode = 200;
    let resHeaders = {};
    let responseBody = null;

    const socket = {
      remoteAddress: '127.0.0.1',
      encrypted: false,
      destroy: () => {},
      on: () => {},
      write: () => {},
      cork: () => {},
      uncork: () => {},
    };

    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = {
      host: 'localhost',
      'content-type': 'application/json',
      ...headers,
    };
    req.body = body;

    const res = new http.ServerResponse(req);
    res.json = function (data) {
      statusCode = this.statusCode || 200;
      responseBody = data;
      resolve({ statusCode, body: data, headers: resHeaders });
      return this;
    };
    res.send = function (data) {
      statusCode = this.statusCode || 200;
      responseBody = data;
      resolve({ statusCode, body: data, headers: resHeaders });
      return this;
    };
    res.end = function (chunk) {
      statusCode = this.statusCode || 200;
      resolve({ statusCode, body: responseBody, headers: resHeaders });
      return this;
    };

    app.handle(req, res);
  });
};

describe('History Packers & Movers Test Suite', () => {
  // 1. HEALTH CHECK & ROUTING
  describe('GET /api/health and Undefined Routes', () => {
    it('should return 200 and healthy status', async () => {
      const res = await executeRequest('GET', '/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('History Packers & Movers API');
      expect(res.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return 404 for undefined routes with clean json error', async () => {
      const res = await executeRequest('GET', '/api/non-existent-route-123');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('API route not found');
    });
  });

  // 2. INPUT VALIDATION & INDIAN MOBILE NORMALIZATION
  describe('Form Validation & Input Normalization', () => {
    it('should normalize and validate Indian mobile numbers', () => {
      expect(normalizeIndianMobile('+91 9251273070')).toBe('9251273070');
      expect(normalizeIndianMobile('919251273070')).toBe('9251273070');
      expect(normalizeIndianMobile('09251273070')).toBe('9251273070');
      expect(normalizeIndianMobile('92512 73070')).toBe('9251273070');
      expect(normalizeIndianMobile('92512-73070')).toBe('9251273070');
    });

    it('should accept valid customer registration payload', () => {
      const validPayload = {
        name: 'Vikas Sharma',
        email: 'vikas@example.com',
        mobile: '+91 9876543210',
        password: 'SecurePassword123',
      };
      const result = registerSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mobile).toBe('9876543210');
        expect(result.data.email).toBe('vikas@example.com');
      }
    });

    it('should reject invalid mobile number (less than 10 digits or non-Indian prefix)', () => {
      const invalidPayload = {
        name: 'Vikas Sharma',
        email: 'vikas@example.com',
        mobile: '1234567890', // Does not start with 6, 7, 8, or 9
        password: 'SecurePassword123',
      };
      const result = registerSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject weak passwords without required characters', () => {
      const weakPasswordPayload = {
        name: 'Vikas Sharma',
        email: 'vikas@example.com',
        mobile: '9876543210',
        password: 'onlyletters', // No number
      };
      const result = registerSchema.safeParse(weakPasswordPayload);
      expect(result.success).toBe(false);
    });

    it('should validate complete enquiry quotation request fields', () => {
      const validEnquiry = {
        name: 'Rajesh Meena',
        email: 'rajesh@example.com',
        mobile: '9251273070',
        pickupAddress: 'Shop No 05 Basement Plot No R 3/42, Dhawas',
        destinationAddress: 'Flat 301, C-Scheme, Ashok Nagar',
        pickupCity: 'Jaipur',
        destinationCity: 'Jaipur',
        serviceType: 'Home Relocation',
        movingDate: new Date(Date.now() + 86400000).toISOString(),
        propertyType: '3 BHK',
        message: 'Looking for packing and safe moving.',
      };
      const result = enquirySchema.safeParse(validEnquiry);
      expect(result.success).toBe(true);
    });

    it('should reject enquiry with address shorter than 5 characters', () => {
      const invalidEnquiry = {
        name: 'Rajesh Meena',
        email: 'rajesh@example.com',
        mobile: '9251273070',
        pickupAddress: 'Abc', // Too short
        destinationAddress: 'Flat 301, C-Scheme',
        pickupCity: 'Jaipur',
        destinationCity: 'Jaipur',
        serviceType: 'Home Relocation',
        movingDate: new Date().toISOString(),
      };
      const result = enquirySchema.safeParse(invalidEnquiry);
      expect(result.success).toBe(false);
    });
  });

  // 3. SECURITY, JWT TOKENS & ROLE AUTHORIZATION
  describe('JWT Authentication & RBAC Middleware', () => {
    it('should generate valid access and refresh tokens', () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        role: 'customer',
        email: 'customer@example.com',
        name: 'Customer Test',
      };

      const tokens = generateTokens(mockUser);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();

      const decoded = verifyAccessToken(tokens.accessToken);
      expect(decoded.id).toBe(mockUser._id);
      expect(decoded.role).toBe('customer');
      expect(decoded.email).toBe('customer@example.com');
    });

    it('should strictly reject access to admin route when role is customer', () => {
      const req = {
        user: {
          _id: '507f1f77bcf86cd799439011',
          role: 'customer',
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

    it('should strictly reject user with admin role if email does not match authorized ADMIN_EMAIL', () => {
      const req = {
        user: {
          _id: '507f1f77bcf86cd799439098',
          role: 'admin',
          email: 'unauthorized-admin@gmail.com',
          name: 'Rogue Admin Attempt',
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

    it('should allow authorized admin through requireAdmin middleware', () => {
      const adminEmail = (process.env.ADMIN_EMAIL || 'historypackersandmovers@gmail.com').toLowerCase();
      const req = {
        user: {
          _id: '507f1f77bcf86cd799439099',
          role: 'admin',
          email: adminEmail,
          name: 'Authorized Admin User',
        },
      };
      const res = {};
      const next = jest.fn();

      requireAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  // 4. CLOUDINARY CONFIGURATION SAFETY & CLOUD_NAME ROOT VALIDATION
  describe('Cloudinary Configuration & Safety', () => {
    it('should safely identify whether Cloudinary credentials are fully configured', () => {
      const status = isCloudinaryConfigured();
      expect(typeof status).toBe('boolean');
    });

    it('should reject known invalid / placeholder cloud names like "root", "admin", "test"', () => {
      expect(isValidCloudName('root')).toBe(false);
      expect(isValidCloudName('Root')).toBe(false);
      expect(isValidCloudName('admin')).toBe(false);
      expect(isValidCloudName('test')).toBe(false);
      expect(isValidCloudName('undefined')).toBe(false);
      expect(isValidCloudName('placeholder')).toBe(false);
      expect(isValidCloudName('history-packers-backend')).toBe(false);
      expect(isValidCloudName('ab')).toBe(false); // too short
    });

    it('should accept valid production cloud names', () => {
      expect(isValidCloudName('HistoryPackers')).toBe(true);
      expect(isValidCloudName('historypackers')).toBe(true);
      expect(isValidCloudName('packers_movers_2026')).toBe(true);
      expect(isValidCloudName('my-cloud-cdn')).toBe(true);
    });

    it('should parse CLOUDINARY_URL correctly', () => {
      const parsed = parseCloudinaryUrl('cloudinary://123456789:mySecretKey@HistoryPackers');
      expect(parsed).not.toBeNull();
      expect(parsed.apiKey).toBe('123456789');
      expect(parsed.apiSecret).toBe('mySecretKey');
      expect(parsed.cloudName).toBe('HistoryPackers');
    });

    it('should report misconfigured and reject when cloud_name is "root"', () => {
      const result = resolveCredentials({
        CLOUDINARY_CLOUD_NAME: 'root',
        CLOUDINARY_API_KEY: '233463841358439',
        CLOUDINARY_API_SECRET: 'dummy_secret',
      });
      expect(result.isValid).toBe(false);
      expect(result.status).toBe('misconfigured');
      expect(result.error).toContain('Invalid cloud_name "root"');
      expect(result.maskedCloudName).toBe('root (INVALID)');
      expect(result.apiSecret).toBeNull(); // Never expose secret on error
    });

    it('should automatically recover using valid CLOUDINARY_URL if discrete cloud_name is "root"', () => {
      const result = resolveCredentials({
        CLOUDINARY_CLOUD_NAME: 'root',
        CLOUDINARY_API_KEY: '233463841358439',
        CLOUDINARY_API_SECRET: 'dummy_secret',
        CLOUDINARY_URL: 'cloudinary://233463841358439:dummy_secret@HistoryPackers',
      });
      expect(result.isValid).toBe(true);
      expect(result.status).toBe('ready');
      expect(result.source).toBe('CLOUDINARY_URL');
      expect(result.cloudName).toBe('HistoryPackers');
      expect(result.maskedCloudName).toBe('His***');
    });

    it('should safely mask cloud names and protect secrets', () => {
      expect(maskCloudName('HistoryPackers')).toBe('His***');
      expect(maskCloudName('ab')).toBe('***');
      expect(maskCloudName(null)).toBeNull();
    });

    it('should report unconfigured safely when environment variables are empty', () => {
      const result = resolveCredentials({});
      expect(result.isValid).toBe(false);
      expect(result.status).toBe('unconfigured');
      expect(result.maskedCloudName).toBeNull();
    });

    it('should return misconfigured status in getUploadStatus when cloud_name is "root"', () => {
      const orig = process.env.CLOUDINARY_CLOUD_NAME;
      process.env.CLOUDINARY_CLOUD_NAME = 'root';
      let resJson = null;
      const res = {
        json: (data) => {
          resJson = data;
        },
      };
      getUploadStatus({}, res);
      expect(resJson).not.toBeNull();
      expect(resJson.isCloudinaryConfigured).toBe(false);
      expect(resJson.status).toBe('misconfigured');
      expect(resJson.cloudName).toBe('root (INVALID)');
      expect(resJson.error).toContain('root');
      expect(resJson.storageFallback).toBe('local_storage_ready');
      process.env.CLOUDINARY_CLOUD_NAME = orig;
    });
  });
});
