const fs = require('fs');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\products\\page.tsx';

if (!fs.existsSync(filePath)) {
  console.error('❌ Arquivo não encontrado');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('🔍 Procurando handleBack e botão Voltar...\n');

// Encontrar função handleBack
let foundHandleBack = false;
lines.forEach((line, i) => {
  if (line.includes('function handleBack')) {
    console.log('✅ Função handleBack encontrada na linha', i + 1);
    console.log('\nCódigo completo da função:');
    for (let j = i; j < Math.min(i + 15, lines.length); j++) {
      console.log(`${j + 1}: ${lines[j]}`);
      if (lines[j].includes('}') && j > i + 2) break;
    }
    foundHandleBack = true;
  }
});

console.log('\n' + '='.repeat(60) + '\n');

// Encontrar botão Voltar
let foundButton = false;
lines.forEach((line, i) => {
  if (line.includes('← Voltar') || line.includes('Voltar ao')) {
    console.log('🔘 Botão Voltar encontrado na linha', i + 1);
    console.log('\nCódigo do botão:');
    for (let j = Math.max(0, i - 5); j < Math.min(i + 5, lines.length); j++) {
      const marker = j === i ? '>>>' : '   ';
      console.log(`${marker} ${j + 1}: ${lines[j]}`);
    }
    foundButton = true;
  }
});

if (!foundHandleBack) {
  console.log('❌ Função handleBack NÃO encontrada');
}

if (!foundButton) {
  console.log('❌ Botão Voltar NÃO encontrado');
}

console.log('\n' + '='.repeat(60) + '\n');

// Verificar se tem type="button"
if (content.includes('onClick={handleBack}')) {
  console.log('✅ onClick={handleBack} presente no arquivo');
  
  const buttonMatch = content.match(/<button[^>]*onClick={handleBack}[^>]*>/);
  if (buttonMatch) {
    const buttonTag = buttonMatch[0];
    console.log('\nTag completa do botão:');
    console.log(buttonTag);
    
    if (buttonTag.includes('type="button"')) {
      console.log('\n✅ type="button" está presente!');
    } else {
      console.log('\n❌ type="button" NÃO está presente!');
    }
  }
} else {
  console.log('❌ onClick={handleBack} NÃO encontrado');
}
