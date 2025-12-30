import fs from 'fs';
import path from 'path';

/**
 * Generate a new node structure for converting AsciiDoctor nodes.
 * This script creates the directory, the necessary TypeScript files,
 * and updates the TpConverter with the scaffolded methods.
 */

const basePath = path.resolve(__dirname, '../src/nodes');
const converterPath = path.resolve(__dirname, '../src/converter/converter.ts');

const nodeName = process.argv[2];

if (!nodeName) {
  console.error('Please provide the name of the node to create. Example: node create-node quote');
  process.exit(1);
}

const nodeDir = path.join(basePath, nodeName);
const nodeFile = path.join(nodeDir, `${nodeName}.ts`);
const testFile = path.join(nodeDir, `${nodeName}.test.ts`);

// Scaffold structure
if (!fs.existsSync(nodeDir)) {
  fs.mkdirSync(nodeDir, { recursive: true });
}

// Template content
const nodeFileContent = `/**
 * Converts an AsciiDoctor \`${nodeName}\` node to an HTML semantic equivalent.
 */
export const convert${capitalize(nodeName)} = (node: any): string => {
  // TODO: Implement conversion logic for the \`${nodeName}\` node.
  return `<${nodeName}>${node.getContent()}</${nodeName}>`;
};

/**
 * Capitalize the first letter of a string.
 */
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);`;

const testFileContent = `import { describe, it, expect } from 'vitest';
import { convert${capitalize(nodeName)} } from './${nodeName}';

describe('${nodeName} node conversion', () => {
  it('should convert a ${nodeName} node correctly', () => {
    const mockNode = { getContent: () => 'Example ${nodeName} content' };
    const result = convert${capitalize(nodeName)}(mockNode);
    expect(result).toBe('<${nodeName}>Example ${nodeName} content</${nodeName}>');
  });
});`;

// Write files
fs.writeFileSync(nodeFile, nodeFileContent);
fs.writeFileSync(testFile, testFileContent);

// Update TpConverter
const converterContent = fs.readFileSync(converterPath, 'utf8');
const updatedConverterContent = converterContent.replace(
  '// NODE CONVERSION PLACEHOLDER',
  `import { convert${capitalize(nodeName)} } from '../nodes/${nodeName}/${nodeName}';\n// NODE CONVERSION PLACEHOLDER`
).replace(
  '  // NODE HANDLING PLACEHOLDER',
  `  if (nodeType === '${nodeName}') return convert${capitalize(nodeName)}(node);\n  // NODE HANDLING PLACEHOLDER`
);

fs.writeFileSync(converterPath, updatedConverterContent);

console.log(`Node ${nodeName} has been scaffolded successfully.`);