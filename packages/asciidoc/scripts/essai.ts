import { convert } from '../dist/index.js';

const input = `
.Titre
[#id.para%collapsible%open,attr1=value1,attr2=value2]
Un petit paragraphe.

`;
    

const output = convert(input);
console.log(output);

