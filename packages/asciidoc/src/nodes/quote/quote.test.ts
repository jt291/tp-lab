import { describe, it, expect } from 'vitest';
import { TpAsciidoc } from '../../tp-asciidoc.js';

const engine = new TpAsciidoc();

describe('"quote" node conversion', () => {
  it('should convert a quote node', () => {
    const input = '\n____\nExample quote content\n____\n'; // input representing a quote asciidoc node
    const output =  engine.convert(input);
    console.log(output);
    expect(output).toBe('<blockquote><p>Example quote content</p></blockquote>')
  });
});
