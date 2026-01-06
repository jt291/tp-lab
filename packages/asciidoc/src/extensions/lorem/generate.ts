import { clampRandom } from "../../utilities/maths";
import { DICTIONARY } from "./dico";

export type TYPE = 'sentence' | 'title' | 'paragraph' | 'dl' | 'ol' | 'ul' | 'image';

const generateNumber = () => Math.random();

function generateWords(length: number): string[] {
  const words: string[] = [];
  for (let i = 0; i < length; i++) {
    const index = clampRandom(generateNumber(), 0, DICTIONARY.length - 1);
    words.push(DICTIONARY[index]);
  }
  return words;
}

/** Renvoie un nombre dans la plage spécifiée. */
function getNumberWithinRange(range: number | string): number {
  // Renvoie les nombres tels quels
  if (typeof range === 'number') return range || 0;
  if (typeof range === 'string' && !range.includes('-')) return Number(range) || 0;
  // Choisissez un nombre aléatoire dans la plage
  const parsedRange = String(range).split('-');
  const min = Number(parsedRange[0]) || 0;
  const max = Number(parsedRange[1]) || 0;
  return clampRandom(generateNumber(), min, max);
}

/** Génère une liste d'éléments aléatoires en fonction des propriétés actuellement définies */
function generateList(type: "dl" | "ol" | "ul", length: number | string, wordsPerSentence: number | string): string {
  const numItems = getNumberWithinRange(length);
  let items = '';
  for (let i = 0; i < numItems; i++) {
    const numWords = getNumberWithinRange(wordsPerSentence);
    const words = generateWords(numWords);
    const item = words.join(' ');
    if (type === 'dl') {
      items += `<dt>${generateTitle(length)}</dt><dd>${item.charAt(0).toUpperCase() + item.slice(1)}</dd>`;
    } else {
      items += `<li>${item.charAt(0).toUpperCase() + item.slice(1)}</li>`;
    } 
  }
  return `<${type}>${items}</${type}>`;
}

/** Génère des paragraphes aléatoires en fonction des propriétés actuellement définies */
export function generateParagraphs(length: number | string, wordsPerSentence: number | string): string[] {
  const numParagraphs = getNumberWithinRange(length);
  const paragraphs = [];
  for (let i = 0; i < numParagraphs; i++) {
    const sentences = generateSentences(length, wordsPerSentence);
    paragraphs.push(sentences);
  }
  return paragraphs;
}

/** Génère des phrases aléatoires en fonction des propriétés actuellement définies */
function generateSentences(length: number | string, wordsPerSentence: number | string): string {
  const commaFrequency = 10;
  const numSentences = getNumberWithinRange(length);
  let sentences = '';
  for (let i = 0; i < numSentences; i++) {
    const numWords = getNumberWithinRange(wordsPerSentence);
    const words = generateWords(numWords);
    let sentence = '';
    for (let j = 0; j < words.length; j++) {
      const word = words[j];
      // Met en majuscule la première lettre
      if (j === 0) {
        sentence += word.charAt(0).toUpperCase() + word.slice(1);
        continue;
      }
      // Ajoute des virgules (mais pas près de la fin de la phrase)
      if (j < words.length - 3) {
        const addComma = clampRandom(generateNumber(), 0, commaFrequency) === 0;
        if (addComma) sentence += ', ';
      }
      sentence += ` ${word}`;
    }
    sentences += `${sentence}. `;
  }
  return sentences.trim();
}

/** Génère un titre aléatoire en fonction des propriétés actuellement définies */
function generateTitle(length: number | string): string {
  const numWords = getNumberWithinRange(length);
  const words = generateWords(numWords);
  const title = [];
  for (const word of words) {
    title.push(word.charAt(0).toUpperCase() + word.slice(1));
  }
  return title.join(' ');
}

function generateImage(length: number | string): string {
  const numImages = getNumberWithinRange(length);
  const width = getNumberWithinRange('2-4') * 100;
  const height = getNumberWithinRange('1-4') * 100;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}px" height="${height}px" viewBox="0 0 24 24"><path fill="currentColor" d="M5 3h13a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3m0 1a2 2 0 0 0-2 2v11.59l4.29-4.3l2.5 2.5l5-5L20 16V6a2 2 0 0 0-2-2zm4.79 13.21l-2.5-2.5L3 19a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-1.59l-5.21-5.2zM7.5 6A2.5 2.5 0 0 1 10 8.5A2.5 2.5 0 0 1 7.5 11A2.5 2.5 0 0 1 5 8.5A2.5 2.5 0 0 1 7.5 6m0 1A1.5 1.5 0 0 0 6 8.5A1.5 1.5 0 0 0 7.5 10A1.5 1.5 0 0 0 9 8.5A1.5 1.5 0 0 0 7.5 7"/></svg>`
  return svg;
}

/*
export function generateContent(type: TYPE, length: number | string = '3-5', wordsPerSentence: number | string = '4-16'): string {
  let content = ''
  switch (type) { 
    case 'sentence':
      content = generateSentences(length, wordsPerSentence);
      break;
    case 'paragraph':
      content = generateParagraphs(length, wordsPerSentence);
      break;
    case 'title':
      content = generateTitle(length);
      break;
    case 'ol':
    case 'ul':
    case 'dl':
      content = generateList(type, length, wordsPerSentence);
      break;
    case 'image':
      content = generateImage(length)
      break;
  } 
  return content;
}
  */
