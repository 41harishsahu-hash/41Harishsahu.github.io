const cloudinary = require('cloudinary').v2;

const BOGUS_CLOUD_NAMES = new Set([
  'root',
  'admin',
  'administrator',
  'test',
  'undefined',
  'null',
  'your_cloud_name',
  'your-cloud-name',
  'your_name',
  'cloud_name',
  'placeholder',
  'none',
  'history-packers-backend',
  'localhost',
  'default',
  'fake',
  'sample',
]);

/**
 * Safely parse a CLOUDINARY_URL format:
 * cloudinary://<api_key>:<api_secret>@<cloud_name>
 */
const parseCloudinaryUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  const match = trimmed.match(/^cloudinary:\/\/([^:]+):([^@]+)@([a-zA-Z0-9_-]+)/);
  if (!match) return null;
  return {
    apiKey: match[1].trim(),
    apiSecret: match[2].trim(),
    cloudName: match[3].trim(),
  };
};

/**
 * Validate a Cloudinary cloud name:
 * - Must be a non-empty string
 * - Length between 3 and 100 characters
 * - Alphanumeric, underscores, hyphens only
 * - Not a known placeholder/system name (e.g. 'root', 'admin')
 */
const isValidCloudName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const clean = name.trim().toLowerCase();
  if (clean.length < 3 || clean.length > 100) return false;
  if (!/^[a-z0-9_-]+$/.test(clean)) return false;
  if (BOGUS_CLOUD_NAMES.has(clean)) return false;
  return true;
};

/**
 * Mask cloud name for safe display / logging
 */
const maskCloudName = (name) => {
  if (!name || typeof name !== 'string') return null;
  const trimmed = name.trim();
  if (trimmed.length <= 3) return '***';
  return `${trimmed.slice(0, 3)}***`;
};

/**
 * Resolve Cloudinary credentials from environment:
 * Precedence & fallback rules:
 * 1. Discrete env vars (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) if valid.
 * 2. CLOUDINARY_URL if discrete cloud name is invalid (e.g. 'root') or missing.
 * 3. Misconfigured state if bogus/placeholder values are detected.
 * 4. Unconfigured state if no credentials provided.
 */
const resolveCredentials = (env = process.env) => {
  const discreteCloudName = (env.CLOUDINARY_CLOUD_NAME || '').trim();
  const discreteApiKey = (env.CLOUDINARY_API_KEY || '').trim();
  const discreteApiSecret = (env.CLOUDINARY_API_SECRET || '').trim();

  const urlCreds = parseCloudinaryUrl(env.CLOUDINARY_URL);

  const hasDiscrete = Boolean(discreteCloudName && discreteApiKey && discreteApiSecret);
  const discreteValid = hasDiscrete && isValidCloudName(discreteCloudName);

  const hasUrl = Boolean(urlCreds);
  const urlValid = hasUrl && isValidCloudName(urlCreds?.cloudName);

  // 1. Valid discrete credentials
  if (discreteValid) {
    return {
      status: 'ready',
      isValid: true,
      source: 'CLOUDINARY_CLOUD_NAME',
      cloudName: discreteCloudName,
      apiKey: discreteApiKey,
      apiSecret: discreteApiSecret,
      maskedCloudName: maskCloudName(discreteCloudName),
      message: 'Cloudinary credentials configured and validated via discrete environment variables.',
      error: null,
    };
  }

  // 2. Valid CLOUDINARY_URL fallback (e.g. if discrete was misconfigured or absent)
  if (urlValid) {
    return {
      status: 'ready',
      isValid: true,
      source: 'CLOUDINARY_URL',
      cloudName: urlCreds.cloudName,
      apiKey: urlCreds.apiKey,
      apiSecret: urlCreds.apiSecret,
      maskedCloudName: maskCloudName(urlCreds.cloudName),
      message: 'Cloudinary credentials configured and validated via CLOUDINARY_URL.',
      error: null,
    };
  }

  // 3. Discrete provided but has invalid cloud name (e.g. 'root', 'admin')
  if (hasDiscrete && !isValidCloudName(discreteCloudName)) {
    return {
      status: 'misconfigured',
      isValid: false,
      source: 'CLOUDINARY_CLOUD_NAME',
      cloudName: discreteCloudName,
      apiKey: discreteApiKey,
      apiSecret: null,
      maskedCloudName: `${discreteCloudName} (INVALID)`,
      message: `Invalid cloud_name "${discreteCloudName}". Known placeholder or invalid name detected.`,
      error: `Invalid cloud_name "${discreteCloudName}". Please set CLOUDINARY_CLOUD_NAME in Render environment variables to your actual Cloudinary Cloud Name (e.g. "historypackers").`,
    };
  }

  // 4. CLOUDINARY_URL provided but has invalid cloud name
  if (hasUrl && !isValidCloudName(urlCreds.cloudName)) {
    return {
      status: 'misconfigured',
      isValid: false,
      source: 'CLOUDINARY_URL',
      cloudName: urlCreds.cloudName,
      apiKey: urlCreds.apiKey,
      apiSecret: null,
      maskedCloudName: `${urlCreds.cloudName} (INVALID)`,
      message: `Invalid cloud_name "${urlCreds.cloudName}" in CLOUDINARY_URL.`,
      error: `Invalid cloud_name "${urlCreds.cloudName}" in CLOUDINARY_URL.`,
    };
  }

  // 5. Incomplete configuration
  if (discreteCloudName || discreteApiKey || discreteApiSecret || env.CLOUDINARY_URL) {
    const missing = [];
    if (!discreteCloudName) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!discreteApiKey) missing.push('CLOUDINARY_API_KEY');
    if (!discreteApiSecret) missing.push('CLOUDINARY_API_SECRET');
    return {
      status: 'misconfigured',
      isValid: false,
      source: 'partial',
      cloudName: discreteCloudName || null,
      apiKey: null,
      apiSecret: null,
      maskedCloudName: discreteCloudName ? `${discreteCloudName} (INCOMPLETE)` : null,
      message: `Incomplete Cloudinary configuration. Missing: ${missing.join(', ')}.`,
      error: `Incomplete Cloudinary configuration. Missing: ${missing.join(', ')}.`,
    };
  }

  // 6. Unconfigured
  return {
    status: 'unconfigured',
    isValid: false,
    source: null,
    cloudName: null,
    apiKey: null,
    apiSecret: null,
    maskedCloudName: null,
    message: 'Cloudinary credentials are not configured.',
    error: null,
  };
};

