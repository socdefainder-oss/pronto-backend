const fs = require('fs');
const path = require('path');

const menuPath = path.join(__dirname, '..', 'pronto.frontend', 'app', 'r', '[slug]', 'page.tsx');

console.log('🔧 Removendo fragment JSX duplicado...');

let content = fs.readFileSync(menuPath, 'utf8');

// Remove o <> duplicado que está logo após o fechamento do map de banners
const wrongPattern = /\}\)\n\s+<\/div>\n\s+\)\}\n\s+\}\)\n\n<>/;
const correctReplacement = '})\n              </div>\n            )}\n          })\n';

if (content.match(wrongPattern)) {
  content = content.replace(wrongPattern, correctReplacement);
  console.log('✅ Fragment duplicado removido');
  
  fs.writeFileSync(menuPath, content, 'utf8');
  console.log('✅ Sintaxe corrigida!');
  console.log('\n📌 Estrutura correta:');
  console.log('   ) : (');
  console.log('     <>');
  console.log('       {banners.map(...)}');
  console.log('       {restaurant?.categories?.map(...)}');
  console.log('       {restaurant?.productsWithoutCategory...}');
  console.log('     </>');
  console.log('   )}');
} else {
  console.log('❌ Padrão não encontrado');
  console.log('Procurando manualmente por "<>"...');
  
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.trim() === '<>' && idx > 340 && idx < 360) {
      console.log(`Encontrado na linha ${idx + 1}: "${line}"`);
    }
  });
}
