import { transformerColorizedBrackets } from '@shikijs/colorized-brackets';
import { transformerNotationDiff, transformerNotationFocus, transformerNotationHighlight, transformerRenderIndentGuides } from '@shikijs/transformers';
import { createHighlighter } from 'shiki';
import { unescapeHtml } from './strings';

export const shikiThemes = {
  light: 'light-plus',
  dark: 'dark-plus',
};

const langs = [
  'adoc', 'asciidoc', 
  'bash', 
  'css', 
  'html', 
  'javascript', 'js', 'json', 'jsx',
  'md', 'markdown',
  'plaintext', 'prolog', 'py', 'python',
  'sql',
  'ts', 'tsx', 'typescript',
  'yaml',
]

const highlighter = await createHighlighter({
  themes: [ shikiThemes.light, shikiThemes.dark ],
  langs: [...langs],
})

export function shikiHighlighter(code: string, lang: string, theme?: string): string {
  const language = langs.includes(lang) ? lang : 'plaintext';
  return highlighter.codeToHtml(unescapeHtml(code), { 
    lang: language, 
    theme: theme || shikiThemes.dark,
    transformers: [
      transformerColorizedBrackets(),
      transformerNotationDiff({
        matchAlgorithm: 'v3', 
      }),
      transformerNotationHighlight(),
      transformerNotationFocus(),
      transformerRenderIndentGuides(),
    ],  
  });
}

/*
export const asciidoctorShiki: SyntaxHighlighterFunctions = {
  initialize(_name, _backend, { document }) {
    this.options = { theme: shikiThemes.dark }; // Default to dark theme
    if (document.hasAttribute("shiki-theme")) {
      this.options.theme = document.getAttribute("shiki-theme");
    }
    this.super();
  },
  highlight(_node, content, lang) {
    const language = langs.includes(lang) ? lang : 'plaintext';
    const html = highlighter.codeToHtml(content, { lang: language, ...this.options });
    console.log(`Highlighted code block (lang=${language}):`, html);
    return html;
  },
  handlesHighlighting() {
    return true;
  }
}
  */