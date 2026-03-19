import jsdom from 'jsdom';
const { JSDOM } = jsdom;
import { HeadingSlugger } from './hashnode-heading-slugger.js';

export async function processPost(post) {
  const dom = new JSDOM(post.content.html);
  const document = dom.window.document;
  const slugger = new HeadingSlugger();

  if (!post.publishedAt)
    post.publishedAt = new Date(post.updatedAt).toLocaleDateString();

  // Generate ids for headings that don't have them for anchor linking
  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
    const headings = document.querySelectorAll(tag);
    [...headings]
      .filter(heading => !heading.hasAttribute('id'))
      .forEach(heading => {
        const textContent = heading.textContent || '';
        const slug = slugger.getSlug(textContent);
        heading.setAttribute('id', `heading-${slug}`);
      });
  });

  // Update post content with modified HTML
  post.content.html = document.body.innerHTML;

  return post;
}
