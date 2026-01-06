/**
 * Converts an Asciidoctor paragraph node to semantic HTML.
 * 
 * @module
 * @category Nodes
 */

import type { AbstractBlock } from '../../libs/asciidoctor.js';
import {
  buildClassAttributeString,
  buildIdAttributeString,
  buildOtherAttributesString,
  buildTitleMarkup,
  hasOption,
} from '../../utilities/attributes.js';

/**
 * Converts an Asciidoctor paragraph block to semantic HTML.
 * 
 * @summary Transforms a paragraph node into a `<p>` element or collapsible `<details>` block.
 * 
 * @param node - The Asciidoctor paragraph block node
 * @returns The HTML string representation of the paragraph
 * 
 * @example
 * ```typescript
 * // AsciiDoc: This is a paragraph. 
 * convertParagraph(node)
 * // Returns: '<p>This is a paragraph.</p>'
 * ```
 * 
 * @example
 * ```typescript
 * // AsciiDoc: [%collapsible%open]
 * // . Click to toggle
 * // Hidden content here. 
 * convertParagraph(node)
 * // Returns:
 * // <details open>
 * //   <summary>Click to toggle</summary>
 * //   <p>Hidden content here.</p>
 * // </details>
 * ```
 */
export function convertParagraph(node: AbstractBlock): string {
  const idAttribute = buildIdAttributeString(node);
  const classAttribute = buildClassAttributeString(node);
  const otherAttributes = buildOtherAttributesString(node);
  const content = node.getContent();
  const title = buildTitleMarkup(node);
  const isOpen = hasOption(node, 'open');
  const isCollapsible = hasOption(node, 'collapsible');
  const defaultConversion = `<p${idAttribute}${classAttribute}${otherAttributes}>${content}</p>`;
  const summary = isCollapsible ? title ?? "<summary>Details</summary>" : title;
  if (title) {
    const containerTag = isCollapsible ? 'details' : 'article';
    const open = isCollapsible && isOpen ? ' open' : '';
    return `<${containerTag}${open}>${summary}${defaultConversion}</${containerTag}>`;
  }
  return defaultConversion;
}