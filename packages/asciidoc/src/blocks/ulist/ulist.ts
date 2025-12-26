/**
 * Unordered list (ulist) block converter.
 * 
 * @module
 * @category Converters
 * @subcategory Blocks
 */

import type { AbstractBlock, List, ListItem } from '@asciidoctor/core';
import {
  buildIdAttributeString,
  buildClassAttributeString,
  buildOtherAttributesString,
  buildTitleMarkup,
  hasOption,
} from '../../utilities/attributes.js';

/**
 * Converts an Asciidoctor unordered list (ulist) to semantic HTML.
 * 
 * @summary Transforms an unordered list node into a `<ul>` element, removing unnecessary wrapper divs.
 * 
 * @param node - The Asciidoctor list node
 * @returns The HTML string representation of the unordered list
 * 
 * @example
 * ```typescript
 * // AsciiDoc: 
 * // * Item 1
 * // * Item 2
 * convertUlist(node)
 * // Returns:
 * // <ul>
 * //   <li>Item 1</li>
 * //   <li>Item 2</li>
 * // </ul>
 * ```
 * 
 * @example
 * ```typescript
 * // AsciiDoc: 
 * // [%collapsible%open]
 * // . My List
 * // * Item 1
 * // * Item 2
 * convertUlist(node)
 * // Returns:
 * // <details open>
 * //   <summary>My List</summary>
 * //   <ul>
 * //     <li>Item 1</li>
 * //     <li>Item 2</li>
 * //   </ul>
 * // </details>
 * ```
 */
export function convertUlist(node: List): string {
  const idAttribute = buildIdAttributeString(node);
  const classAttribute = buildClassAttributeString(node);
  const otherAttributes = buildOtherAttributesString(node);
  const title = buildTitleMarkup(node);

  const items = node.getItems();
  const itemsHtml = items.map(item => convertListItem(item as ListItem)).join('\n');

  // Collapsible list (using HTML <details> element)
  if (hasOption(node, 'collapsible')) {
    const isOpen = hasOption(node, 'open');
    const summaryTitle = node.getTitle() || 'Details';

    return `
${title ?  `<h6>${summaryTitle}</h6>` : ''}
<details${isOpen ? ' open' : ''}>
  <summary>${summaryTitle}</summary>
  <ul${idAttribute}${classAttribute}${otherAttributes}>
${itemsHtml}
  </ul>
</details>`.trim();
  }

  // Standard unordered list
  return `
${title}
<ul${idAttribute}${classAttribute}${otherAttributes}>
${itemsHtml}
</ul>`.trim();
}

/**
 * Converts a single list item to HTML.
 * 
 * @summary Transforms a list item into an `<li>` element, handling nested content intelligently.
 * 
 * @param item - The Asciidoctor list item node
 * @returns The HTML string representation of the list item
 * 
 * @example
 * ```typescript
 * // Simple item
 * convertListItem(item) // Returns: '  <li>Simple text</li>'
 * ```
 * 
 * @example
 * ```typescript
 * // Item with nested list
 * // * Parent
 * // ** Child 1
 * // ** Child 2
 * convertListItem(item)
 * // Returns:
 * //   <li>
 * //     <p>Parent</p>
 * //     <ul>
 * //       <li>Child 1</li>
 * //       <li>Child 2</li>
 * //     </ul>
 * //   </li>
 * ```
 */
function convertListItem(item: ListItem): string {
  const text = item.getText();
  const blocks = item.getBlocks();

  // Item with nested blocks (paragraphs, code, sublists, etc.)
  if (blocks && blocks.length > 0) {
    const blocksHtml = blocks
      .map(block => {
        // Handle nested sublists
        if (block.getContext() === 'ulist') {
          return convertUlist(block as List);
        }
        // Let the main converter handle other block types
        return block.convert();
      })
      .join('\n');

    return `  <li>
    <p>${text}</p>
${blocksHtml}
  </li>`;
  }

  // Simple item:  wrap in <p> if text is long or contains HTML
  if (text && (text.includes('<') || text.length > 80)) {
    return `  <li><p>${text}</p></li>`;
  }

  // Very simple item: no <p> wrapper needed
  return `  <li>${text}</li>`;
}