/**
 * Converts an Asciidoctor unordered list (ulist) node to semantic HTML.
 * 
 * @module
 * @category Nodes
 */

import type { List, ListItem } from '../../libs/asciidoctor.js';
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
  const title = buildTitleMarkup(node);
  const style = node.getStyle()
  let html = ''
  switch (style) {
    case 'menu':
      html += convertMenuList(node);
      break;
    default:
      html += convertDefault(node);
      break;
  }
  // Collapsible list (using HTML <details> element)
  if (hasOption(node, 'collapsible')) {
    const isOpen = hasOption(node, 'open');
    const summaryTitle = title || '<summary>Details</summary>';
    return `<details${isOpen ? ' open' : ''}>
${summaryTitle}
${html}
</details>
`;
  }
  // Standard unordered list
  return `${title}
${html}
`;
}

export function convertDefault(node: List): string {
  const idAttribute = buildIdAttributeString(node);
  const classAttribute = buildClassAttributeString(node);
  const otherAttributes = buildOtherAttributesString(node);
  const items = node.getItems()
  const itemsHtml = items.map(item => convertListItem(item as ListItem)).join('');
  const html = `<ul${idAttribute}${classAttribute}${otherAttributes}>${itemsHtml}</ul>`;
  return html;
}

export function convertMenuList(node: List): string {
  const idAttribute = buildIdAttributeString(node);
  const classAttribute = buildClassAttributeString(node);
  const otherAttributes = buildOtherAttributesString(node);
  const items = node.getItems()
  const itemsHtml = items.map(item => convertListItem(item as ListItem)).join('');
  const html = `<menu${idAttribute}${classAttribute}${otherAttributes}>${itemsHtml}</menu>`;
  return html;
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
  const text = item.getText()
  const blocks = item.getBlocks();
  // Item with nested blocks (paragraphs, code, sublists, etc.)
  if (blocks.length > 0) {
    const blocksHtml = blocks
      .map(block => {
        // Handle nested sublists
        if (block.getContext() === 'ulist') {
          return convertUlist(block as List);
        }
        // Let the main converter handle other block types
        return block.convert();
      })
      .join('');
    return `<li>${text}${blocksHtml}</li>`;
  }

  if (text?.length > 80) {
    return `<li><p>${text}</p></li>`;
  }
  // Very simple item
  return `<li>${text}</li>`;
}