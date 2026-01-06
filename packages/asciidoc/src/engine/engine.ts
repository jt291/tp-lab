import Asciidoctor from '../libs/asciidoctor.js';
import type { ProcessorOptions, Document as AsciidoctorDocument, Options } from '../libs/asciidoctor.js';
import { TpConverter } from '../converter/converter.js';
import * as extensions from '../extensions/extensions.js';
import { formatHtml } from '../utilities/format.js';


const isNode = typeof process !== 'undefined' && typeof process.versions?.node === 'string';
const canFetch = typeof fetch === 'function';


export class TpAsciidoc {
  private asciidoctor = Asciidoctor();
  private converter = new TpConverter(() => this.asciidoctor);
  private tpRegistry = this.asciidoctor.Extensions.create();

  private defaultOptions: Options = {
    attributes: {
      'asciidoc@': 'https://asciidoc.org[AsciiDoc,title="Pour en savoir plus sur AsciiDoc"]',
      'experimental@': true,
      'lang@': 'fr',
      'nofooter@': true,
      'numbered@': false,
      'partnums@': false,
      'sectlinks@': true,
      'sectnums@': false,
      'shiki-theme@': 'dark-plus',
      'source-highlighter@': 'shiki',
      'linkcss@': true,
      'stylesdir@': 'dist',
      'stylesheet@': 'style.css',
      'toc@': 'left',
      'xrefstyle@': 'full'
    },
    backend: 'html5',
    doctype: 'article',
    extension_registry: this.tpRegistry,
    safe: 'unsafe',
    standalone: false,
    stem: false,
  }

  constructor() {
    this.installExtensions() 
    console.log(`TpAsciidoc initialized (Node.js: ${isNode}, Fetch API: ${canFetch})`);
  }

  private installExtensions() {
    this.asciidoctor.ConverterFactory.register(this.converter, ['html5'])
    extensions.asciidoctorLorem(this.tpRegistry)
  }

  public convert(content: string, options: ProcessorOptions = this.defaultOptions): string {
    const html = this.asciidoctor.convert(content, options);
    return typeof html === 'string' ? html : String(html);
  }
  
  public async convertFormatted(
    content: string,
    options: ProcessorOptions = this.defaultOptions
  ): Promise<string> {
    const html = this.convert(content, options);
    return await formatHtml(html);
  }

}


