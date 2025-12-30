/**
 * Converts an Asciidoctor listing node to semantic HTML.
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
 * Converts an Asciidoctor listing block to semantic HTML.
 * 
 * @summary Transforms a listing block into `<pre><code>` elements for displaying source code.
 * Listing blocks are intended for source code with optional syntax highlighting support.
 * 
 * @param node - The Asciidoctor listing block node
 * @returns The HTML string representation of the listing block
 * 
 * @example
 * ```typescript
 * // AsciiDoc: 
 * // [source,javascript]
 * // ----
 * // console.log("Hello");
 * // ----
 * convertListing(node)
 * // Returns: 
 * // <pre><code class="language-javascript">console.log("Hello");</code></pre>
 * ```
 * 
 * @example
 * ```typescript
 * // AsciiDoc with title:
 * // . Example Code
 * // [source,python]
 * // ----
 * // print("Hello")
 * // ----
 * convertListing(node)
 * // Returns:
 * // <h6>Example Code</h6>
 * // <pre><code class="language-python">print("Hello")</code></pre>
 * ```
 * 
 * @example
 * ```typescript
 * // AsciiDoc collapsible:
 * // [%collapsible%open]
 * // . Show Code
 * // [source,java]
 * // ----
 * // System.out.println("Hello");
 * // ----
 * convertListing(node)
 * // Returns:
 * // <details open>
 * //   <summary>Show Code</summary>
 * //   <pre><code class="language-java">System.out.println("Hello");</code></pre>
 * // </details>
 * ```
 */
export function convertListing(node: AbstractBlock): string {
  const idAttribute = buildIdAttributeString(node);
  const title = buildTitleMarkup(node);
  
  // Get language for syntax highlighting
  const language = node.getAttribute('language');
  const codeClasses = language ? [`language-${language}`] : [];
  
  // Build class attribute for <code> element
  const codeClassAttribute = codeClasses.length > 0 
    ? ` class="${codeClasses.join(' ')}"` 
    : '';
  
  // Build class attribute for <pre> element (includes roles but not language)
  const preClassAttribute = buildClassAttributeString(node);
  
  // Exclude 'style' attribute as Asciidoctor adds it automatically
  const otherAttributes = buildOtherAttributesString(node, {}, ['style', 'language']);
  
  // Get content - Asciidoctor already escapes HTML
  const content = node.getContent() || '';

  // Collapsible listing block (using HTML <details> element)
  if (hasOption(node, 'collapsible')) {
    const isOpen = hasOption(node, 'open');
    const summaryTitle = node.getTitle() || 'Details';

    return `
<details${isOpen ? ' open' : ''}>
  <summary>${summaryTitle}</summary>
  <pre${idAttribute}${preClassAttribute}${otherAttributes}><code${codeClassAttribute}>${content}</code></pre>
</details>`.trim();
  }

  // Standard listing block
  return `
${title}
<pre${idAttribute}${preClassAttribute}${otherAttributes}><code${codeClassAttribute}>${content}</code></pre>`.trim();
}
