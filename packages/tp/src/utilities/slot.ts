/**
 * Slot Utility Functions.
 * 
 * @module
 * @category Utility functions
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit';

/** Reactive controller that determines when slots are available. */
export class HasSlotController implements ReactiveController {
  host: ReactiveControllerHost & Element;
  slotNames: string[] = [];

  constructor(host: ReactiveControllerHost & Element, ...slotNames: string[]) {
    this.host = host;
    this.host.addController(this);
    this.slotNames = slotNames;
  }

  private hasDefaultSlot() {
    return [...this.host.childNodes].some(node => {
      if (node.nodeType === node.TEXT_NODE && node.textContent?.trim() !== '') {
        return true;
      }

      if (node.nodeType === node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        // Si l'élément n'a pas d'attribut slot, il fait partie de l'emplacement par défaut
        if (!el.hasAttribute('slot')) {
          return true;
        }
      }
      return false;
    });
  }

  private hasNamedSlot(name: string) {
    return this.host.querySelector(`:scope > [slot="${name}"]`) !== null;
  }

  test(slotName: string) {
    return slotName === 'default' ? this.hasDefaultSlot() : this.hasNamedSlot(slotName);
  }

  hostConnected() {
    this.host.shadowRoot?.addEventListener('slotchange', this.handleSlotChange);
  }

  hostDisconnected() {
    this.host.shadowRoot?.removeEventListener('slotchange', this.handleSlotChange);
  }

  private handleSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;

    if ((this.slotNames.includes('default') && !slot.name) || (slot.name && this.slotNames.includes(slot.name))) {
      this.host.requestUpdate();
    }
  };
}

/**
 * Étant donné un emplacement, cette fonction itère sur tous les éléments et nœuds de texte qui lui sont assignés 
 * et renvoie le HTML concaténé sous forme de chaîne.
 * Cela est utile car nous ne pouvons pas utiliser slot.innerHTML comme alternative.
 */
export function getInnerHTML(slot: HTMLSlotElement): string {
  const nodes = slot.assignedNodes({ flatten: true });
  let html = '';

  for (const node of nodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      html += (node as HTMLElement).outerHTML;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      html += node.textContent;
    }
  }

  return html;
}

/**
 * Étant donné un emplacement, cette fonction parcourt tous les nœuds de texte qui lui sont attribués
 * et renvoie le texte concaténé sous forme de chaîne.
 * Cela est utile car nous ne pouvons pas utiliser slot.textContent comme alternative.
 */
export function getTextContent(slot: HTMLSlotElement | undefined | null): string {
  if (!slot) {
    return '';
  }
  const nodes = slot.assignedNodes({ flatten: true });
  let text = '';

  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    }
  }

  return text;
}
