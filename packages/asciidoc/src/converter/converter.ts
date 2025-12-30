/**
 * Custom Asciidoctor converter implementation.
 * 
 * @module
 * @category Converters
 */

import Asciidoctor from '@asciidoctor/core';
import type { ProcessorOptions, Document as AsciidoctorDocument } from '@asciidoctor/core';
import type { AbstractNode, AbstractBlock, Section, List, Html5Converter } from '@asciidoctor/core';

import * as nodes from '../nodes/nodes.js';
import { formatHtml } from '../utilities/format.js';
import { dedent } from '../utilities/strings.js';

const asciidoctor = Asciidoctor();


/**
 * Custom Asciidoctor converter that generates semantic HTML.
 * 
 * This file only contains the TpConverter class. The adoc tagged-template
 * helper is provided from the public entry point (index.ts).
 */
export class TpConverter {
  public baseConverter: Html5Converter;
  public backend = 'html5';
  public outfilesuffix = '.html';

  constructor() {
    const asciidoctor = Asciidoctor();
    this.baseConverter = asciidoctor.Html5Converter.create();
  }

  /**
   * Routes nodes to specialized conversion functions based on their type.
   */
  convert(node: AbstractNode, transform?: string): string {
    let html = '';
    const nodeName = node.getNodeName();

    switch (nodeName) {
      case 'dlist':
        // html = convertDlist(node as List);
        break;
      case 'inline_break':
        // html = convertInlineBreak(node);
        break;
      case 'inline_footnote':
        // html = convertInlineFootnote(node);
        break;
      case 'listing':
        html = nodes.convertListing(node as AbstractBlock);
        break;
      case 'literal':
        html = nodes.convertLiteral(node as AbstractBlock);
        break;
      case 'paragraph':
        html = nodes.convertParagraph(node as AbstractBlock);
        break;
      case 'section':
        // html = convertSection(node as Section);
        break;
      case 'ulist':
        html = nodes.convertUlist(node as List);
        break;
      case 'olist':
        html = nodes.convertOlist(node as List);
        break;
      default:
        html = this.baseConverter.convert(node, transform);
    }
    return html;
  }
}

/* ---------------------
   Basic conversion APIs
   --------------------- */

/**
 * Converts AsciiDoc content to HTML string.
 * 
 * @param content - The AsciiDoc content to convert
 * @param options - Optional processor options to configure the conversion behavior
 * @returns The converted HTML as a string
 * 
 * @example
 * ```typescript
 * const html = convert('= My Document\n\nHello World!');
 * ```
 */
export function convert(content: string, options: ProcessorOptions = {}): string {
  const html = asciidoctor.convert(content, {
    ...options,
    converter: TpConverter,
  }) as unknown;

  return typeof html === 'string' ? html : String(html);
}

/**
 * Converts AsciiDoc content to formatted HTML.
 * 
 * This function first converts the input content to HTML using the `convert` function,
 * then formats the resulting HTML using the `formatHtml` function.
 * 
 * @param content - The AsciiDoc content string to be converted
 * @param options - Optional processor configuration options for the conversion
 * @returns A promise that resolves to the formatted HTML string
 * 
 * @example
 * ```typescript
 * const asciidoc = '= My Document\n\nSome content.';
 * const html = await convertFormatted(asciidoc, { safe: 'safe' });
 * ```
 */
export async function convertFormatted(
  content: string,
  options: ProcessorOptions = {}
): Promise<string> {
  const html = convert(content, options);
  return await formatHtml(html);
}

/* =================================================
   File helpers (portable: Node.js and Browser( fetch ))
   - loadFileAsync(pathOrUrl, options): Promise<Document>
   - convertFileAsync(pathOrUrl, options): Promise<string | Document>
   ================================================= */

/**
 * Extended options for convertFileAsync.
 * - to_file: if false, do not write output file and return HTML string.
 * - download: in browser, if true, trigger download of the generated HTML file.
 * - outFileName: override output filename (basename + suffix).
 */
export type ConvertFileOptions = ProcessorOptions & {
  to_file?: boolean;
  download?: boolean;
  outFileName?: string;
};

/**
 * Environment detection helpers.
 */
const isNode = typeof process !== 'undefined' && typeof process.versions?.node === 'string';
const canFetch = typeof fetch === 'function';

/**
 * Load an AsciiDoc source from a path (Node) or URL (browser) and return the Asciidoctor Document.
 *
 * - In Node: filePathOrUrl is a file system path, read with fs.promises.readFile.
 * - In Browser: filePathOrUrl is fetched via fetch().
 *
 * The returned Document is created with the TpConverter so subsequent .convert() calls
 * will use your converter.
 */
