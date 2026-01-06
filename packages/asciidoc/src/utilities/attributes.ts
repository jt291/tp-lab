/**
 * Utility functions for handling Asciidoctor node attributes.
 * 
 * @module
 * @category Utilities
 */

import type { AbstractBlock } from '@asciidoctor/core';
import { escapeHtml } from './strings.js';

/**
 * Builds the id attribute string for an HTML element. 
 * 
 * @summary Extracts the id from an Asciidoctor node and formats it as an HTML attribute.
 * 
 * @param node - The Asciidoctor block node
 * @returns The formatted id attribute string (e.g., ` id="myid"`) or empty string if no id
 * 
 * @example
 * ```typescript
 * // AsciiDoc:  [#myid]
 * buildIdAttributeString(node) // Returns: ' id="myid"'
 * ```
 * 
 * @example
 * ```typescript
 * // AsciiDoc: (no id)
 * buildIdAttributeString(node) // Returns: ''
 * ```
 */
export function buildIdAttributeString(node: AbstractBlock): string {
  const id = node.getId() || '';
  return id ?  ` id="${id}"` : '';
}

/**
 * Builds the class attribute string for an HTML element. 
 * 
 * @summary Combines node roles and additional classes into a single class attribute. 
 * 
 * @param node - The Asciidoctor block node
 * @param additionalClasses - Optional array of additional CSS classes to add
 * @returns The formatted class attribute string (e.g., ` class="role1 role2"`) or empty string
 * 
 * @example
 * ```typescript
 * // AsciiDoc: [. primary. highlight]
 * buildClassAttributeString(node) // Returns: ' class="primary highlight"'
 * ```
 * 
 * @example
 * ```typescript
 * // AsciiDoc: [.primary]
 * buildClassAttributeString(node, ['custom']) // Returns: ' class="primary custom"'
 * ```
 */
export function buildClassAttributeString(
  node: AbstractBlock,
  additionalClasses:  string[] = []
): string {
  const classes = [... new Set([...node.getRoles(), ...additionalClasses])];
  return classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
}

/**
 * Builds additional HTML attributes string, excluding id, role, and title.
 * 
 * @summary Extracts custom attributes from the node and formats them as HTML attributes.
 * 
 * @param node - The Asciidoctor block node
 * @param additionalAttributes - Optional record of additional attributes to add
 * @param excludeAttributes - Optional array of attribute names to exclude
 * @returns The formatted attributes string (e.g., ` data-test="value"`)
 * 
 * @example
 * ```typescript
 * // AsciiDoc:  [data-test=value,aria-label=info]
 * buildOtherAttributesString(node) // Returns: ' data-test="value" aria-label="info"'
 * ```
 * 
 * @example
 * ```typescript
 * buildOtherAttributesString(node, { 'data-custom': 'extra' })
 * // Returns: ' data-test="value" data-custom="extra"'
 * ```
 * 
 * @example
 * ```typescript
 * buildOtherAttributesString(node, {}, ['style'])
 * // Returns: ' data-test="value"' (style is excluded)
 * ```
 */
export function buildOtherAttributesString(
  node: AbstractBlock,
  additionalAttributes:  Record<string, string> = {},
  excludeAttributes:  string[] = []
): string {
  const allAttributes = { ...node.getAttributes(), ...additionalAttributes };
  const defaultExclusions = ['id', 'role', 'style','title', '$positional'];
  const allExclusions = [...defaultExclusions, ...excludeAttributes];
  
  const attributesKeys = Object.keys(allAttributes).filter(
    attr =>
      !allExclusions. includes(attr) &&
      !attr.endsWith('-option')
  );

  return attributesKeys
    .map(attr => {
      const value = allAttributes[attr];
      return value ? ` ${attr}="${escapeHtml(String(value))}"` : '';
    })
    .join('');
}
/**
 * Extracts options from a node's attributes.
 * 
 * @summary Gets all options (attributes ending with '-option') from the node. 
 * 
 * @param node - The Asciidoctor block node
 * @param additionalOptions - Optional array of additional options to include
 * @returns Array of option names (without the '-option' suffix)
 * 
 * @example
 * ```typescript
 * // AsciiDoc: [%collapsible%open]
 * getOptions(node) // Returns: ['collapsible', 'open']
 * ```
 * 
 * @example
 * ```typescript
 * // AsciiDoc: [%collapsible]
 * getOptions(node, ['custom']) // Returns: ['collapsible', 'custom']
 * ```
 */
export function getOptions(node: AbstractBlock, additionalOptions:  string[] = []): string[] {
  const attributes = node.getAttributes() || {};
  const optionsKeys = Object.keys(attributes).filter(attr => attr.endsWith('-option'));
  const optionsFromAttributes = optionsKeys.map(attr => attr.replace('-option', ''));
  return [... new Set([...optionsFromAttributes, ...additionalOptions])];
}

/**
 * Checks if a node has a specific option.
 * 
 * @summary Convenience method to check for the presence of an option. 
 * 
 * @param node - The Asciidoctor block node
 * @param option - The option name to check for
 * @returns True if the option is present, false otherwise
 * 
 * @example
 * ```typescript
 * // AsciiDoc: [%collapsible]
 * hasOption(node, 'collapsible') // Returns: true
 * ```
 * 
 * @example
 * ```typescript
 * // AsciiDoc: [%collapsible]
 * hasOption(node, 'open') // Returns: false
 * ```
 */
export function hasOption(node: AbstractBlock, option: string): boolean {
  return getOptions(node).includes(option);
}

/**
 * Builds the title markup for a block.
 * 
 * @summary Creates an HTML heading element for the block's title if it exists.
 * 
 * @param node - The Asciidoctor block node
 * @param tag - The HTML tag to use for the title (default: 'h6')
 * @returns The formatted title HTML or empty string if no title
 * 
 * @example
 * ```typescript
 * // AsciiDoc: . My Block Title
 * buildTitleMarkup(node) // Returns: '<h6>My Block Title</h6>'
 * ```
 * 
 * @example
 * ```typescript
 * // AsciiDoc: .My Block Title
 * buildTitleMarkup(node, 'h5') // Returns: '<h5>My Block Title</h5>'
 * ```
 */
export function buildTitleMarkup(node: AbstractBlock, tag = 'summary'): string {
  if (!node.hasTitle()) {
    return '';
  }
  const title = node.getCaptionedTitle();
  return `<${tag}>${escapeHtml(title)}</${tag}>`;
}

