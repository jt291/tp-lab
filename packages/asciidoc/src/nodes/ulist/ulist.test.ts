import { describe, it, expect } from 'vitest';
import { convert } from '../../index.js';

describe('"ulist" node conversion', () => {
  it('should convert a simple unordered list', () => {
    const input = `* a
* b
* c`;
    const output = convert(input);
    
    expect(output).toContain('<ul>');
    expect(output).toContain('<li>a</li>');
    expect(output).toContain('<li>b</li>');
    expect(output).toContain('<li>c</li>');
    expect(output).toContain('</ul>');
    expect(output).not.toContain('<div class="ulist">');
  });

  it('should handle id and class attributes', () => {
    const input = `[#mylist.custom]
* item 1
* item 2`;
    const output = convert(input);
    
    expect(output).toContain('id="mylist"');
    expect(output).toContain('class="custom"');
  });

  it('should handle custom attributes', () => {
    const input = `[data-list=test]
* item 1
* item 2`;
    const output = convert(input);
    
    expect(output).toContain('data-list="test"');
  });

  it('should handle title', () => {
    const input = `.My List Title
* item 1
* item 2`;
    const output = convert(input);
    
    expect(output).toContain('<h6>My List Title</h6>');
  });

  it('should handle nested lists', () => {
    const input = `* a
** a1
** a2
* b`;
    const output = convert(input);
    
    expect(output).toContain('<ul>');
    expect(output).toContain('<li>a');
    expect(output).toContain('<ul>');
    expect(output).toContain('<li>a1</li>');
    expect(output).toContain('<li>a2</li>');
    expect(output).toContain('<li>b</li>');
  });

  it('should handle items with inline formatting', () => {
    const input = `* *bold* text
* _italic_ text
* \`code\` text`;
    const output = convert(input);
    
    expect(output).toContain('<strong>bold</strong>');
    expect(output).toContain('<em>italic</em>');
    expect(output).toContain('<code>code</code>');
  });

  it('should convert collapsible list (closed)', () => {
    const input = `[%collapsible]
.Toggle List
* item 1
* item 2`;
    const output = convert(input);
    
    expect(output).toContain('<details>');
    expect(output).toContain('<summary>Toggle List</summary>');
    expect(output).not.toContain('open');
  });

  it('should convert collapsible list (open)', () => {
    const input = `[%collapsible%open]
.Toggle List
* item 1
* item 2`;
    const output = convert(input);
    
    expect(output).toContain('<details open>');
    expect(output).toContain('<summary>Toggle List</summary>');
  });

  it('should handle complex example with all attributes', () => {
    const input = `.Ma Liste
[#liste.custom%collapsible%open,data-test=value]
* Premier item
* Deuxième item`;
    const output = convert(input);
    
    expect(output).toContain('id="liste"');
    expect(output).toContain('class="custom"');
    expect(output).toContain('data-test="value"');
    expect(output).toContain('<details open>');
    expect(output).toContain('<summary>Ma Liste</summary>');
  });
});
