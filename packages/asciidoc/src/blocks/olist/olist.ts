/**
 * Converts an Asciidoctor ordered list (olist) to semantic HTML.
 * 
 * @module
 * @category Blocks
 */

import type { List, ListItem } from '@asciidoctor/core';
import {
  buildClassAttributeString,
  buildIdAttributeString,
  buildOtherAttributesString,
  buildTitleMarkup,
  hasOption,
} from '../../utilities/attributes.js';

/**
 * Converts an Asciidoctor ordered list (olist) to semantic HTML.
 * 
 * @summary Transforms an ordered list node into an `<ol>` element, removing unnecessary wrapper divs.
 * 
 * @param node - The Asciidoctor list node
 * @returns The HTML string representation of the ordered list
 * 
 * @example
 * ```typescript
 * // AsciiDoc:  
 * // .  Item 1
 * // . Item 2
 * convertOlist(node)
 * // Returns: 
 * // <ol>
 * //   <li>Item 1</li>
 * //   <li>Item 2</li>
 * // </ol>
 * ```
 * 
 * @example
 * ```typescript
 * // AsciiDoc with custom start:  
 * // [start=5]
 * // . Item 5
 * // .  Item 6
 * convertOlist(node)
 * // Returns:
 * // <ol start="5">
 * //   <li>Item 5</li>
 * //   <li>Item 6</li>
 * // </ol>
 * ```
 * 
 * @example
 * ```typescript
 * // AsciiDoc:  
 * // [%collapsible%open]
 * // . My List
 * // .  Item 1
 * // .  Item 2
 * convertOlist(node)
 * // Returns:
 * // <details open>
 * //   <summary>My List</summary>
 * //   <ol>
 * //     <li>Item 1</li>
 * //     <li>Item 2</li>
 * //   </ol>
 * // </details>
 * ```
 */
export function convertOlist(node: List): string {
  const idAttribute = buildIdAttributeString(node);
  const classAttribute = buildClassAttributeString(node);
  const title = buildTitleMarkup(node);

  // Build start attribute if present
  const startAttr = node.getAttribute('start');
  const startAttribute = startAttr ? ` start="${startAttr}"` : '';

  // Build type attribute if present (1, a, A, i, I)
  const styleAttr = node.getAttribute('style');
  let typeAttribute = '';
  if (styleAttr && styleAttr !== 'arabic') {
    const typeMap:  Record<string, string> = {
      'arabic': '1',
      'loweralpha': 'a',
      'upperalpha': 'A',
      'lowerroman': 'i',
      'upperroman': 'I',
    };
    const htmlType = typeMap[styleAttr] || '1';
    typeAttribute = ` type="${htmlType}"`;
  }

  // Get other attributes, but exclude 'style' since it's handled above
  const otherAttributes = buildOtherAttributesString(node, {}, ['style']);

  const items = node.getItems();
  const itemsHtml = items.map(item => convertListItem(item as ListItem)).join('\n');

  // Collapsible list (using HTML <details> element)
  if (hasOption(node, 'collapsible')) {
    const isOpen = hasOption(node, 'open');
    const summaryTitle = node.getTitle() || 'Details';

    return `
<details${isOpen ? ' open' : ''}>
  <summary>${summaryTitle}</summary>
  <ol${idAttribute}${classAttribute}${startAttribute}${typeAttribute}${otherAttributes}>
${itemsHtml}
  </ol>
</details>`.trim();
  }

  // Standard ordered list
  return `
${title}
<ol${idAttribute}${classAttribute}${startAttribute}${typeAttribute}${otherAttributes}>
${itemsHtml}
</ol>`.trim();
}

/**
 * Converts a single ordered list item to HTML.
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
 * // . Parent
 * // ..  Child 1
 * // .. Child 2
 * convertListItem(item)
 * // Returns:
 * //   <li>
 * //     <p>Parent</p>
 * //     <ol>
 * //       <li>Child 1</li>
 * //       <li>Child 2</li>
 * //     </ol>
 * //   </li>
 * ```
 */
function convertListItem(item: ListItem): string {
  const text = item.getText();
  const blocks = item.getBlocks();

  // Item with nested blocks (paragraphs, code, sublists, etc.)
  if (blocks && blocks.length > 0) {
    const blocksHtml = blocks
      .map(block => block.convert())
      .join('\n    ');

    return text
      ?  `  <li>\n    <p>${text}</p>\n    ${blocksHtml}\n  </li>`
      : `  <li>\n    ${blocksHtml}\n  </li>`;
  }

  // Simple item (just text)
  return `  <li>${text}</li>`;
}
