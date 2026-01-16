const fs = require('fs');
const path = require('path');

const menuPath = path.join(__dirname, '..', 'pronto.frontend', 'app', 'r', '[slug]', 'page.tsx');

console.log('🔧 Corrigindo sintaxe JSX dos banners...');

let content = fs.readFileSync(menuPath, 'utf8');

// O problema: ") : (" sem o fragment "<>" logo após
// Precisa ser: ") : (\n            <>\n              {/* Banners... */"

const wrongPattern = /\) : \(\s+{\/\* Banners promocionais \*\/}/;
const correctReplacement = `) : (
            <>
              {/* Banners promocionais */}`;

if (content.match(wrongPattern)) {
  content = content.replace(wrongPattern, correctReplacement);
  console.log('✅ Fragment <> adicionado após ") : ("');
} else {
  console.log('❌ Padrão não encontrado. Verificando estrutura...');
}

// Verificar se precisa fechar o fragment no final
const needsClosingFragment = content.includes('              {/* Banners promocionais */}') && 
                             !content.includes('              </>\n            )}');

if (needsClosingFragment) {
  // Procurar onde termina o map de produtos sem categoria
  const endPattern = /(\s+)\}\)\)\n(\s+)\}\n(\s+)<\/>/g;
  const matches = [...content.matchAll(endPattern)];
  
  if (matches.length > 0) {
    const lastMatch = matches[matches.length - 1];
    const replacement = `${lastMatch[1]}))\n${lastMatch[2]}}\n${lastMatch[2]}              </>\n${lastMatch[3]}</>`;
    content = content.replace(lastMatch[0], replacement);
    console.log('✅ Fragment de fechamento </> adicionado');
  }
}

fs.writeFileSync(menuPath, content, 'utf8');
console.log('✅ Sintaxe corrigida!');
console.log('\n📌 Estrutura agora é:');
console.log('   ) : (');
console.log('     <>');
console.log('       {/* Banners... */}');
console.log('       {banners.map(...)}');
console.log('       ...');
console.log('       {restaurant?.categories?.map(...)}');
console.log('       ...');
console.log('     </>');
console.log('   )}');
