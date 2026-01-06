/**
 * Lorem-Ipsum Component.
 * 
 * @module
 * @category Utility components
 */


// lit
import type { CSSResultGroup, TemplateResult } from 'lit';
import { html, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// utilities
import { clampRandom, seededNumberGenerator } from '../../utilities/math.js';
import { TpBase } from '../base/base.js';
import { DICTIONARY } from './dictionary.js';
// styles
import loremStyles from './lorem.css?inline';

type NumberGenerator = ReturnType<typeof seededNumberGenerator>;

/**
 * <tp-lorem>
 * 
 * Generates placeholder text in various formats for testing designs with random content.
 */
@customElement('tp-lorem')
export class TpLorem extends TpBase {
  /** Component styles */
  static styles: CSSResultGroup = [ super.styles, unsafeCSS(loremStyles) ];

  private generateNumber!: NumberGenerator;

  public description = 'Generates placeholder text in various formats for testing designs with random content.';

  /** The type of HTML content to generate. */
  @property() 
  type: 'sentence' | 'title' | 'paragraph' | 'dl' | 'ol' | 'ul' = 'sentence';

  /**
   * The length of the content to be generated, for example the number of words, sentences, paragraphs, or list items. 
   * A number or range in the format `{min}-{max}`, for example `3-5`.
   */
  @property() 
  length: number | string = '3-5';

  /**
   * By default, the generator will produce random content each time it runs. 
   * Use this option to initialise the generator with a non-zero number and force it to produce the same content each time.
   */
  @property({ type: Number }) 
  seed!: number;

  /**
   * The number of words that should appear in a sentence or list item.
   * This should be a number or a range in the format `{min}-{max}`, for example `4-16`.
   */
  @property({ attribute: 'words-per-sentence' }) 
  wordsPerSentence: number | string = '4-16';

  /**
   * The number of sentences that should appear in a paragraph. 
   * This should be a number or a range in the format `{min}-{max}`, e.g. `3-6`.
   */
  @property({ attribute: 'sentences-per-paragraph' }) 
  sentencesPerParagraph: number | string = '3-6';

  @state()
  private generated = '';

  connectedCallback(): void {
    super.connectedCallback();
    this.generated = this.generateContent();
  }

  /** 
   * Returns an array of words of the specified length.
   * 
   * @param length - The number of words to generate
   * @returns An array of randomly selected words
   * 
   * @example
   * ```ts
   * const words = generateWords(5);
   * // Returns an array of 5 random words
   * ```
   */
  private generateWords(length: number): string[] {
    const words: string[] = [];
    for (let i = 0; i < length; i++) {
      const index = clampRandom(this.generateNumber(), 0, DICTIONARY.length - 1);
      words.push(DICTIONARY[index]);
    }
    return words;
  }

  /** 
   * Returns a number within the specified range.
   * 
   * @param range - A number or a range in the format `{min}-{max}`
   * @returns A number within the specified range
   * 
   * @example
   * ```ts
   * const num = getNumberWithinRange('3-5');
   * // Returns a number between 3 and 5
   * ```
   */
  private getNumberWithinRange(range: number | string): number {
    // Returns numbers as-is
    if (typeof range === 'number') return range || 0;
    if (typeof range === 'string' && !range.includes('-')) return Number(range) || 0;
    // Choose a random number within the range
    const parsedRange = String(range).split('-');
    const min = Number(parsedRange[0]) || 0;
    const max = Number(parsedRange[1]) || 0;
    return clampRandom(this.generateNumber(), min, max);
  }

  /** Generates a list of random items based on the currently defined properties. */
  private generateList(): string {
    const numItems = this.getNumberWithinRange(this.length);
    let items = '';
    for (let i = 0; i < numItems; i++) {
      const numWords = this.getNumberWithinRange(this.wordsPerSentence);
      const words = this.generateWords(numWords);
      const item = words.join(' ');
      if (this.type === 'dl') {
        items += `<dt>${this.generateTitle()}</dt><dd>${item.charAt(0).toUpperCase() + item.slice(1)}</dd>`;
      } else {
        items += `<li>${item.charAt(0).toUpperCase() + item.slice(1)}</li>`;
      } 
    }
    return `<${this.type}>${items}</${this.type}>`;
  }

  /** Generates random paragraphs based on the currently defined properties. */
  private generateParagraphs(): string {
    const numParagraphs = this.getNumberWithinRange(this.length);
    let paragraphs = '';
    for (let i = 0; i < numParagraphs; i++) {
      const sentences = this.generateSentences();
      paragraphs += `<p>${sentences}</p>`;
    }
    return paragraphs;
  }

  /** 
   * Generates random sentences based on the currently defined properties. 
   * 
   * @returns The generated sentences as a single string.
   */
  private generateSentences(): string {
    const commaFrequency = 10;
    const numSentences = this.getNumberWithinRange(this.length);
    let sentences = '';
    for (let i = 0; i < numSentences; i++) {
      const numWords = this.getNumberWithinRange(this.wordsPerSentence);
      const words = this.generateWords(numWords);
      let sentence = '';
      for (let j = 0; j < words.length; j++) {
        const word = words[j];
        // Capitalizes the first letter
        if (j === 0) {
          sentence += word.charAt(0).toUpperCase() + word.slice(1);
          continue;
        }
        // Adds commas (but not near the end of the sentence)
        if (j < words.length - 3) {
          const addComma = clampRandom(this.generateNumber(), 0, commaFrequency) === 0;
          if (addComma) sentence += ', ';
        }
        sentence += ` ${word}`;
      }
      sentences += `${sentence}. `;
    }
    return sentences.trim();
  }

  /** 
   * Generates a random title based on the currently defined properties. 
   * 
   * @returns The generated title string.
   */
  private generateTitle(): string {
    const numWords = this.getNumberWithinRange(this.length);
    const words = this.generateWords(numWords);
    const title = [];
    for (const word of words) {
      title.push(word.charAt(0).toUpperCase() + word.slice(1));
    }
    return title.join(' ');
  }

  /**
   * Generates lorem ipsum content based on the component's type configuration.
   * 
   * Initializes a number generator (seeded or random) and produces content
   * according to the specified type: sentences, paragraphs, titles, or lists.
   * 
   * @returns The generated lorem ipsum content as a string.
   * 
   * @remarks
   * - If a seed is provided, the same content will be generated on each render
   * - The seed can be either a number or a numeric string
   * - Supported content types: 'sentence', 'paragraph', 'title', 'ol', 'ul', 'dl'
   * 
   * @private
   */
  private generateContent(): string {
    // Configure the number generator so that it is the same for each render if we have a seed.
    const seed = typeof this.seed === 'number' ? this.seed : Number.parseFloat(this.seed);
    this.generateNumber = typeof this.seed === 'undefined' ? () => Math.random() : seededNumberGenerator(seed);
    let content = ''
    switch (this.type) { 
      case 'title':
        content = this.generateTitle();
        break;
      case 'sentence':
        content = this.generateSentences();
        break;
      case 'paragraph':
        content = this.generateParagraphs();
        break;
      case 'ol':
      case 'ul':
      case 'dl':
        content = this.generateList();
        break;
    } 
    return content;
  }

  render(): TemplateResult {
     return html`
      ${unsafeHTML(this.generated)}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tp-lorem': TpLorem;
  }
}
