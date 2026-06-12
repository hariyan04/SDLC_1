import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'sdlc-maturity-super-secret-key-12345';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || (user.email === 'admin@sdlc.com' ? 'admin' : 'user') },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function getUserIdFromRequest(req) {
  try {
    let token = null;

    // Primary: use Next.js cookies() store — works reliably on GET and POST
    try {
      const cookieStore = cookies();
      token = cookieStore.get('token')?.value || null;
    } catch (_) {
      // cookies() may throw outside a request context — fall through to header parsing
    }

    // Fallback 1: manual header parsing
    if (!token) {
      const cookieHeader = req.headers.get('cookie') || '';
      const cookieMap = {};
      cookieHeader.split(';').forEach(c => {
        const eqIdx = c.indexOf('=');
        if (eqIdx > -1) {
          cookieMap[c.slice(0, eqIdx).trim()] = c.slice(eqIdx + 1).trim();
        }
      });
      token = cookieMap['token'] || null;
    }

    // Fallback 2: Authorization: Bearer header
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) return null;

    const decoded = verifyToken(token);
    return decoded || null;
  } catch (err) {
    return null;
  }
}
