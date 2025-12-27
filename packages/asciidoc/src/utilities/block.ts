/**
 * Utility functions for handling Asciidoctor blocks attributes.
 * 
 * @module
 * @category Utilities
 */

import type { AbstractBlock } from '@asciidoctor/core';
import {
  buildIdAttributeString,
  buildClassAttributeString,
  buildOtherAttributesString,
  buildTitleMarkup,
} from './attributes.js';

/**
 * Builds complete HTML attributes string for a block element.
 * 
 * @summary Combines id, classes, and other attributes into a single string.
 * 
 * @param node - The Asciidoctor block node
 * @param additionalClasses - Optional array of additional CSS classes
 * @param additionalAttributes - Optional record of additional HTML attributes
 * @returns The complete attributes string
 * 
 * @example
 * ```typescript
 * // AsciiDoc:  [#myid. myclass,data-test=value]
 * buildBlockAttributes(node)
 * // Returns: ' id="myid" class="myclass" data-test="value"'
 * ```
 * 
 * @example
 * ```typescript
 * buildBlockAttributes(node, ['extra'], { 'data-custom': 'test' })
 * // Returns: ' id="myid" class="myclass extra" data-test="value" data-custom="test"'
 * ```
 */
export function buildBlockAttributes(
  node: AbstractBlock,
  additionalClasses: string[] = [],
  additionalAttributes: Record<string, string> = {}
): string {
  const id = buildIdAttributeString(node);
  const classes = buildClassAttributeString(node, additionalClasses);
  const others = buildOtherAttributesString(node, additionalAttributes);
  return `${id}${classes}${others}`;
}

/**
 * Wraps content in an HTML container element with block attributes.
 * 
 * @summary Creates a complete HTML block with optional title and attributes.
 * 
 * @param node - The Asciidoctor block node
 * @param content - The inner HTML content
 * @param tag - The HTML tag to use as container (default: 'div')
 * @param additionalClasses - Optional array of additional CSS classes
 * @returns The complete HTML block
 * 
 * @example
 * ```typescript
 * // AsciiDoc: [#myid.myclass]
 * wrapInContainer(node, '<p>Content</p>', 'section')
 * // Returns: '<section id="myid" class="myclass"><p>Content</p></section>'
 * ```
 * 
 * @example
 * ```typescript
 * // AsciiDoc: . My Title
 * // [#myid]
 * wrapInContainer(node, '<p>Content</p>')
 * // Returns: '<h6>My Title</h6>\n<div id="myid"><p>Content</p></div>'
 * ```
 */
export function wrapInContainer(
  node: AbstractBlock,
  content: string,
  tag = 'div',
  additionalClasses: string[] = []
): string {
  const attributes = buildBlockAttributes(node, additionalClasses);
  const title = buildTitleMarkup(node);

  return `
${title}
<${tag}${attributes}>
${content}
</${tag}>`.trim();
}