# @tp-lab/asciidoc

A custom [Asciidoc](https://asciidoc.org) converter that generates clean, semantic HTML5 output. 

## Overview

This package extends [Asciidoctor.js](https://docs.asciidoctor.org/asciidoctor.js/latest/) with a custom converter (`TpConverter`) that produces more semantic HTML by: 

- Removing unnecessary wrapper `<div>` elements
- Using modern HTML5 semantic elements (`<details>`, `<summary>`, `<aside>`, etc.)
- Supporting collapsible blocks with native HTML
- Preserving all Asciidoctor features while improving output quality

## Installation

```bash
pnpm add @tp-lab/asciidoc
```

## Usage

### Basic Conversion

```typescript
import { convert } from '@tp-lab/asciidoc';

const asciidoc = `
= Document Title

This is a paragraph.

* Item 1
* Item 2
`;

const html = convert(asciidoc);
console.log(html);
```

### Using the Custom Converter

```typescript
import Asciidoctor from '@asciidoctor/core';
import { TpConverter } from '@tp-lab/asciidoc';

const asciidoctor = Asciidoctor();
const html = asciidoctor.convert(content, {
  converter: TpConverter
});
```

## Supported Block Types

### ✅ Implemented

| Block Type | HTML Output | Features |
|------------|-------------|----------|
| `paragraph` | `<p>` | Collapsible support |
| `ulist` | `<ul>`, `<li>` | Nested lists, collapsible |
| `olist` | `<ol>`, `<li>` | Start attribute, numbering styles, collapsible |
| `literal` | `<pre>` | Preserves whitespace, collapsible |
| `listing` | `<pre><code>` | Language attribute, syntax highlighting support |

### 🚧 Planned

- `quote` - Block quotes (`<blockquote>`)
- `verse` - Poetry quotes
- `sidebar` - Side content (`<aside>`)
- `example` - Example blocks
- `admonition` - NOTE, TIP, WARNING, IMPORTANT, CAUTION
- `dlist` - Definition lists (`<dl>`, `<dt>`, `<dd>`)
- `section` - Document sections with headings
- `image`, `video`, `audio` - Media elements
- `table` - Tables
- And more...

## Features

### Semantic HTML

**Before (default Asciidoctor):**
```html
<div class="paragraph">
  <p>Content</p>
</div>
```

**After (TpConverter):**
```html
<p>Content</p>
```

### Collapsible Blocks

AsciiDoc input:
```asciidoc
[%collapsible%open]
. Click to toggle
====
Hidden content here
====
```

HTML output:
```html
<details open>
  <summary>Click to toggle</summary>
  <p>Hidden content here</p>
</details>
```

### Code Blocks with Language Support

AsciiDoc input:
```asciidoc
[source,javascript]
----
console.log("Hello, World!");
----
```

HTML output:
```html
<pre><code class="language-javascript">console.log("Hello, World!");</code></pre>
```

Perfect for syntax highlighting with [Highlight.js](https://highlightjs.org/) or [Prism](https://prismjs.com/).

### Ordered Lists with Attributes

AsciiDoc input: 
```asciidoc
[start=5,loweralpha]
. Item e
. Item f
. Item g
```

HTML output:
```html
<ol start="5" type="a">
  <li>Item e</li>
  <li>Item f</li>
  <li>Item g</li>
</ol>
```

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests for specific block
pnpm test paragraph
pnpm test ulist

# Build package
pnpm build

# Generate documentation
pnpm doc        # Public API documentation
pnpm doc: full   # Complete internal documentation
```

### Project Structure

```
packages/asciidoc/
├── src/
│   ├── blocks/          # Block converters
│   │   ├── paragraph/
│   │   │   ├── paragraph.ts
│   │   │   └── paragraph.test.ts
│   │   ├── ulist/
│   │   ├── olist/
│   │   ├── literal/
│   │   └── listing/
│   ├── utilities/       # Shared utilities
│   │   └── attributes.ts
│   ├── converter.ts     # TpConverter class
│   ├── format. ts        # convert() helper
│   └── index.ts         # Public API
├── docs/                # Generated documentation
├── dist/                # Build output
└── package.json
```

### Adding a New Block Type

1. Create the block directory and files: 
```bash
mkdir -p src/blocks/newblock
touch src/blocks/newblock/newblock.ts
touch src/blocks/newblock/newblock.test.ts
```

2. Implement the converter function in `newblock.ts`:
```typescript
import type { AbstractBlock } from '@asciidoctor/core';
import { buildIdAttributeString, buildClassAttributeString } from '../../utilities/attributes.js';

export function convertNewblock(node: AbstractBlock): string {
  const idAttribute = buildIdAttributeString(node);
  const classAttribute = buildClassAttributeString(node);
  const content = node.getContent() || '';
  
  return `<div${idAttribute}${classAttribute}>${content}</div>`;
}
```

3. Add tests in `newblock.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { convert } from '../../index.js';

describe('Newblock block', () => {
  it('should convert a simple newblock', () => {
    const input = `...`; // AsciiDoc input
    const output = convert(input);
    expect(output).toContain('.. .');
  });
});
```

4. Register in `converter.ts`:
```typescript
import { convertNewblock } from './blocks/newblock/newblock.js';

// In TpConverter. convert() switch: 
case 'newblock':
  html = convertNewblock(node as AbstractBlock);
  break;
```

5. Run tests:
```bash
pnpm test newblock
```

### Testing Guidelines

- ✅ All tests must pass before committing
- ✅ All functions must be documented in English (JSDoc)
- ✅ Use semantic HTML (no unnecessary wrappers)
- ✅ Follow existing patterns (see `paragraph`, `ulist`, `olist`)
- ✅ Test all features:  basic, attributes, collapsible, nested content

### Code Quality

This project uses:
- **TypeScript** for type safety
- **Vitest** for testing
- **Biome** for linting and formatting
- **TypeDoc** for documentation generation

Code style rules:
- Use template literals over string concatenation
- Prefer `for...of` over `.forEach()`
- Document all exported functions
- Use semantic HTML5 elements

## Documentation

Full API documentation is available: 

```bash
# Generate and view public API docs
pnpm doc
open docs/index.html

# Generate complete internal docs
pnpm doc:full
open docs/index.html
```

## License

MIT

## Contributing

Contributions are welcome! Please: 

1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Ensure all tests pass (`pnpm test`)
5. Document your code in English
6. Submit a pull request

## Author

Jacques Tisseau (@jt291)

## AsciiDoc
- [AsciiDoc Language Documentation](https://docs.asciidoctor.org/asciidoc/latest/)
- [AsciiDoc Syntax Quick Reference](https://docs.asciidoctor.org/asciidoc/latest/syntax-quick-reference/)


---

**Status:** 🚧 Work in Progress - Currently implementing core block types