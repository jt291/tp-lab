/**
 * Base class for all components of the `tp-lab` library.
 * 
 * @module
 * @category Base
 */


// lit
import { LitElement, unsafeCSS, type CSSResultGroup } from "lit";
import { property } from "lit/decorators.js";
// utilities
import { capitalize } from "../../utilities/strings.js";
// styles
import baseStyles from "./base.css?inline";


export class TpBase extends LitElement {
  /** Component styles */
  static styles: CSSResultGroup = [ unsafeCSS(baseStyles) ];

  /** The tag name of the component */
  public readonly tagname = this.tagName.toLowerCase();

  /** The name of the component */
  public readonly basename = capitalize(this.tagname.replace('tp-', ''));

  /** The description of the component */
  public description = 'The description must be defined in each subclass of the base class.';

  /** Specifies the text direction. */
  @property() 
  dir = 'ltr';

  /** Specifies the language of the text. */
  @property() 
  lang = 'en';

  /**
   * Emission of a `CustomEvent` event by the element.
   *
   * By default, the event bubbles through the DOM (`bubbles: true`);
   * it also crosses the shadow DOM boundary (`composed:true`)
   * and cannot be prevented from doing so (`cancelable: false`).
   *
   */
  protected emit(name: string, options?: CustomEventInit) {
    const event = new CustomEvent(`${this.tagname}-${name}`, {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {},
      ...options
    })
    this.dispatchEvent(event)
    return event
  }

}