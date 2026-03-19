import sanitizeHtml from 'sanitize-html';
import slug from 'slug';

export class HeadingSlugger {
  static sanitizeSlug(str) {
    return slug(sanitizeHtml(str, { allowedTags: [] }), { lower: true });
  }

  getSlug(str) {
    return HeadingSlugger.sanitizeSlug(str);
  }
}
