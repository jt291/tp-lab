/**
 * Custom Asciidoctor converter implementation.
 * 
 * @module
 * @category Converters
 */

import Asciidoctor from '@asciidoctor/core';
import type { ProcessorOptions, Document as AsciidoctorDocument } from '@asciidoctor/core';
import type { AbstractNode, AbstractBlock, Section, List, Html5Converter } from '@asciidoctor/core';

import { convertListing } from '../blocks/listing/listing.js';
import { convertLiteral } from '../blocks/literal/literal.js';
import { convertParagraph } from '../blocks/paragraph/paragraph.js';
import { convertUlist } from '../blocks/ulist/ulist.js';
import { convertOlist } from '../blocks/olist/olist.js';
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
        html = convertListing(node as AbstractBlock);
        break;
      case 'literal':
        html = convertLiteral(node as AbstractBlock);
        break;
      case 'paragraph':
        html = convertParagraph(node as AbstractBlock);
        break;
      case 'section':
        // html = convertSection(node as Section);
        break;
      case 'ulist':
        html = convertUlist(node as List);
        break;
      case 'olist':
        html = convertOlist(node as List);
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

export function convert(content: string, options: ProcessorOptions = {}): string {
  const html = asciidoctor.convert(content, {
    ...options,
    converter: TpConverter,
  }) as unknown;

  return typeof html === 'string' ? html : String(html);
}

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

export const raw = <T,>(value: T): RawValue<T> => ({ __adoc_raw: true, value });

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

export type AdocTag = {
  (strings: TemplateStringsArray, ...values: unknown[]): string;
  withOptions(options: ProcessorOptions): (strings: TemplateStringsArray, ...values: unknown[]) => string;
  raw<T>(value: T): RawValue<T>;
};

export const adoc = ((strings: TemplateStringsArray, ...values: unknown[]) => {
  const source = buildSource(strings, values);
  return convert(source);
}) as unknown as AdocTag;

adoc.withOptions = (options: ProcessorOptions) => (strings: TemplateStringsArray, ...values: unknown[]) => {
  const source = buildSource(strings, values);
  return convert(source, options);
};

adoc.raw = raw;
