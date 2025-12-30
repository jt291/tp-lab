import fs from 'fs';
import asciidoctor from '@asciidoctor/core';
import TpConverter from '../packages/asciidoc/src/converter/converter.js';

const testCases = [
  {
    name: 'paragraph',
    content: 'A simple paragraph.',
    options: {},
  },
  {
    name: 'ulist',
    content: '* Item 1\n* Item 2\n* Item 3',
    options: {},
  },
  // Ajoutez d'autres cas de test
];

const buildTableRow = (name: string, asciidoc: string, htmlAsciidoctor: string, htmlTpConverter: string): string => {
  return `<tr>
    <td>${name}</td>
    <td><pre>${escapeHtml(asciidoc)}</pre></td>
    <td>${htmlAsciidoctor}</td>
    <td>${htmlTpConverter}</td>
  </tr>`;
};

const escapeHtml = (str: string): string => {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\'/g, '&#039;');
};

const asciidoctorInstance = asciidoctor();

let htmlOutput = `<table>
  <thead>
    <tr>
      <th>Node</th>
      <th>Asciidoc</th>
      <th>Asciidoctor.js</th>
      <th>TpConverter</th>
    </tr>
  </thead>
  <tbody>`;

testCases.forEach(({ name, content, options }) => {
  const htmlAsciidoctor = asciidoctorInstance.convert(content, options);
  const htmlTpConverter = asciidoctorInstance.convert(content, { ...options, standalone: true, converter: TpConverter });

  htmlOutput += buildTableRow(name, content, htmlAsciidoctor, htmlTpConverter);
});

htmlOutput += `</tbody>
</table>`;

fs.writeFileSync('comparison-table.html', htmlOutput);
console.log('Comparison table generated: comparison-table.html');