export async function loadFileAsync(
  filePathOrUrl: string,
  options: ProcessorOptions = {}
): Promise<AsciidoctorDocument> {
  let content: string;

  // Détecte les URLs distantes (http/https)
  const isRemoteUrl = /^https?:\/\//i.test(filePathOrUrl);

  if (isRemoteUrl) {
    // Si c'est une URL distante, on utilise fetch (navigateur ou Node avec fetch polyfill)
    if (!canFetch) {
      throw new Error(`Cannot fetch ${filePathOrUrl}: fetch is unavailable in this environment.`);
    }
    const res = await fetch(filePathOrUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${filePathOrUrl}: ${res.status} ${res.statusText}`);
    }
    content = await res.text();
  } else if (isNode) {
    // Non-URL : on lit le fichier depuis le disque en Node
    const fs = await import('node:fs/promises');
    content = await fs.readFile(filePathOrUrl, { encoding: 'utf8' });
  } else if (canFetch) {
    // Cas où on est en navigateur et le chemin est relatif (ex: "doc.adoc")
    const res = await fetch(filePathOrUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${filePathOrUrl}: ${res.status} ${res.statusText}`);
    }
    content = await res.text();
  } else {
    throw new Error('No mechanism available to read file: not Node and fetch is unavailable.');
  }

  return asciidoctor.load(content, {
    ...options,
    converter: TpConverter,
  }) as AsciidoctorDocument;
}

/**
 * convertFileAsync behavior:
 * - If options.to_file === false -> returns HTML string (does not write a file)
 * - Otherwise:
 *   - In Node: writes output file next to input and returns the Asciidoctor Document
 *   - In Browser:
 *     - if options.download === true -> triggers browser download and returns HTML string
 *     - otherwise -> returns HTML string and warns (cannot write arbitrary files)
 */
export async function convertFileAsync(
  filePathOrUrl: string,
  options: ConvertFileOptions = {}
): Promise<string | AsciidoctorDocument> {
  // Detect remote URL early so we can decide output behavior later
  const isRemoteUrl = /^https?:\/\//i.test(filePathOrUrl);

  const doc = await loadFileAsync(filePathOrUrl, options);

  // If explicitly requested not to write file, return HTML string
  if (options.to_file === false) {
    const html = typeof doc.convert === 'function'
      ? (doc.convert() as unknown)
      : (convert(doc.toString(), options) as unknown);
    return typeof html === 'string' ? html : String(html);
  }

  // Produce HTML string
  const html = typeof doc.convert === 'function'
    ? (doc.convert() as unknown)
    : (convert(doc.toString(), options) as unknown);
  const htmlString = typeof html === 'string' ? html : String(html);

  // Decide output filename (use provided override, otherwise derive from input)
  const suffix = (doc.getAttribute && (doc.getAttribute('outfilesuffix') as string)) || '.html';
  let outFileName = options.outFileName;
  if (!outFileName) {
    try {
      if (isRemoteUrl) {
        // derive base name from remote URL path
        const url = new URL(filePathOrUrl);
        const pathname = url.pathname;
        const base = pathname ? pathname.split('/').pop() || 'output' : 'output';
        const baseName = base.replace(/\.[^.]+$/, ''); // drop extension if any
        outFileName = `${baseName}${suffix}`;
      } else {
        const pathMod = await import('node:path');
        const baseName = pathMod.basename(filePathOrUrl, pathMod.extname(filePathOrUrl));
        outFileName = `${baseName}${suffix}`;
      }
    } catch {
      outFileName = `output${suffix}`;
    }
  }

  // If running in Node AND the input is NOT a remote URL, write file and return Document
  if (isNode && !isRemoteUrl) {
    const fs = await import('node:fs/promises');
    const pathMod = await import('node:path');
    const inputDir = pathMod.dirname(filePathOrUrl);
    const outPath = pathMod.resolve(inputDir, outFileName);
    await fs.mkdir(pathMod.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, htmlString, { encoding: 'utf8' });
    return doc;
  }

  // Otherwise (browser-like or remote URL), handle download option or return HTML string
  if (canFetch) {
    if (options.download) {
      try {
        const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = outFileName;
        // Append to DOM to support Firefox
        document.body.appendChild(a);
        a.click();
        a.remove();
        // release object URL
        URL.revokeObjectURL(url);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[@tp-lab/asciidoc] download failed', err);
      }
      return htmlString;
    }

    // Not asked to download: return HTML string and warn
    // eslint-disable-next-line no-console
    console.warn(
      '[@tp-lab/asciidoc] convertFileAsync: running in a non-Node environment or input is a remote URL — cannot write output file to disk. Returning HTML string instead.'
    );
    return htmlString;
  }

  // Fallthrough: should not happen, but return HTML string
  return htmlString;
}

