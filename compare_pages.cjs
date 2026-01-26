const fs = require('fs');

const productPagePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\products\\page.tsx';
const mainPagePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\page.tsx';

console.log('📄 Verificando arquivos...\n');

// Verificar primeira linha de cada arquivo
const productContent = fs.readFileSync(productPagePath, 'utf8');
const mainContent = fs.readFileSync(mainPagePath, 'utf8');

console.log('=== PRODUCTS/PAGE.TSX (primeiras 5 linhas) ===');
console.log(productContent.split('\n').slice(0, 5).join('\n'));

console.log('\n\n=== [ID]/PAGE.TSX (primeiras 5 linhas) ===');
console.log(mainContent.split('\n').slice(0, 5).join('\n'));

console.log('\n\n🔍 São iguais?', productContent === mainContent ? 'SIM' : 'NÃO');
console.log('   [id]/page.tsx:', mainContent.length, 'caracteres');
console.log('   [id]/products/page.tsx:', productContent.length, 'caracteres');
