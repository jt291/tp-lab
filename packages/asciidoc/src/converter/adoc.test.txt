import { describe, it, expect } from 'vitest';
import { adoc, convert, raw } from './converter.js';

describe('adoc tagged template', () => {
  it('should convert a simple AsciiDoc template to HTML', () => {
    const html = adoc`
      * Item A
      * Item B
    `;
    // basic checks: list wrapper and content
    expect(html).toMatch(/<ul[^>]*>/);
    expect(html).toContain('<li>Item A</li>');
    expect(html).toContain('<li>Item B</li>');
  });

  it('should insert raw snippet without additional processing', () => {
    const snippet = '\n----\nconst x = 1;\n----\n';
    const html = adoc`
      Intro text

      ${raw(snippet)}
    `;
    // raw listing snippet should be converted to a code/listing block
    expect(html).toMatch(/<pre[^>]*>/);
    expect(html).toContain('const x = 1;');
  });

  it('adoc.withOptions should forward options to convert()', () => {
    const source = '= My Title\n\nA paragraph';
    // Use tagged template syntax — not a normal function call
    const htmlViaAdoc = adoc.withOptions({ standalone: true })`${source}`;
    const htmlDirect = convert(source, { standalone: true });
    expect(htmlViaAdoc).toBe(htmlDirect);
  });
});