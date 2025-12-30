import { describe, it, expect } from 'vitest';
import { convert } from '../../index.js';

describe('"olist" node conversion', () => {
  it('should convert a simple ordered list', () => {
    const input = `. a
. b
. c`;
    const output = convert(input);
    
    expect(output).toContain('<ol>');
    expect(output).toContain('<li>a</li>');
    expect(output).toContain('<li>b</li>');
    expect(output).toContain('<li>c</li>');
    expect(output).toContain('</ol>');
    expect(output).not.toContain('<div class="olist">');
    expect(output).not.toContain('style='); // Should not have style attribute
  });

  it('should handle id and class attributes', () => {
    const input = `[#mylist.custom]
. item 1
. item 2`;
    const output = convert(input);
    
    expect(output).toContain('id="mylist"');
    expect(output).toContain('class="custom"');
  });

  it('should handle custom attributes', () => {
    const input = `[data-list=test]
. item 1
.  item 2`;
    const output = convert(input);
    
    expect(output).toContain('data-list="test"');
  });

  it('should handle title', () => {
    const input = `.My List Title
. item 1
. item 2`;
    const output = convert(input);
    
    expect(output).toContain('<h6>My List Title</h6>');
  });

  it('should handle start attribute', () => {
    const input = `[start=5]
. item 5
. item 6`;
    const output = convert(input);
    
    expect(output).toContain('start="5"');
  });

  it('should handle numbering type - loweralpha', () => {
    const input = `[loweralpha]
. item a
. item b`;
    const output = convert(input);
    
    expect(output).toContain('<ol');
    expect(output).toContain('type="a"');
  });

  it('should handle numbering type - upperalpha', () => {
    const input = `[upperalpha]
. item A
. item B`;
    const output = convert(input);
    
    expect(output).toContain('type="A"');
  });

  it('should handle numbering type - lowerroman', () => {
    const input = `[lowerroman]
.  item i
. item ii`;
    const output = convert(input);
    
    expect(output).toContain('type="i"');
  });

  it('should handle numbering type - upperroman', () => {
    const input = `[upperroman]
. item I
. item II`;
    const output = convert(input);
    
    expect(output).toContain('type="I"');
  });

  it('should handle nested ordered lists', () => {
    const input = `. a
..  a1
.. a2
. b`;
    const output = convert(input);
    
    expect(output).toMatch(/<ol[^>]*>/); // Match <ol> with any attributes
    expect(output).toContain('<li>a');
    expect(output).toContain('<li>a1</li>');
    expect(output).toContain('<li>a2</li>');
    expect(output).toContain('<li>b</li>');
  });

  it('should handle items with inline formatting', () => {
    const input = `. *bold* text
. _italic_ text
.  \`code\` text`;
    const output = convert(input);
    
    expect(output).toContain('<strong>bold</strong>');
    expect(output).toContain('<em>italic</em>');
    expect(output).toContain('<code>code</code>');
  });

  it('should convert collapsible list (closed)', () => {
    const input = `[%collapsible]
.Toggle List
. item 1
. item 2`;
    const output = convert(input);
    
    expect(output).toContain('<details>');
    expect(output).toContain('<summary>Toggle List</summary>');
    expect(output).not.toContain('details open');
  });

  it('should convert collapsible list (open)', () => {
    const input = `[%collapsible%open]
.Toggle List
. item 1
.  item 2`;
    const output = convert(input);
    
    expect(output).toContain('<details open>');
    expect(output).toContain('<summary>Toggle List</summary>');
  });

  it('should handle complex example with all attributes', () => {
    const input = `.Ma Liste
[#liste.custom%collapsible%open,data-test=value,start=3]
.  Troisième item
. Quatrième item`;
    const output = convert(input);
    
    expect(output).toContain('id="liste"');
    expect(output).toContain('class="custom"');
    expect(output).toContain('data-test="value"');
    expect(output).toContain('start="3"');
    expect(output).toContain('<details open>');
    expect(output).toContain('<summary>Ma Liste</summary>');
  });

  it('should handle mixed nested lists (ol inside ul)', () => {
    const input = `* Unordered item
. Ordered item 1
. Ordered item 2`;
    const output = convert(input);
    
    expect(output).toContain('<ul>');
    expect(output).toMatch(/<ol[^>]*>/); // Match <ol> with any attributes
  });
});