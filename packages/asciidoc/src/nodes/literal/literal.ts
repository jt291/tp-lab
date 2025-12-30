/**
 * Converts an Asciidoctor literal node to semantic HTML. 
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
 * Converts an Asciidoctor literal block to semantic HTML.
 * 
 * @summary Transforms a literal block into a `<pre>` element, preserving whitespace and formatting.
 * Literal blocks display text exactly as written, without processing inline formatting.
 * 
 * @param node - The Asciidoctor literal block node
 * @returns The HTML string representation of the literal block
 * 
 * @example
 * ```typescript
 * // AsciiDoc:  
 * // .... 
 * // This is literal text
 * //     with preserved    spacing
 * // ....
 * convertLiteral(node)
 * // Returns: 
 * // <pre>This is literal text
 * //     with preserved    spacing</pre>
 * ```
 * 
 * @example
 * ```typescript
 * // AsciiDoc with title:
 * // . Configuration File
 * // ....
 * // server. port=8080
 * // server.host=localhost
 * // ....
 * convertLiteral(node)
 * // Returns: 
 * // <h6>Configuration File</h6>
 * // <pre>server.port=8080
 * // server. host=localhost</pre>
 * ```
 * 
 * @example
 * ```typescript
 * // AsciiDoc collapsible:  
 * // [%collapsible%open]
 * // . Show Output
 * // ....
 * // Output text here
 * // ....
 * convertLiteral(node)
 * // Returns:
 * // <details open>
 * //   <summary>Show Output</summary>
 * //   <pre>Output text here</pre>
 * // </details>
 * ```
 */
export function convertLiteral(node: AbstractBlock): string {
  const idAttribute = buildIdAttributeString(node);
  const classAttribute = buildClassAttributeString(node);
  const title = buildTitleMarkup(node);
  
  // Exclude 'style' attribute as Asciidoctor adds it automatically
  const otherAttributes = buildOtherAttributesString(node, {}, ['style']);
  
  // Get content - Asciidoctor already escapes HTML, so we don't need to escape again
  const content = node.getContent() || '';

  // Collapsible literal block (using HTML <details> element)
  if (hasOption(node, 'collapsible')) {
    const isOpen = hasOption(node, 'open');
    const summaryTitle = node.getTitle() || 'Details';

    return `
<details${isOpen ? ' open' : ''}>
  <summary>${summaryTitle}</summary>
  <pre${idAttribute}${classAttribute}${otherAttributes}>${content}</pre>
</details>`.trim();
  }

  // Standard literal block
  return `
${title}
<pre${idAttribute}${classAttribute}${otherAttributes}>${content}</pre>`.trim();
}
