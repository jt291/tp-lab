import fs from 'node:fs';
import Asciidoctor from '@asciidoctor/core';
import { TpConverter } from '../dist/tp-asciidoc.js';
import { escapeHtml, formatHtml } from '../dist/utilities.js';
import { createHighlighter } from 'shiki';

const highlighter = await createHighlighter({
  themes: ['light-plus', 'dark-plus'],
  langs: ['asciidoc', 'html'],
})

const asciidoctor = Asciidoctor();

const testCases = [
  {
    name: 'paragraph',
    content: '.paragraph title\n[#paragraph-id]\nA simple paragraph.\n\n\'\'\'\n\nAnother paragraph.',
    options: {},
  },
  {
    name: 'ulist',
    content: '.ulist title\n[#ulist-id]\n* Item 1\n* Item 2\n* Item 3\n\n\'\'\'\n\n.nested ulist title\n* Item 1\n** Subitem 1\n** Subitem 2\n* Item 2\n',
    options: {},
  },
  {
    name: 'olist',
    content: '.olist title\n[#olist-id]\n. Item 1\n. Item 2\n. Item 3\n\n\'\'\'\n\n.nested olist title\n. Item 1\n.. Subitem 1\n.. Subitem 2\n. Item 2\n',
    options: {},
  },
  {
    name: 'literal',
    content: '.literal title\n[#literal-id]\n....\nThis is literal text\n....\n',
    options: {},
  },
  {
    name: 'listing',
    content: '.listing title\n[#listing-id]\n----\nCode goes here\n----\n\n\'\'\'\n\n.source-code title\n[source#source-id,javascript]\n----\n\nconst x = 10;\nconsole.log("x = ", x);\n----\n',
    options: { attributes : { 'source-highlighter': 'shiki', 'source-theme': 'dark-plus' } },
  },
  {
    name: 'quote',
    content: '.quote title\n[quote#quote-id,attribution,citation title and information]\nThis is a quote.\n\n\'\'\'\n\n.another-quote title\n[quote]\n____\nAnother quote without attribution,\n\nbut with two paragraphs.\n____\n',
    options: {},
  }
  // Add more test cases
];

const buildTableRow = (name: string, asciidoc: string, htmlAsciidoctor: string, codeHtmlAsciidoctor: string, htmlTpConverter: string, codeHtmlTpConverter: string): string => {
  return `<tr>
    <td>${name}</td>
    <td><pre><code>${asciidoc}</code></pre></td>
    <td>${codeHtmlAsciidoctor}<details class="demo-block"><summary>HTML rendering without CSS</summary>${htmlAsciidoctor}</details></td>
    <td>${codeHtmlTpConverter}<details class="demo-block"><summary>HTML rendering without CSS</summary>${htmlTpConverter}</details></td>
  </tr>`;
};

let htmlOutput = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Asciidoc Conversion Comparison</title>
  <style>
    body {
      width: 100%;
    }
    table {
      display: block;
      max-width: 100%;
      margin: 0 auto 1rem;
      border-collapse: collapse;
      border-spacing: 0;
      inline-size: fit-content;
      overflow-x: auto;
    }
    table tr {
      width: 100%;
    }
    caption {
      margin-top: 0.5rem;
      caption-side: bottom;
      color: #656d76;
      font-weight: 600;
    }
    tbody > tr:nth-child(2n) {
      background: #f6f8fa;
    }
    th, td {
      padding: 0.375rem 0.8125rem;
      border: 1px solid #161b22;
      vertical-align: top;
    }
    th {
      border-color: #24292f;
      background: #d0d7de;
      font-weight: bold;
    }
    pre.shiki {
      margin: 0;
      padding: 0.5rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      width: 300px;
      white-space: pre;
    }
    details.demo-block {
      display: block;
      padding: 1rem;
      border: 1px solid lightgray;
      border-radius: 6px;
      margin: 0 0 1rem;
      & > summary {
        cursor: pointer;
        user-select: none;
      }
      & > summary:hover {
        text-decoration: underline;
      }
    }
  </style>
</head>
<body>
  <table>
    <caption>Asciidoc Conversion Comparison</caption>
    <thead>
      <tr>
        <th>asciidoctor node</th>
        <th>asciidoc</th>
        <th>asciidoctor.js</th>
        <th>tp-asciidoc.js</th>
      </tr>
    </thead>
    <tbody>`;

    
for (const { name, content, options } of testCases) {
  console.log('case:', name, options);
  const shikiContent = await highlighter.codeToHtml(content, { lang: 'asciidoc', theme: 'dark-plus' });
  const htmlAsciidoctor = await formatHtml(asciidoctor.convert(content, options) as string);
  const htmlTpAsciidoc = await formatHtml(asciidoctor.convert(content, { ...options, converter: TpConverter }) as string);
  const codeHtmlAsciidoctor = await highlighter.codeToHtml(htmlAsciidoctor, { lang: 'html', theme: 'light-plus' });
  const codeHtmlTpConverter = await highlighter.codeToHtml(htmlTpAsciidoc, { lang: 'html', theme: 'dark-plus' });
  htmlOutput += buildTableRow(name, shikiContent, htmlAsciidoctor, codeHtmlAsciidoctor, htmlTpAsciidoc, codeHtmlTpConverter);
}

htmlOutput += `
    </tbody>
  </table>
  <script type="module">
    import { codeToHtml } from 'https://esm.sh/shiki@3.0.0'
  </script>
</body>
</html>
`;

fs.writeFileSync('public/comparison-table.html', htmlOutput);
console.log('Comparison table generated: public/comparison-table.html');