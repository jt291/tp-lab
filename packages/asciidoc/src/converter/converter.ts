/**
 * Custom Asciidoctor converter implementation.
 * 
 * @module
 * @category Converters
 */

import type Asciidoctor from '../libs/asciidoctor.js';

import type { ProcessorOptions, Document as AsciidoctorDocument } from '@asciidoctor/core';
import type { AbstractNode, AbstractBlock, Section, List, Html5Converter } from '@asciidoctor/core';

import * as nodes from '../nodes/nodes.js';
import { formatHtml } from '../utilities/format.js';
import { dedent } from '../utilities/strings.js';
// import { asciidoctorShiki } from '../extensions/shiki/shiki.js';

// const asciidoctor = Asciidoctor();
// asciidoctor.SyntaxHighlighter.register('shiki', asciidoctorShiki)

/**
 * Custom Asciidoctor converter that generates semantic HTML.
 * 
 * This file only contains the TpConverter class. The adoc tagged-template
 * helper is provided from the public entry point (index.ts).
 */
export class TpConverter {
  public baseConverter: Html5Converter;
  public backend = 'html5';
  public outfilesuffix = '.html';

  constructor(asciidoctor: typeof Asciidoctor) {
    const engine = asciidoctor();
    this.baseConverter = engine.Html5Converter.create();
  }

  /**
   * Routes nodes to specialized conversion functions based on their type.
   */
  convert(node: AbstractNode, transform?: string): string {
    let html = '';
    const nodeName = node.getNodeName();
    switch (nodeName) {
      case 'listing':
        html = nodes.convertListing(node as AbstractBlock);
        break;
      case 'literal':
        html = nodes.convertLiteral(node as AbstractBlock);
        break;
      case 'paragraph':
        html = nodes.convertParagraph(node as AbstractBlock);
        break;
      case 'ulist':
        html = nodes.convertUlist(node as List);
        break;
      case 'olist':
        html = nodes.convertOlist(node as List);
        break;
      case 'quote': 
        html = nodes.convertQuote(node as AbstractBlock); 
        break;

        // NODE HANDLING PLACEHOLDER

      default:
        html = this.baseConverter.convert(node, transform);
    }
    return html;
  }
}
