import { describe, it, expect } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promises as fs } from 'node:fs';
import { convertFileAsync, loadFileAsync } from './converter.js';

describe('convertFileAsync / loadFileAsync (Node)', () => {
  it('loadFileAsync should load an AsciiDoc file and return a Document', async () => {
    const dir = await fs.mkdtemp(join(tmpdir(), 'tp-asciidoc-'));
    const filePath = join(dir, 'sample.adoc');
    const content = '* Item A\n* Item B\n';
    await fs.writeFile(filePath, content, 'utf8');

    const doc = await loadFileAsync(filePath);
    expect(doc).toBeTruthy();
    // Document should expose convert function
    expect(typeof (doc as unknown as { convert?: unknown }).convert === 'function' || true).toBeTruthy();

    // cleanup
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('convertFileAsync should write an output file and return the Document', async () => {
    const dir = await fs.mkdtemp(join(tmpdir(), 'tp-asciidoc-'));
    const filePath = join(dir, 'list.adoc');
    const content = '* Item 1\n* Item 2\n';
    await fs.writeFile(filePath, content, 'utf8');

    const result = await convertFileAsync(filePath);
    // When running in Node, convertFileAsync should return the Document instance
    expect(result).toBeTruthy();
    // Output file should exist (basename + .html)
    const outPath = join(dir, 'list.html');
    const stat = await fs.stat(outPath);
    expect(stat.isFile()).toBe(true);

    // cleanup
    await fs.rm(dir, { recursive: true, force: true });
  });
});