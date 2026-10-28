import { getSupabase, isSupabaseReady, mockDb } from '../services/supabase/supabaseClient.js';

/**
 * Extracts Bearer token from Authorization header.
 */
function extractBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }
  const parts = authHeader.trim().split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  return null;
}

/**
 * Strict authentication middleware: rejects unauthenticated requests.
 */
export async function requireAuth(req, res, next) {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token missing. Please log in.'
      }
    });
  }

  try {
    if (isSupabaseReady()) {
      const supabase = getSupabase();
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Session has expired or is invalid. Please log in again.'
          }
        });
      }

      req.user = user;
      req.token = token;
      return next();
    }

    // In-memory demo fallback when Supabase credentials are not yet configured
    if (token === 'demo-token' || token.startsWith('demo-jwt-')) {
      req.user = mockDb.demoUser;
      req.token = token;
      return next();
    }

    // If client provided a simulated JWT or token in local dev
    req.user = {
      id: 'demo-user-123e4567-e89b-12d3-a456-426614174000',
      email: 'student@codebuddy.ai',
      user_metadata: { full_name: 'Demo Student' }
    };
    req.token = token;
    return next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_VERIFICATION_FAILED',
        message: 'Could not verify authentication session.'
      }
    });
  }
}

/**
 * Optional authentication middleware: attaches user if token is present, does not reject if missing.
 */
export async function optionalAuth(req, res, next) {
  const token = extractBearerToken(req);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    if (isSupabaseReady()) {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser(token);
      req.user = user || null;
      req.token = token;
    } else {
      req.user = mockDb.demoUser;
      req.token = token;
    }
  } catch (e) {
    req.user = null;
  }
  next();
}
