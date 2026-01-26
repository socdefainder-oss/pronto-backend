const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\page.tsx';

console.log('📖 Lendo arquivo:', filePath);
console.log('');

const content = fs.readFileSync(filePath, 'utf8');

// Mostrar apenas as primeiras 200 linhas
const lines = content.split('\n');
console.log(`Total de linhas: ${lines.length}\n`);
console.log('═══════ PRIMEIRAS 200 LINHAS ═══════\n');
console.log(lines.slice(0, 200).join('\n'));
