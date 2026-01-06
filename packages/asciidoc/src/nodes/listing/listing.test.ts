import { describe, it, expect } from 'vitest';
import { TpAsciidoc } from '../../tp-asciidoc.js';

const engine = new TpAsciidoc();

describe('"listing" node conversion', () => {
  it('should convert a simple listing node', () => {
    const input = `----
Code goes here
----`;
    const output = engine.convert(input);
    
    expect(output).toMatch(/<pre[^>]*>/);
    expect(output).toMatch(/<code[^>]*>/);
    expect(output).toContain('Code goes here');
    expect(output).toContain('</code></pre>');
    expect(output).not.toContain('<div class="listingblock">');
  });

  it('should preserve whitespace and indentation', () => {
    const input = `----
function test() {
  return true;
}
----`;
    const output = engine.convert(input);
    
    expect(output).toContain('function test()');
    expect(output).toContain('  return true;');
  });

  it('should handle source with language attribute', () => {
    const input = `[source,javascript]
----
console.log("Hello");
----`;
    const output = engine.convert(input);
    
    expect(output).toContain('<code class="language-javascript" data-lang="javascript">');
    expect(output).toContain('console.log("Hello")');
  });

  it('should handle multiple language types', () => {
    const inputs = [
      { lang: 'python', code: 'print("Hello")' },
      { lang: 'java', code: 'System.out.println("Hello");' },
      { lang: 'ruby', code: 'puts "Hello"' },
    ];

    for (const { lang, code } of inputs) {
      const input = `[source,${lang}]
----
${code}
----`;
      const output = engine.convert(input);
      expect(output).toContain(`class="language-${lang}"`);
      expect(output).toContain(code);
    }
  });

  it('should escape HTML characters', () => {
    const input = `----
<html>
  <body>Content & more</body>
</html>
----`;
    const output = engine.convert(input);
    
    expect(output).toContain('&lt;html&gt;');
    expect(output).toContain('&lt;body&gt;');
    expect(output).toContain('&amp;');
    expect(output).not.toContain('<html>');
  });

  it('should handle id and class attributes', () => {
    const input = `[#mycode.highlight]
----
code here
----`;
    const output = engine.convert(input);
    
    expect(output).toContain('id="mycode"');
    expect(output).toContain('class="highlight"');
  });

  it('should handle custom attributes', () => {
    const input = `[source,javascript,data-line=5]
----
const x = 42;
----`;
    const output = engine.convert(input);
    
    expect(output).toContain('data-line="5"');
    expect(output).toContain('class="language-javascript"');
  });

  it('should handle title', () => {
    const input = `.My Code Example
[source,python]
----
print("test")
----`;
    const output = engine.convert(input);
    
    expect(output).toContain('<summary>My Code Example</summary>');
    expect(output).toContain('<pre');
    expect(output).toContain('class="language-python"');
  });

  it('should handle listing without source attribute', () => {
    const input = `----
Plain code block
No language specified
----`;
    const output = engine.convert(input);
    
    expect(output).toContain('<code class="language-plaintext" data-lang="plaintext">');
    expect(output).toContain('Plain code block');
  });

  it('should handle multiple lines with blank lines', () => {
    const input = `[source,javascript]
----
function first() {}

function second() {}
----`;
    const output = engine.convert(input);
    
    expect(output).toContain('function first()');
    expect(output).toContain('function second()');
  });

  it('should convert collapsible listing block (closed)', () => {
    const input = `[%collapsible]
.Show Code
[source,javascript]
----
alert("Hello");
----`;
    const output = engine.convert(input);
    
    expect(output).toContain('<details>');
    expect(output).toContain('<summary>Show Code</summary>');
    expect(output).toContain('<code class="language-javascript" data-lang="javascript">');
    expect(output).not.toContain('details open');
  });

  it('should engine.convert collapsible listing block (open)', () => {
    const input = `[%collapsible%open]
.Code Sample
[source,python]
----
print("test")
----`;
    const output = engine.convert(input);
    
    expect(output).toContain('<details open>');
    expect(output).toContain('<summary>Code Sample</summary>');
    expect(output).toContain('class="language-python"');
  });

  it('should handle complex example with all attributes', () => {
    const input = `.Server Code
[source,javascript]
[#server.backend%collapsible%open,data-file=server.js]
----
const express = require('express');
----`;
    const output = engine.convert(input);
    
    expect(output).toContain('id="server"');
    expect(output).toContain('class="backend highlight"');
    expect(output).toContain('data-file="server.js"');
    expect(output).toContain('<details open>');
    expect(output).toContain('<summary>Server Code</summary>');
    expect(output).toContain('class="language-javascript"');
  });

  it('should handle code with special characters', () => {
    const input = `[source,javascript]
----
const msg = "Hello & 'Goodbye'";
if (x < 10 && y > 5) {}
----`;
    const output = engine.convert(input);
    
    expect(output).toContain('&amp;');
    expect(output).toContain('&lt;');
    expect(output).toContain('&gt;');
  });

  it('should not process inline formatting', () => {
    const input = `----
*This should not be bold*
_This should not be italic_
----`;
    const output = engine.convert(input);
    
    expect(output).toContain('*This should not be bold*');
    expect(output).toContain('_This should not be italic_');
    expect(output).not.toContain('<strong>');
    expect(output).not.toContain('<em>');
  });

  it('should handle line numbers option', () => {
    const input = `[source,javascript,linenums]
----
line1();
line2();
----`;
    const output = engine.convert(input);
    
    expect(output).toContain('class="language-javascript"');
    expect(output).toContain('line1()');
  });
});