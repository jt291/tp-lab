import { describe, it, expect } from 'vitest';
import { convert } from '../../index.js';

describe('"quote" node conversion', () => {
  it('should convert a quote node', () => {
    const input = ''; // input representing a quote asciidoc node
    const output = convert(input);
    expect(output).toBe('<quote>Example quote content</quote>')
  });
});
