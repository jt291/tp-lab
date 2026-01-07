/**
 * Details Component.
 * 
 * @module
 * @category UI components
 */

// lit
import type { CSSResultGroup, PropertyValues } from 'lit';
import { html, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
// local
// import '../icon/icon.js';
import { TpBase } from '../base/base.js';
// styles
import detailsStyles from './details.css?inline';



/**
 * <tp-details>
 *
 * @summary An individual section within an accordion, consisting of a header and content that shows when expanded.
 *
 * @dependency tp-icon
 *
 * @slot - The content to show when expanded.
 * @slot icon - The expand/collapse icon.
 * @slot label - The accordion item's label. For plain-text labels, you can use the `label` attribute instead.
 *
 * @csspart summary - The details item's summary that contains the label and icon.
 * @csspart label - The label container.
 * @csspart icon - The icon container.
 * @csspart content - The content wrapper.
 *
 * @cssstate disabled - Applies when the details item is disabled.
 * @cssstate expanded - Applies when the details item is expanded.
 */
@customElement('tp-details')
export class TpDetails extends TpBase {
  /** Component styles */
  // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
  static styles: CSSResultGroup = [ super.styles, unsafeCSS(detailsStyles), unsafeCSS(`@unocss-placeholder`) ];

  private _open = false;

  @query('[part="content"]') 
  content!: HTMLSlotElement;

  @query('[part="details"]') 
  details!: HTMLDetailsElement;

  @query('[part="summary"]') 
  summary!: HTMLElement;

  @property({ type: Boolean, reflect: true }) 
  get open() {
    return this._open;
  }
  set open(value: boolean) {
    this._open = value;
    this.details.open = value;
  }

  /** The accordion item's label. If you need to provide HTML in the label, use the `label` slot instead. */
  @property() 
  label = 'Details';

  /** Disables the details. */
  @property({ type: Boolean, reflect: true }) 
  disabled = false;

  /** Sets focus to the details. */
  public focus() {
    this.summary.focus();
  }

  /** Removes focus from the details. */
  public blur() {
    this.summary.blur();
  }

  createListeners() {
    this.details.addEventListener('toggle', () => {
      if (this.disabled) {
        this.details.open = this._open;
        return;
      }
      this._open = this.details.open;
    });
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this.createListeners();
  }

  render() {
    return html`
      <details part="details" ?open=${this.open}>
        <summary part="summary" ?disabled=${this.disabled}>
          <slot name="label" part="label">${this.label}</slot>
        </summary>
        <slot part="content"></slot>
      </details>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tp-details': TpDetails;
  }
}


