/**
 * Main entry point for @tp-lab/asciidoc.
 * 
 * @module
 * @category Main
 */

import Asciidoctor from '@asciidoctor/core';
import type { ProcessorOptions } from '@asciidoctor/core';
import { TpConverter } from './converter.js';
import { formatHtml } from './format.js';

const asciidoctor = Asciidoctor();

/**
 * Converts AsciiDoc content to semantic HTML.
 * 
 * @summary Main conversion function that uses the custom TpConverter for semantic HTML output.
 * 
 * @param content - The AsciiDoc source string
 * @param options - Optional Asciidoctor processor options
 * @returns The converted HTML string
 * 
 * @example
 * ```typescript
 * const asciidoc = '* Item 1\n* Item 2';
 * const html = convert(asciidoc);
 * // Returns:  '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>'
 * ```
 * 
 * @example
 * ```typescript
 * const asciidoc = 'Hello *world*!';
 * const html = convert(asciidoc, { standalone: true });
 * // Returns a complete HTML document
 * ```
 */
export function convert(content: string, options: ProcessorOptions = {}): string {
  const html = asciidoctor.convert(content, {
    ...options,
    converter: TpConverter,
  });

  return typeof html === 'string' ? html :  html.toString();
}

/**
 * Converts AsciiDoc content to formatted semantic HTML.
 * 
 * @summary Like convert(), but applies Prettier formatting to the output (async).
 * 
 * @param content - The AsciiDoc source string
 * @param options - Optional Asciidoctor processor options
 * @returns A promise that resolves to the formatted HTML string
 * 
 * @example
 * ```typescript
 * const asciidoc = '* Item 1\n* Item 2';
 * const html = await convertFormatted(asciidoc);
 * // Returns beautifully formatted HTML
 * ```
 * 
 * @example
 * ```typescript
 * const asciidoc = '. Title\n[#id]\nParagraph';
 * const html = await convertFormatted(asciidoc);
 * // Returns formatted with consistent indentation
 * ```
 */
export async function convertFormatted(
  content: string,
  options: ProcessorOptions = {}
): Promise<string> {
  const html = convert(content, options);
  return await formatHtml(html);
}

export { TpConverter, formatHtml };