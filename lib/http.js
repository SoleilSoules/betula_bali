// Shared helpers for the serverless functions (Node, no deps).

// One in-memory bucket store; callers namespace their keys ("order:", "waiter:").
// Resets on cold start — fine for a single venue.
const buckets = new Map();
function rateLimited(key, max, windowMs) {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  buckets.set(key, arr);
  return arr.length > max;
}

function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  return (xf ? String(xf).split(',')[0].trim() : '') || (req.socket && req.socket.remoteAddress) || 'unknown';
}

// Collapse whitespace/newlines to single spaces (one clean line, no injection),
// then trim and cap length.
function sanitize(s, max) {
  return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, max);
}

// A table label is short alphanumerics + space/underscore/dash only.
function sanitizeTable(s) {
  return sanitize(s, 16).replace(/[^A-Za-z0-9 _-]/g, '');
}

function parseBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  return body && typeof body === 'object' ? body : null;
}

module.exports = { rateLimited, clientIp, sanitize, sanitizeTable, parseBody };
