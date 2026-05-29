const SLUG_REGEX = /^[a-z0-9][a-z0-9_-]{2,63}$/;

export const normalizeSlugInput = (raw) => {
  if (raw == null || typeof raw !== 'string') return '';
  return raw.trim().toLowerCase();
};

export const validateSlugClient = (slug) => {
  if (!slug) {
    return { ok: true, slug: '' };
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

export const buildShortLink = (slug) =>
  `${window.location.origin}/redirect/${slug}`;
