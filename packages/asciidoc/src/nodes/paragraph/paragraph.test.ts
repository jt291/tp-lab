import { describe, it, expect } from 'vitest';
import { TpAsciidoc } from '../../tp-asciidoc.js';

const engine = new TpAsciidoc();

describe('"paragraph" node conversion', () => {
  it('should convert a simple paragraph', () => {
    const input = 'Hello world';
    const output =  engine.convert(input);
    expect(output).toContain('<p>Hello world</p>');
  });

  it('should handle id and class attributes', () => {
    const input = `[#myid.myclass]
Hello world`;
    const output =  engine.convert(input);
    expect(output).toContain('id="myid"');
    expect(output).toContain('class="myclass"');
  });

  it('should handle custom attributes', () => {
    const input = `[data-test=value]
Hello world`;
    const output =  engine.convert(input);
    expect(output).toContain('data-test="value"');
  });

  it('should handle title', () => {
    const input = `.My Title
Hello world`;
    const output =  engine.convert(input);
    expect(output).toContain('<summary>My Title</summary>');
  });

  it('should convert collapsible paragraph (closed)', () => {
    const input = `[%collapsible]
.Toggle me
Hidden content`;
    const output =  engine.convert(input);
    expect(output).toContain('<details>');
    expect(output).toContain('<summary>Toggle me</summary>');
    expect(output).toContain('Hidden content');
    expect(output).not.toContain('open');
  });

  it('should convert collapsible paragraph (open)', () => {
    const input = `[%collapsible%open]
.Toggle me
Visible content`;
    const output =  engine.convert(input);
    expect(output).toContain('<details open>');
    expect(output).toContain('<summary>Toggle me</summary>');
  });

  it('should handle complex example', () => {
    const input = `.Titre
[#id.para%collapsible%open,attr1=value1,attr2=value2]
Un petit paragraphe.`;
    const output =  engine.convert(input);
    expect(output).toContain('<details open>');
    expect(output).toContain('<summary>Titre</summary>');
    expect(output).toContain('id="id"');
    expect(output).toContain('class="para"');
    expect(output).toContain('attr1="value1"');
    expect(output).toContain('attr2="value2"');
  });
});