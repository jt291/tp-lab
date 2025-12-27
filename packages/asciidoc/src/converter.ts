/**
 * Custom Asciidoctor converter implementation.
 * 
 * @module
 * @category Converters
 */

import Asciidoctor from '@asciidoctor/core';
import type { AbstractNode, AbstractBlock, Section, List, Html5Converter } from '@asciidoctor/core';
import { convertDlist } from './blocks/dlist/dlist.js';
import { convertInlineBreak } from './blocks/inline_break/inline_break.js';
import { convertInlineFootnote } from './blocks/inline_footnote/inline_footnote.js';
import { convertListing } from './blocks/listing/listing.js';
import { convertParagraph } from './blocks/paragraph/paragraph.js';
import { convertSection } from './blocks/section/section.js';
import { convertUlist } from './blocks/ulist/ulist.js';
import { convertOlist } from './blocks/olist/olist.js';
import { convertLiteral } from './blocks/literal/literal.js';

/**
 * Custom Asciidoctor converter that generates semantic HTML.
 * 
 * @summary Extends the default HTML5 converter to produce cleaner, more semantic HTML output.
 * This converter removes unnecessary wrapper divs and uses modern HTML5 elements where appropriate.
 * 
 * @example
 * ```typescript
 * const asciidoctor = Asciidoctor();
 * const html = asciidoctor.convert(content, {
 *   converter: TpConverter
 * });
 * ```
 */
export class TpConverter {
  /** The base HTML5 converter used as fallback for unhandled node types */
  public baseConverter: Html5Converter;
  
  /** The output backend format (always 'html5') */
  public backend = 'html5';
  
  /** The file extension for output files */
  public outfilesuffix = '.html';

  constructor() {
    const asciidoctor = Asciidoctor();
    this.baseConverter = asciidoctor.Html5Converter. create();
  }

  /**
   * Converts an Asciidoctor node to HTML.
   * 
   * @summary Routes nodes to specialized conversion functions based on their type. 
   * Falls back to the base converter for unhandled node types.
   * 
   * @param node - The Asciidoctor node to convert
   * @param transform - Optional transform name (for context-specific conversions)
   * @returns The HTML string representation of the node
   * 
   * @example
   * ```typescript
   * // Called internally by Asciidoctor
   * converter.convert(paragraphNode) // Returns:  '<p>... </p>'
   * ```
   */
  convert(node: AbstractNode, transform?:  string): string {
    let html = '';
    const nodeName = node.getNodeName();

    switch (nodeName) {
      case 'dlist':
        //html = convertDlist(node as List);
        break;
      case 'inline_break':
        //html = convertInlineBreak(node);
        break;
      case 'inline_footnote':
        //html = convertInlineFootnote(node);
        break;
      case 'listing':
        html = convertListing(node as AbstractBlock);
        break;
      case 'literal':
        html = convertLiteral(node as AbstractBlock);
        break;
      case 'paragraph':
        html = convertParagraph(node as AbstractBlock);
        break;
      case 'section':
        //html = convertSection(node as Section);
        break;
      case 'ulist':
        html = convertUlist(node as List);
        break;
      case 'olist':
        html = convertOlist(node as List);
        break;
      default:
        // Use base converter for unhandled node types
        html = this.baseConverter.convert(node, transform);
    }

    return html;
  }
}