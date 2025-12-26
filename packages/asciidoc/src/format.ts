import prettier from 'prettier';

/**
 * Formats HTML string using Prettier.
 * 
 * @summary Applies consistent formatting to HTML output with configurable options.
 * 
 * @param html - The HTML string to format
 * @returns A promise that resolves to the formatted HTML
 * 
 * @example
 * ```typescript
 * const ugly = '<div><p>Hello</p></div>';
 * const pretty = await formatHtml(ugly);
 * // Returns: 
 * // <div>
 * //   <p>Hello</p>
 * // </div>
 * ```
 * 
 * @example
 * ```typescript
 * const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
 * const formatted = await formatHtml(html);
 * // Returns formatted with proper indentation
 * ```
 */
export async function formatHtml(html:  string): Promise<string> {
  return await prettier.format(html, {
    parser: 'html',
    htmlWhitespaceSensitivity:  'css',
    printWidth: 120,
    tabWidth: 2,
  });
}