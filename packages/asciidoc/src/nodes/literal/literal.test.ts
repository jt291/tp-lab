import { describe, it, expect } from 'vitest';
import { convert } from '../../index.js';

describe('"literal" node conversion', () => {
  it('should convert a simple literal block', () => {
    const input = `.... 
This is literal text
....`;
    const output = convert(input);
    
    expect(output).toMatch(/<pre[^>]*>/);
    expect(output).toContain('This is literal text');
    expect(output).toContain('</pre>');
    expect(output).not.toContain('<div class="literal">');
    expect(output).not.toContain('style=');
  });

  it('should preserve whitespace and indentation', () => {
    const input = `....
Line 1
    Indented line
        More indented
.... `;
    const output = convert(input);
    
    expect(output).toMatch(/<pre[^>]*>/);
    expect(output).toContain('    Indented line');
    expect(output).toContain('        More indented');
  });

  it('should escape HTML characters', () => {
    const input = `....
<html>
  <body>Hello & goodbye</body>
</html>
....`;
    const output = convert(input);
    
    expect(output).toContain('&lt;html&gt;');
    expect(output).toContain('&lt;body&gt;');
    expect(output).toContain('Hello &amp; goodbye');
    expect(output).not.toContain('<html>');
  });

  it('should handle id and class attributes', () => {
    const input = `[#mycode.terminal]
....
$ ls -la
....`;
    const output = convert(input);
    
    expect(output).toContain('id="mycode"');
    expect(output).toContain('class="terminal"');
  });

  it('should handle custom attributes', () => {
    const input = `[data-lang=text]
....
Plain text content
....`;
    const output = convert(input);
    
    expect(output).toContain('data-lang="text"');
  });

  it('should handle title', () => {
    const input = `.Output Example
....
Result:  Success
....`;
    const output = convert(input);
    
    expect(output).toContain('<h6>Output Example</h6>');
    expect(output).toMatch(/<pre[^>]*>/);
  });

  it('should handle literal block with indentation syntax', () => {
    const input = `    This is a literal paragraph
    with indentation`;
    const output = convert(input);
    
    expect(output).toMatch(/<pre[^>]*>/);
    expect(output).toContain('This is a literal paragraph');
  });

  it('should handle multiple lines with blank lines', () => {
    const input = `....
First line

Second line after blank

Third line
....`;
    const output = convert(input);
    
    expect(output).toContain('First line');
    expect(output).toContain('Second line after blank');
    expect(output).toContain('Third line');
  });

  it('should convert collapsible literal block (closed)', () => {
    const input = `[%collapsible]
.Show Configuration
....
config.setting=value
....`;
    const output = convert(input);
    
    expect(output).toContain('<details>');
    expect(output).toContain('<summary>Show Configuration</summary>');
    expect(output).toMatch(/<pre[^>]*>/);
    expect(output).not.toContain('details open');
  });

  it('should convert collapsible literal block (open)', () => {
    const input = `[%collapsible%open]
.Debug Output
....
ERROR: Something went wrong
....`;
    const output = convert(input);
    
    expect(output).toContain('<details open>');
    expect(output).toContain('<summary>Debug Output</summary>');
    expect(output).toMatch(/<pre[^>]*>/);
  });

  it('should handle complex example with all attributes', () => {
    const input = `.Server Log
[#log.output%collapsible%open,data-type=log]
.... 
[INFO] Server started
[WARN] Low memory
....`;
    const output = convert(input);
    
    expect(output).toContain('id="log"');
    expect(output).toContain('class="output"');
    expect(output).toContain('data-type="log"');
    expect(output).toContain('<details open>');
    expect(output).toContain('<summary>Server Log</summary>');
    expect(output).toContain('[INFO] Server started');
  });

  it('should handle special characters in content', () => {
    const input = `....
"Quotes" & 'apostrophes'
<tags> and symbols:  @#$%
....`;
    const output = convert(input);
    
    // Asciidoctor escapes <, >, & but not quotes in literal blocks
    expect(output).toContain('"Quotes"');
    expect(output).toContain('&amp;');
    expect(output).toContain("'apostrophes'");
    expect(output).toContain('&lt;tags&gt;');
    expect(output).toContain('symbols:  @#$%');
  });
  
  it('should not process inline formatting', () => {
    const input = `....
*This should not be bold*
_This should not be italic_
\`This should not be code\`
....`;
    const output = convert(input);
    
    expect(output).toContain('*This should not be bold*');
    expect(output).toContain('_This should not be italic_');
    expect(output).toContain('`This should not be code`');
    expect(output).not.toContain('<strong>');
    expect(output).not.toContain('<em>');
  });
});