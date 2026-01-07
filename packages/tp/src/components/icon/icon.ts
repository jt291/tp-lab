/**
 * Icon Component.
 * 
 * @module
 * @category Utility components
 */


// lit
import type { CSSResultGroup, PropertyValues, TemplateResult } from 'lit';
import { html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
// utilities
import { TpBase } from '../base/base.js';
// styles
import iconStyles from './icon.css?inline';

@customElement('tp-icon')
export class TpIcon extends TpBase {
  /** Component styles */
  // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
  static styles: CSSResultGroup = [ super.styles, unsafeCSS(iconStyles), unsafeCSS(`@unocss-placeholder`) ];

  private _color = 'currentColor'
  private _flipX = false;
  private _flipY = false;
  private _rotate = 0;
  private _size = '1em'
  private _spin = false;


  private _transformations: string[] = [];

  /** Color of the icon. */
  @property({ type: String, reflect: true})
  get color() {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
    this.style.color = value;
  }

    /** Flips the icon horizontally. */
  @property({ attribute: 'flip-x', type: Boolean }) 
  get flipX() {
    return this._flipX;
  }
  set flipX(value: boolean) {
    this._flipX = value;
    this._updateTransform();
  }

  /** Flips the icon vertically. */
  @property({ attribute: 'flip-y', type: Boolean }) 
  get flipY() {
    return this._flipY;
  }
  set flipY(value: boolean) {
    this._flipY = value;
    this._updateTransform();
  }
  
  /** Rotates the icon by the specified number of degrees. */
  @property({ type: Number }) 
  get rotate(): number {
    return this._rotate;
  }
  set rotate(value: number) {
    this._rotate = value;
    this._updateTransform();  
  }

  /** Size of the icon. */
  @property({ type: String, reflect: true})
  get size() {
    return this._size;
  }
  set size(value: string) {
    this._size = value;
    this.style.fontSize = value;
    this.style.border = "1px solid green"
  }

  @property({ type: Boolean, reflect: true })
  get spin() {
    return this._spin;
  }
  set spin(value: boolean) {
    this._spin = value;
    if (value) {
      this.classList.add('rotating');
    } else {
      this.classList.remove('rotating');
    }
  }


  override firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.setAttribute('role', 'img');
    this.setAttribute('aria-hidden', 'true');
  }

  render(): TemplateResult {
    return html``;
  }

  private _updateTransform() {
    // Réinitialiser les transformations
    this.style.removeProperty("transform");
    this._transformations = [];
    if (this.flipX && this.flipY) {
      this._transformations.push("scale(-1)");
    } else if (this.flipX) {
      this._transformations.push("scaleX(-1)");
    } else if (this.flipY) {
      this._transformations.push("scaleY(-1)");
    }
    if (this.rotate && !Number.isNaN(this.rotate)) {
      this._transformations.push(`rotate(${this.rotate}deg)`);
    }
    // Appliquer toutes les transformations cumulées
    this.style.transform = this._transformations.join(" ");
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tp-icon': TpIcon;
  }
}
