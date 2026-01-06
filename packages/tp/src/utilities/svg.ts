/**
 * Utility functions for handling SVG operations.
 * 
 * @module
 * @category Utilities
 */


export const encodeSVG = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

/**
 * Converts an SVG string into a CSS class definition that can be used as an icon.
 * 
 * The function encodes the SVG as a data URI and applies it as a mask image, allowing
 * the icon color to be controlled via the CSS `currentColor` property.
 * 
 * @param className - The CSS class name for the generated icon class
 * @param svg - The SVG markup string to convert
 * @param options - Optional configuration object
 * @param options.size - The size of the icon (default: "1em")
 * @param options.strokeColor - The stroke color to replace `currentColor` with (default: "%23000")
 * 
 * @returns A string containing the CSS class definition with the SVG applied as a mask
 * 
 * @example
 * ```typescript
 * const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>';
 * const css = svgToCssIconClass('my-icon', svg, { size: '24px' });
 * // Returns a CSS class that can be injected into a stylesheet
 * ```
 */
export function svgToCssIconClass(
  className: string,
  svg: string,
  options?: {
    size?: string;
    strokeColor?: string;
  },
): string {
  const size = options?.size ?? "1em";
  const strokeColor = options?.strokeColor ?? "%23000";

  const cleanedSvg = svg
    .replace(/>\s+</g, "><") // removes unnecessary spaces
    .replace(/\s{2,}/g, " ") // collapses multiple spaces
    .replace(/"/g, "'")      // standardizes quotes
    .replace(/stroke='currentColor'/g, `stroke='${strokeColor}'`) // replaces stroke color
    .replace(/#/g, "%23")    // encodes hash symbols
    .replace(/</g, "%3C")    // encodes less-than symbols
    .replace(/>/g, "%3E");   // encodes greater-than symbols

  return `
.${className} {
  display: inline-block;
  width: ${size};
  height: ${size};
  --svg: url("data:image/svg+xml,${cleanedSvg}");
  background-color: currentColor;
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}
`.trim();
}