/* ---------------------------
   adoc tagged template (public)
   --------------------------- */

/**
 * Raw wrapper type used to mark raw insertion values.
 */
export type RawValue<T> = {
  __adoc_raw: true;
  value: T;
};

/**
 * Wraps a value in a RawValue container to mark it as raw content.
 * 
 * This function is used to indicate that a value should be treated as raw content
 * and bypass any formatting or escaping that would normally be applied during
 * AsciiDoc conversion.
 * 
 * @template T - The type of the value being wrapped
 * @param value - The value to be marked as raw content
 * @returns A RawValue object containing the original value with a raw content marker
 * 
 * @example
 * ```typescript
 * const rawHtml = raw('<div>Content</div>');
 * // Returns: { __adoc_raw: true, value: '<div>Content</div>' }
 * ```
 */
export const raw = <T,>(value: T): RawValue<T> => ({ __adoc_raw: true, value });

/**
 * Type guard that checks if a value is a RawValue object.
 * 
 * A RawValue is an object that contains the `__adoc_raw` property set to `true`,
 * which is used to mark raw AsciiDoc content that should not be processed or escaped.
 * 
 * @param v - The value to check
 * @returns `true` if the value is a RawValue object, `false` otherwise
 * 
 * @example
 * ```typescript
 * const rawContent = { __adoc_raw: true, value: '<html>' };
 * if (isRawValue(rawContent)) {
 *   // rawContent is typed as RawValue<unknown>
 * }
 * ```
 */
const isRawValue = (v: unknown): v is RawValue<unknown> =>
  typeof v === 'object' && v !== null && ('__adoc_raw' in v) && (v as Record<string, unknown>).__adoc_raw === true;

const buildSource = (strings: TemplateStringsArray, values: unknown[]): string => {
  let out = '';
  for (let i = 0; i < strings.length; i += 1) {
    out += strings[i];
    if (i < values.length) {
      const v = values[i];
      if (isRawValue(v)) {
        const rawText = String(v.value);
        if (out.length > 0 && !out.endsWith('\n') && /^\s*[-=]{4,}/m.test(rawText)) {
          out += '\n';
        }
        out += rawText;
        const nextStartsWithNewline = strings[i + 1] ? strings[i + 1].startsWith('\n') : true;
        if (!rawText.endsWith('\n') && !nextStartsWithNewline) {
          out += '\n';
        }
      } else {
        out += String(v);
      }
    }
  }
  return dedent(out);
};

/**
 * A tagged template literal function for processing AsciiDoc content.
 * 
 * @remarks
 * This type defines a template tag that can be used to process AsciiDoc strings with interpolated values.
 * It provides two additional methods:
 * - `withOptions`: Creates a new tag function with custom processor options
 * - `raw`: Wraps a value to prevent processing/escaping
 * 
 * @example
 * ```typescript
 * const result = adoc`= Title\n\nContent with ${variable}`;
 * const customAdoc = adoc.withOptions({ safe: 'safe' });
 * const rawValue = adoc.raw(unsafeContent);
 * ```
 * 
 * @param strings - The template string parts
 * @param values - The interpolated values
 * @returns The processed AsciiDoc string
 */
export type AdocTag = {
  (strings: TemplateStringsArray, ...values: unknown[]): string;
  withOptions(options: ProcessorOptions): (strings: TemplateStringsArray, ...values: unknown[]) => string;
  raw<T>(value: T): RawValue<T>;
};

/**
 * Template tag function for converting AsciiDoc content to HTML.
 * 
 * @remarks
 * This function acts as a tagged template literal that processes AsciiDoc markup
 * and converts it to HTML output. It combines template strings and interpolated
 * values into a source string, then passes it through the conversion pipeline.
 * 
 * @param strings - The template strings array from the tagged template literal
 * @param values - The interpolated values from the tagged template literal
 * @returns The converted HTML output from the AsciiDoc source
 * 
 * @example
 * ```typescript
 * const html = adoc`= My Document
 * 
 * This is a paragraph with ${variable}.`;
 * ```
 */
export const adoc = ((strings: TemplateStringsArray, ...values: unknown[]) => {
  const source = buildSource(strings, values);
  return convert(source);
}) as unknown as AdocTag;

adoc.withOptions = (options: ProcessorOptions) => (strings: TemplateStringsArray, ...values: unknown[]) => {
  const source = buildSource(strings, values);
  return convert(source, options);
};

adoc.raw = raw;
