import type { Registry, Document as AsciidoctorDocument, Block } from '../../libs/asciidoctor.js';
import { /*generateContent,*/ generateParagraphs, type TYPE } from "./generate.js";

/*
export function generateLorem(type: TYPE, length: number | string = '3-5', wordsPerSentence: number | string = '4-16'): string {
  return generateContent(type, length, wordsPerSentence);
}
*/

/**
 * Extension [`asciidoctor.js`](https://docs.asciidoctor.org/asciidoctor.js/latest/extend/extensions/).
 *
 * Enregistre le macro-bloc `lorem-ipsum-it::[]` ([_block macro processor_](https://docs.asciidoctor.org/asciidoctor.js/latest/extend/extensions/block-macro-processor/)) et le traite.
 * @param registry
 * @returns
 */
export function loremBlockMacroExtension(registry: Registry) {
  registry.blockMacro(function() {
    this.named('lorem');
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    this.process(function(parent: AsciidoctorDocument, target: string, attrs: any) {
      const type = target || 'paragraph';
      const id = attrs.id ? ` id="${attrs.id}"` : '';
      const classes = attrs.role ? ` class="${attrs.role}"` : '';
      const length = attrs.length || '1-3';
      const wordsPerSentence = attrs.words_per_sentence || '4-16';
      const otherAttributes = { ...attrs };
      for (const key of ['id', 'role', 'length', 'words_per_sentence']) {
        delete otherAttributes[key];
      }
      const content = generateParagraphs(length, wordsPerSentence);
      for (const par of content) {
        parent.append(this.createBlock(parent, 'paragraph', par, otherAttributes));
      }
    })
  })
  return registry
}