/**
 * Configure Cloudinary SDK only if valid credentials are provided
 */
const initCloudinarySDK = () => {
  const creds = resolveCredentials();
  if (creds.isValid) {
    cloudinary.config({
      cloud_name: creds.cloudName.trim().toLowerCase(),
      api_key: creds.apiKey,
      api_secret: creds.apiSecret,
      secure: true,
    });
  }
};

initCloudinarySDK();

/**
 * Startup validation logger (invoked on server boot)
 */
const validateCloudinaryOnStartup = () => {
  const status = resolveCredentials();
  if (status.status === 'ready') {
    console.log(`[Cloudinary] Validated configuration for cloud_name: "${status.maskedCloudName}" (source: ${status.source}).`);
  } else if (status.status === 'misconfigured') {
    console.error(`[Cloudinary ERROR] Configuration rejected: ${status.error}`);
    console.warn('[Cloudinary WARNING] Direct Cloudinary image uploads will be rejected until corrected in environment variables.');
  } else {
    console.warn('[Cloudinary NOTICE] Cloudinary credentials not configured in environment. Local storage fallback will be used in development.');
  }
  return status;
};

/**
 * Upload buffer to Cloudinary
 */
const uploadStream = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const status = resolveCredentials();
    if (!status.isValid) {
      return reject(new Error(status.error || 'Cloudinary credentials are not configured or valid.'));
    }

    // Ensure SDK is configured with latest resolved credentials
    cloudinary.config({
      cloud_name: status.cloudName.trim().toLowerCase(),
      api_key: status.apiKey,
      api_secret: status.apiSecret,
      secure: true,
    });

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'history-packers',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

/**
 * Delete asset from Cloudinary
 */
const deleteAsset = async (publicId) => {
  const status = resolveCredentials();
  if (!status.isValid) {
    throw new Error(status.error || 'Cloudinary credentials are not configured or valid.');
  }

  cloudinary.config({
    cloud_name: status.cloudName.trim().toLowerCase(),
    api_key: status.apiKey,
    api_secret: status.apiSecret,
    secure: true,
  });

  return cloudinary.uploader.destroy(publicId);
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured: () => resolveCredentials().isValid,
  getCloudinaryStatus: () => resolveCredentials(),
  validateCloudinaryOnStartup,
  resolveCredentials,
  parseCloudinaryUrl,
  isValidCloudName,
  maskCloudName,
  uploadStream,
  deleteAsset,
};
