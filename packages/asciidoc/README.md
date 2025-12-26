# @tp-lab/asciidoc

> A custom Asciidoctor. js converter that generates clean, semantic HTML.

## Features

- ✅ **Semantic HTML**:  Removes unnecessary wrapper `<div>` elements
- ✅ **Modern HTML5**: Uses `<details>`, `<summary>`, and other semantic tags
- ✅ **TypeScript**: Full type safety and IntelliSense support
- ✅ **Browser & Node**:  Works in both environments
- ✅ **Extensible**: Easy to customize block conversions

## Installation

```bash
pnpm add @tp-lab/asciidoc
```

## Usage

### Basic Conversion

```typescript
import { convert } from '@tp-lab/asciidoc';

const asciidoc = `
* Item 1
* Item 2
* Item 3
`;

const html = convert(asciidoc);
console.log(html);
```

**Output:**

```html
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
```

### With Formatting

```typescript
import { convertFormatted } from '@tp-lab/asciidoc';

const html = await convertFormatted(asciidoc);
// Returns beautifully formatted HTML
```

### Collapsible Blocks

```asciidoc
[%collapsible%open]
. Click to toggle
* Hidden item 1
* Hidden item 2
```

**Output:**

```html
<details open>
  <summary>Click to toggle</summary>
  <ul>
    <li>Hidden item 1</li>
    <li>Hidden item 2</li>
  </ul>
</details>
```

## Supported Blocks

- ✅ `paragraph` - Paragraphs
- ✅ `ulist` - Unordered lists
- 🚧 `olist` - Ordered lists (coming soon)
- 🚧 `listing` - Code blocks
- 🚧 `table` - Tables
- 🚧 More coming... 

## API Documentation

See the [full API documentation](./docs/index.html) for detailed usage. 

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build

# Generate documentation
pnpm docs
```

## License

MIT