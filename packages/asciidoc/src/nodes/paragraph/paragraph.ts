/**
 * Converts an Asciidoctor paragraph node to semantic HTML.
 * 
 * @module
 * @category Nodes
 */

import type { AbstractBlock } from '@asciidoctor/core';
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

  // Collapsible paragraph (using HTML <details> element)
  if (hasOption(node, 'collapsible')) {
    const isOpen = hasOption(node, 'open');
    const title = node.getTitle() || 'Details';

    return `
<details${isOpen ? ' open' : ''}>
  <summary>${title}</summary>
  <p${idAttribute}${classAttribute}${otherAttributes}>${content}</p>
</details>`.trim();
  }

  // Standard paragraph with optional title
  const titleMarkup = buildTitleMarkup(node);

  return `
${titleMarkup}
<p${idAttribute}${classAttribute}${otherAttributes}>${content}</p>`.trim();
}