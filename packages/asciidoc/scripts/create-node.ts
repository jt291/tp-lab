import fs from 'node:fs';
import path from 'node:path';
import { capitalize } from '../src/utilities/strings.ts';

/**
 * Generate a new node structure for converting AsciiDoctor nodes.
 * This script creates the directory, the necessary TypeScript files,
 * and updates the TpConverter with the scaffolded methods.
 */

const basePath = 'src/nodes';
const converterPath = 'src/converter/converter.ts';

const nodeName = process.argv[2];

if (!nodeName) {
  console.error('Please provide the name of the node to create. Example: node create-node quote');
  process.exit(1);
}

const nodeDir = path.join(basePath, nodeName);
const allNodesFile = path.join(basePath, 'nodes.ts');
const nodeFile = path.join(nodeDir, `${nodeName}.ts`);
const testFile = path.join(nodeDir, `${nodeName}.test.ts`);

// Scaffold structure
if (!fs.existsSync(nodeDir)) {
  fs.mkdirSync(nodeDir, { recursive: true });
}

// Template content
const nodeFileContent = `/**
 * Converts an AsciiDoctor \`${nodeName}\` node to an HTML semantic equivalent.
 * 
 * @module
 * @category Nodes
 */

import type { AbstractBlock } from '@asciidoctor/core';
import {
  buildClassAttributeString,
  buildIdAttributeString,
  buildOtherAttributesString,
  buildTitleMarkup,
  hasOption,
} from '../../utilities/attributes.js';

export function convert${capitalize(nodeName)}(node: AbstractBlock): string {
  // TODO: Implement conversion logic for the \`${nodeName}\` node.
  return \`<${nodeName}>\${node.getContent()}</${nodeName}>\`;
}
`

const allNodesFileContent = `export { convert${capitalize(nodeName)} } from '../nodes/${nodeName}/${nodeName}.js';`


const testFileContent = `import { describe, it, expect } from 'vitest';
import { convert } from '../../index.js';

describe('"${nodeName}" node conversion', () => {
  it('should convert a ${nodeName} node', () => {
    const input = ''; // input representing a ${nodeName} asciidoc node
    const output = convert(input);
    expect(output).toBe('<${nodeName}>Example ${nodeName} content</${nodeName}>')
  });
});
`;

// Write files
fs.writeFileSync(nodeFile, nodeFileContent);
fs.writeFileSync(testFile, testFileContent);

// Update all nodes export file
const allNodesContent = fs.readFileSync(allNodesFile, 'utf8');
const updatedAllNodesContent = allNodesContent.replace(
'// NODE HANDLING PLACEHOLDER',
`${allNodesFileContent}
// NODE HANDLING PLACEHOLDER`
);
fs.writeFileSync(allNodesFile, updatedAllNodesContent);

// Update TpConverter
const converterContent = fs.readFileSync(converterPath, 'utf8');
const updatedConverterContent = converterContent.replace(
`
        // NODE HANDLING PLACEHOLDER
`,
`
        case '${nodeName}': 
          html = nodes.convert${capitalize(nodeName)}(node as AbstractBlock); 
          break;

        // NODE HANDLING PLACEHOLDER
`
);
fs.writeFileSync(converterPath, updatedConverterContent);

console.log(`Node ${nodeName} has been scaffolded successfully.`);