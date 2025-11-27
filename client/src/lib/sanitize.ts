/**
 * Safe HTML Sanitizer using DOMPurify
 * Protects against XSS attacks when using dangerouslySetInnerHTML
 */

import DOMPurify from 'dompurify';

export interface SanitizeOptions {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  ALLOW_DATA_ATTR?: boolean;
  KEEP_CONTENT?: boolean;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(
  dirty: string,
  options?: SanitizeOptions
): string {
  const defaultOptions: SanitizeOptions = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'span', 'div', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'title', 'class', 'id', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  };

  const config = { ...defaultOptions, ...options };

  return DOMPurify.sanitize(dirty, config);
}

/**
 * Sanitize HTML for rich text editor content
 * More permissive for document generators
 */
export function sanitizeRichText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'span', 'div', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img',
      'hr', 'sup', 'sub', 'mark',
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'class', 'id', 'target', 'rel', 
      'src', 'alt', 'width', 'height', 'style',
    ],
    ALLOW_DATA_ATTR: true,
    // Allow safe URI schemes
    ALLOWED_URI_REGEXP: /^(?:https?|mailto|tel|callto|sms|cid|xmpp):|^[^a-z]/i,
  });
}

/**
 * Sanitize user-generated content (strict)
 */
export function sanitizeUserContent(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Strip all HTML tags (plain text only)
 */
export function stripHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  });
}

/**
 * Create safe props for dangerouslySetInnerHTML
 */
export function createSafeHtmlProps(
  html: string,
  options?: SanitizeOptions
): { __html: string } {
  return {
    __html: sanitizeHtml(html, options),
  };
}

/**
 * Create safe props for rich text content
 */
export function createSafeRichTextProps(html: string): { __html: string } {
  return {
    __html: sanitizeRichText(html),
  };
}
