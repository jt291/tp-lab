/**
 * Converts an AsciiDoctor `quote` node to an HTML semantic equivalent.
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

export function convertQuote(node: AbstractBlock): string {
  // TODO: Implement conversion logic for the `quote` node.
  return `<quote>${node.getContent()}</quote>`;
}
