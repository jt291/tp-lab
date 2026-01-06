/* @vitest-environment happy-dom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { convertFileAsync } from './converter.js';

// Mock Asciidoctor before importing the module under test
vi.mock('@asciidoctor/core', () => {
  return {
    default: () => ({
      load: (content: string, _opts: unknown) => {
        return {
          convert: () => `<div class="converted">${String(content)}</div>`,
          getAttribute: (_name: string) => '.html',
        };
      },
      Html5Converter: {
        create: () => ({}),
      },
    }),
  };
});


describe('convertFileAsync (browser, happy-dom)', () => {
  // Keep the original fetch if any (may be undefined)
  let originalFetch: typeof fetch | undefined;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    // Restore fetch: if it existed restore it, otherwise assign undefined safely (no `delete`)
    if (originalFetch !== undefined) {
      globalThis.fetch = originalFetch;
    } else {
      // Assign `undefined` using a cast to satisfy TypeScript types without using `delete`
      globalThis.fetch = undefined as unknown as typeof fetch;
    }
    vi.restoreAllMocks();
  });

  it('should fetch the .adoc, convert and trigger a download when download=true', async () => {
    const sampleAdoc = 'Sample *Asciidoc* content\n';

    // Mock fetch to return the sample content.
    const mockFetch = vi.fn(async () => {
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => sampleAdoc,
      } as unknown as Response;
    });
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    // Spy on URL.createObjectURL and document.body.appendChild (types inferred)
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');

    // Spy on the anchor click to ensure it's invoked
    const clickSpy = vi.fn();

    // Intercept creation of <a> to attach a fake click implementation
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = origCreateElement(tagName);
      if (tagName.toLowerCase() === 'a') {
        // Define a clickable function on the element without casting to any
        Object.defineProperty(el, 'click', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: clickSpy,
        });
      }
      return el;
    });

    const result = await convertFileAsync('https://example.test/doc.adoc', {
      download: true,
      outFileName: 'downloaded.html',
    });

    // convertFileAsync in browser with download=true should return the HTML string
    expect(typeof result).toBe('string');
    expect(result).toContain('Sample *Asciidoc* content');

    // Expect createObjectURL to have been called with a Blob
    expect(createObjectURLSpy).toHaveBeenCalled();
    // Expect appendChild to have been called to append the anchor
    expect(appendChildSpy).toHaveBeenCalled();
    // Expect the mocked click to have been invoked
    expect(clickSpy).toHaveBeenCalled();
  });
});