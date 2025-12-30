/**
 * Utility functions for handling strings manipulation.
 * 
 * @module
 * @category Utilities
 */

/**
 * Escape HTML special characters.
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
