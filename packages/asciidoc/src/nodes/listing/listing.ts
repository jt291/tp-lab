/**
 * Converts an Asciidoctor listing node to semantic HTML.
 * 
 * @module
 * @category Nodes
 */


import { codeToHtml, createHighlighter } from 'shiki';
import type { AbstractBlock } from '../../libs/asciidoctor.js';
import {
  buildClassAttributeString,
  buildIdAttributeString,
  buildOtherAttributesString,
  buildTitleMarkup,
  hasOption,
} from '../../utilities/attributes.js';
import { shikiHighlighter } from '../../utilities/shiki.js';

const shikiThemes = {
  light: 'light-plus',
  dark: 'dark-plus',
};

const langs = [
  'adoc', 'asciidoc', 
  'bash', 
  'css', 
  'html', 
  'javascript', 'js', 'json', 'jsx',
  'md', 'markdown',
  'plaintext', 'prolog', 'py', 'python',
  'sql',
  'ts', 'tsx', 'typescript',
  'yaml',
]

const highlighter = await createHighlighter({
  themes: [shikiThemes.light, shikiThemes.dark],
  langs: langs,
})

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
  const document = node.getDocument();
  const style = node.getStyle();
  const idAttribute = buildIdAttributeString(node);
  const classAttribute = buildClassAttributeString(node, style === 'source' ? ['highlight'] : []);
  const otherAttributes = buildOtherAttributesString(node, {}, ['style', 'language']);
  const title = buildTitleMarkup(node);
  const language = node.getAttribute('language') || 'plaintext';
  const content = node.getContent() || '';
  const theme = document.getAttribute("shiki-theme") || shikiThemes.dark; // Default to dark theme
  const isOpen = hasOption(node, 'open');
  const isCollapsible = hasOption(node, 'collapsible');

  const highlightedContent = shikiHighlighter(content, language, theme);
  const defaultConversion = `<pre${idAttribute}${classAttribute}${otherAttributes}><code class="language-${language}">${highlightedContent}</code></pre>`;
  if (title) {
    const containerTag = isCollapsible ? 'details' : 'article';
    const open = isCollapsible && isOpen ? ' open' : '';
    const summary = title ?? "<summary>Details</summary>";
    return `<${containerTag}${open}>${summary}${defaultConversion}</${containerTag}>`;
  }
    const summary = title ?? "<summary>Details</summary>";
    const open = isOpen ? ' open' : '';
    
  
  return defaultConversion;
}