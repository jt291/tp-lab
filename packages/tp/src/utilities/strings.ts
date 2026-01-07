/**
 * Utility functions for handling strings manipulation.
 * 
 * @module
 * @category Utility functions
 */

/**
 * Escapes HTML special characters to prevent XSS attacks.
 * 
 * @summary Converts HTML special characters to their entity equivalents. 
 * 
 * @param text - The text to escape
 * @returns The escaped text
 * 
 * @example
 * ```typescript
 * escapeHtml('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 * 
 * @example
 * ```typescript
 * escapeHtml('Tom & Jerry') // Returns: 'Tom &amp; Jerry'
 * ```
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => map[char] || char);
}

/**
 * Converts the HTML entities `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `str` to their corresponding characters.
 * It is the inverse of `escape`.
 *
 * @param {string} str The string to unescape.
 * @returns {string} Returns the unescaped string.
 *
 * @example
 * unescape('This is a &lt;div&gt; element.'); // returns 'This is a <div> element.'
 * unescape('This is a &quot;quote&quot;'); // returns 'This is a "quote"'
 * unescape('This is a &#39;quote&#39;'); // returns 'This is a 'quote''
 * unescape('This is a &amp; symbol'); // returns 'This is a & symbol'
 */
export function unescapeHtml(str: string): string {
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };
  return str.replace(/&(?:amp|lt|gt|quot|#(0+)?39);/g, match => htmlUnescapes[match] || "'");
}

/**
 * Remove common leading indentation from a multiline string (simple dedent).
 *
 * - Normalizes CRLF to LF.
 * - Trims a leading/trailing blank line.
 * - Removes the minimal indentation common to all non-empty lines.
 */
export function dedent(input: string): string {
  const lines = input.replace(/\r\n/g, '\n').split('\n');

  // Remove leading/trailing blank lines
  while (lines.length > 0 && lines[0].trim() === '') lines.shift();
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();

  if (lines.length === 0) return '';

  // Determine minimal indentation of non-empty lines
  let minIndent: number | null = null;
  for (const line of lines) {
    if (line.trim() === '') continue;
    const m = line.match(/^(\s*)/);
    const indent = m ? m[1].length : 0;
    if (minIndent === null || indent < minIndent) minIndent = indent;
  }

  if (!minIndent || minIndent === 0) return lines.join('\n');

  const prefix = ' '.repeat(minIndent);
  return lines.map(l => (l.startsWith(prefix) ? l.slice(minIndent) : l)).join('\n');
}


/**
 * Capitalizes the first character of a string and converts the rest to lowercase.
 * 
 * @param str - The string to capitalize
 * @returns The capitalized string with the first character in uppercase and remaining characters in lowercase
 * 
 * @example
 * ```ts
 * capitalize("hello") // returns "Hello"
 * capitalize("WORLD") // returns "World"
 * capitalize("hELLO wORLD") // returns "Hello world"
 * ```
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
