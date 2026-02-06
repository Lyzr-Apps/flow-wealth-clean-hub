// Security Utilities for Production-Grade Financial Operations
// HMAC signatures, idempotency, rate limiting, encryption

import crypto from 'crypto';

/**
 * Generate HMAC signature for API requests
 */
export function generateHMAC(payload: string, secret?: string): string {
  const secretKey = secret || process.env.HMAC_SECRET_KEY || 'default_secret_change_in_prod';
  return crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifyHMAC(payload: string, signature: string, secret?: string): boolean {
  const secretKey = secret || process.env.HMAC_SECRET_KEY || 'default_secret_change_in_prod';
  const expectedSignature = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Generate idempotency key for API calls
 */
export function generateIdempotencyKey(prefix: string = 'idem'): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Generate verification hash for transactions
 */
export function generateVerificationHash(data: Record<string, any>): string {
  const sortedData = Object.keys(data)
    .sort()
    .reduce((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {} as Record<string, any>);

  const payload = JSON.stringify(sortedData);
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Rate Limiter (Simple in-memory implementation)
 * Replace with Redis in production
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number = 10, windowMs: number = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Filter out requests outside the time window
    const recentRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);

    // Check if limit exceeded
    if (recentRequests.length >= this.limit) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return true;
  }

  /**
   * Get remaining requests
   */
  getRemaining(identifier: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);

    return Math.max(0, this.limit - recentRequests.length);
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Export singleton instances
export const apiRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
export const executionRateLimiter = new RateLimiter(10, 60000); // 10 executions per minute

/**
 * Encrypt sensitive data (for database storage)
 */
export function encrypt(text: string, key?: string): string {
  const encryptionKey = key || process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(encryptionKey.substring(0, 64), 'hex'),
    iv
  );

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedText: string, key?: string): string {
  const encryptionKey = key || process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  const [ivHex, encrypted] = encryptedText.split(':');

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(encryptionKey.substring(0, 64), 'hex'),
    Buffer.from(ivHex, 'hex')
  );

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Sanitize input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate user ID format
 */
export function isValidUserId(userId: string): boolean {
  // Must be alphanumeric, 8-36 characters
  return /^[a-zA-Z0-9]{8,36}$/.test(userId);
}

/**
 * Generate audit log entry
 */
export function createAuditLog(params: {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  status: 'success' | 'failure';
  metadata?: Record<string, any>;
}): Record<string, any> {
  return {
    timestamp: new Date().toISOString(),
    userId: params.userId,
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    status: params.status,
    metadata: params.metadata || {},
    ipAddress: 'N/A', // Add from request in production
    userAgent: 'N/A' // Add from request in production
  };
}

/**
 * GDPR Compliance - Data Minimization
 * Remove PII fields that aren't necessary
 */
export function minimizeData<T extends Record<string, any>>(
  data: T,
  allowedFields: string[]
): Partial<T> {
  return allowedFields.reduce((acc, field) => {
    if (field in data) {
      acc[field as keyof T] = data[field];
    }
    return acc;
  }, {} as Partial<T>);
}

/**
 * PSD2 Strong Customer Authentication (SCA) validator
 * Requires two factors: knowledge (password), possession (device), inherence (biometric)
 */
export function validateSCA(params: {
  hasPassword: boolean;
  hasDeviceToken: boolean;
  hasBiometric: boolean;
}): { valid: boolean; factors: number } {
  const factors = [params.hasPassword, params.hasDeviceToken, params.hasBiometric].filter(Boolean).length;

  return {
    valid: factors >= 2,
    factors
  };
}
