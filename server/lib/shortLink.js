import { query } from '../db.js';

const SLUG_REGEX = /^[a-z0-9][a-z0-9_-]{2,63}$/;

const RESERVED_SLUGS = new Set([
  'api',
  'auth',
  'settings',
  'reports',
  'redirect',
  'health',
  'login',
  'signup',
  'signin',
  'signout',
  'session',
  'profile',
  'users',
  'qr-codes',
  'static',
  'assets',
  'favicon',
  'index',
]);

export const normalizeSlugInput = (raw) => {
  if (raw == null || typeof raw !== 'string') return null;
  const trimmed = raw.trim().toLowerCase();
  return trimmed || null;
};

export const validateSlug = (slug) => {
  if (!slug) {
    return { ok: false, error: 'Informe um identificador para o link curto.' };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { ok: false, error: 'Este identificador está reservado. Escolha outro.' };
  }
  if (!SLUG_REGEX.test(slug)) {
    return {
      ok: false,
      error:
        'Use 3 a 64 caracteres: letras minúsculas, números, hífen ou underscore (ex.: promo-foz).',
    };
  }
  return { ok: true, slug };
};

export const assertSlugAvailable = async (slug, excludeId = null) => {
  const result = await query('SELECT id FROM public.qr_codes WHERE id = $1', [slug]);
  if (result.rows.length === 0) {
    return { ok: true };
  }
  const existingId = result.rows[0].id;
  if (excludeId && String(existingId) === String(excludeId)) {
    return { ok: true };
  }
  return { ok: false, error: 'Este identificador já está em uso.' };
};

export const resolveSlugForCreate = async (shortId) => {
  const normalized = normalizeSlugInput(shortId);
  if (!normalized) {
    return { ok: true, id: null };
  }

  const validation = validateSlug(normalized);
  if (!validation.ok) {
    return { ok: false, error: validation.error, status: 400 };
  }

  const availability = await assertSlugAvailable(normalized);
  if (!availability.ok) {
    return { ok: false, error: availability.error, status: 409 };
  }

  return { ok: true, id: normalized };
};

export const resolveSlugForUpdate = async (shortId, currentId) => {
  const normalized = normalizeSlugInput(shortId);
  const current = String(currentId);

  if (!normalized || normalized === current.toLowerCase()) {
    return { ok: true, id: current, changed: false };
  }

  const validation = validateSlug(normalized);
  if (!validation.ok) {
    return { ok: false, error: validation.error, status: 400 };
  }

  const availability = await assertSlugAvailable(normalized, current);
  if (!availability.ok) {
    return { ok: false, error: availability.error, status: 409 };
  }

  return { ok: true, id: normalized, changed: true };
};
