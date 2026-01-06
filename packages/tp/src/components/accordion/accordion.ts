import type { CSSResultGroup, PropertyValues } from 'lit';
import { html, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
// local
import '../details/details.js';
import { TpBase } from '../base/base.js';
import type { TpDetails } from '../details/details.js';
// styles
import accordionStyles from './accordion.css?inline';

/**
 * <tp-accordion>
 *
 * @summary A container for content that expands and collapses when selected.
 *
 * @dependency tp-details
 *
 * @slot - One or more `<tp-details>` elements to place in the accordion.
 *
 * @event tp-before-expand - Emitted when an details item is instructed to expand but before it is shown. Calling
 *  `event.preventDefault()` will prevent the item from expanding. `event.detail.item` will contain the expanding item.
 * @event tp-expand - Emitted after an details item has been expanded. `event.detail.item` will contain the
 *  expanded item.
 * @event tp-before-collapse - Emitted when an details item is instructed to collapse but before it is hidden.
 *  Calling `event.preventDefault()` will prevent the item from collapsing. `event.detail.item` will contain the
 *  collapsing item.
 * @event tp-collapse - Emitted after an details item has been collapsed. `event.detail.item` will contain the
 *  collapsed item.
 *
 * @cssproperty [--duration=200ms] - The expand and collapse duration.
 * @cssproperty [--easing=ease] - The expand and collapse easing.
 * @cssproperty [--border-color=var(--tp-neutral-stroke-softer)] - The accordion's border color.
 * @cssproperty [--border-width=var(--tp-border-width)] - The accordion's border width.
 * @cssproperty [--border-style=var(--tp-border-style)] - The accordion's border style.
 * @cssproperty [--border-radius=var(--tp-border-radius-md)] - The border radius to apply to rounded edges.
 */
@customElement('tp-accordion')
export class TpAccordion extends TpBase {
  /** Component styles */
  static styles: CSSResultGroup = [ super.styles, unsafeCSS(accordionStyles)];

  @query('slot:not([name])') 
  private defaultSlot!: HTMLSlotElement;

  /** When set, selecting an accordion item will automatically collapse the others. */
  @property({ type: Boolean, attribute: 'auto-collapse' }) 
  autoCollapse = false;

  /** Determines the accordion's appearance. */
  @property({ reflect: true }) 
  appearance: 'container' | 'separator' | 'list' = 'container';

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('appearance')) {
      this.syncItemProperties();
    }
  }

  /** Get accordion items from the default slot */
  public getItems(): TpDetails[] {
    return this.defaultSlot
      .assignedElements()
      .filter(el => el.tagName.toLowerCase() === 'tp-details') as TpDetails[];
  }

  /** Get enabled (non-disabled) accordion items */
  private getEnabledItems(): TpDetails[] {
    return this.getItems().filter(item => !item.disabled);
  }

  /** Focus the next enabled accordion item */
  private focusNextItem(currentItem: TpDetails) {
    const enabledItems = this.getEnabledItems();
    const currentIndex = enabledItems.indexOf(currentItem);
    if (currentIndex < enabledItems.length - 1) {
      enabledItems[currentIndex + 1].focus();
    }
  }

  /** Focus the previous enabled accordion item */
  private focusPreviousItem(currentItem: TpDetails) {
    const enabledItems = this.getEnabledItems();
    const currentIndex = enabledItems.indexOf(currentItem);
    if (currentIndex > 0) {
      enabledItems[currentIndex - 1].focus();
    }
  }

  /** Focus the first enabled accordion item */
  private focusFirstItem() {
    const enabledItems = this.getEnabledItems();
    if (enabledItems.length > 0) {
      enabledItems[0].focus();
    }
  }

  /** Focus the last enabled accordion item */
  private focusLastItem() {
    const enabledItems = this.getEnabledItems();
    if (enabledItems.length > 0) {
      enabledItems[enabledItems.length - 1].focus();
    }
  }

  private handleClick = (event: MouseEvent) => {
    const path = event.composedPath();
    // Find the accordion item in the event path
    const item = path.find(
      el => el instanceof HTMLElement && el.tagName.toLowerCase() === 'tp-details'
    ) as TpDetails;
     if (!item?.disabled) {
      const summary = item.summary;
      if (summary && path.includes(summary)) {
        this.handleItemToggle(item);
      }
    }
  };

  /** @internal Handles accordion item toggle requests */
  private handleItemToggle(item: TpDetails): boolean {
    if (!item.open) {
      // Expanding
      // If auto-collapse is enabled, collapse other items
      const itemsToCollapse: TpDetails[] = [];
      if (this.autoCollapse) {
        const items = this.getItems();
         for (const otherItem of items) {
          if (otherItem !== item && otherItem.open) {
            otherItem.open = false;
            itemsToCollapse.push(otherItem);
          }
        }
      }
    }
    return true;
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const path = event.composedPath();
    const target = path[0] as HTMLElement;
    if (target.getAttribute('part') === 'summary') {
      const shadowRoot = target.getRootNode() as ShadowRoot;
      const item = shadowRoot.host as TpDetails;
      if (item && !item.disabled) {
        switch (event.key) {
          case 'Enter':
          case ' ':
            event.preventDefault();
            this.handleItemToggle(item);
            break;
          case 'ArrowUp':
            event.preventDefault();
            this.focusPreviousItem(item);
            break;
          case 'ArrowDown':
            event.preventDefault();
            this.focusNextItem(item);
            break;
          case 'Home':
            event.preventDefault();
            this.focusFirstItem();
            break;
          case 'End':
            event.preventDefault();
            this.focusLastItem();
            break;
        }
      }
    }
  };

  private handleSlotChange() {
    this.syncItemProperties();
  }

  /** Sync appearance and iconPlacement to accordion items */
  private syncItemProperties() {
    const items = this.getItems();
    items.forEach((item, index) => {
      const isFirst = index === 0;
      const isLast = index === items.length - 1;
      const isMiddle = items.length > 2 && !isFirst && !isLast;
      item.toggleAttribute('data-accordion-container', this.appearance === 'container');
      item.toggleAttribute('data-accordion-separator', this.appearance === 'separator');
      item.toggleAttribute('data-accordion-list', this.appearance === 'list');
      item.toggleAttribute('data-accordion-item-first', isFirst);
      item.toggleAttribute('data-accordion-item-middle', isMiddle);
      item.toggleAttribute('data-accordion-item-last', isLast);
    });
  }

  render() {
    return html`<slot @slotchange=${this.handleSlotChange}></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tp-accordion': TpAccordion;
  }
}
