const fs = require('fs');
const path = require('path');

const frontendPath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\products\\page.tsx';

// Verificar se o arquivo existe
if (!fs.existsSync(frontendPath)) {
  console.error('❌ Arquivo não encontrado:', frontendPath);
  process.exit(1);
}

console.log('📖 Lendo arquivo...');
let content = fs.readFileSync(frontendPath, 'utf8');

// Procurar pelo botão Voltar e adicionar type="button"
const buttonPatterns = [
  // Padrão 1: botão Voltar sem type
  {
    old: /<button\s+onClick={handleBack}\s+className="([^"]+)"\s*>/,
    new: (match, className) => `<button\n            type="button"\n            onClick={handleBack}\n            className="${className}"\n          >`
  },
  // Padrão 2: botão com className antes de onClick
  {
    old: /<button\s+className="([^"]+)"\s+onClick={handleBack}\s*>/,
    new: (match, className) => `<button\n            type="button"\n            onClick={handleBack}\n            className="${className}"\n          >`
  },
  // Padrão 3: procurar qualquer botão com "Voltar" e sem type
  {
    old: /(<button[^>]*onClick={handleBack}[^>]*>[\s\S]*?← Voltar[^<]*<\/button>)/,
    new: (match, fullButton) => {
      if (fullButton.includes('type=')) {
        return fullButton; // já tem type, não mexer
      }
      return fullButton.replace('<button', '<button\n            type="button"');
    }
  }
];

let fixed = false;

for (const pattern of buttonPatterns) {
  const match = content.match(pattern.old);
  if (match) {
    const newContent = typeof pattern.new === 'function' 
      ? pattern.new(...match) 
      : pattern.new;
    content = content.replace(pattern.old, newContent);
    console.log('✅ Botão Voltar corrigido com type="button"!');
    fixed = true;
    break;
  }
}

if (!fixed) {
  console.log('⚠️  Padrão não encontrado, fazendo busca manual...');
  
  // Busca mais genérica: encontrar o botão com "← Voltar"
  const lines = content.split('\n');
  let buttonStartLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('← Voltar') || lines[i].includes('Voltar ao restaurante')) {
      // Procurar o <button> acima desta linha
      for (let j = i; j >= Math.max(0, i - 10); j--) {
        if (lines[j].includes('<button') && lines[j].includes('handleBack')) {
          buttonStartLine = j;
          break;
        }
      }
      break;
    }
  }
  
  if (buttonStartLine >= 0) {
    console.log('🔍 Encontrado botão na linha:', buttonStartLine + 1);
    
    // Verificar se já tem type="button"
    if (!lines[buttonStartLine].includes('type=')) {
      // Adicionar type="button" na linha do button
      lines[buttonStartLine] = lines[buttonStartLine].replace('<button', '<button\n            type="button"');
      content = lines.join('\n');
      console.log('✅ type="button" adicionado ao botão!');
      fixed = true;
    } else {
      console.log('ℹ️  Botão já tem atributo type');
    }
  }
}

if (!fixed) {
  console.error('❌ Não foi possível encontrar o botão Voltar');
  console.log('');
  console.log('🔍 Procurando por "← Voltar" no arquivo...');
  if (content.includes('← Voltar')) {
    console.log('✓ Texto encontrado no arquivo');
    console.log('📝 Mostrando contexto:');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      if (line.includes('← Voltar')) {
        console.log(`\nLinhas ${i-2} a ${i+2}:`);
        for (let j = Math.max(0, i-2); j <= Math.min(lines.length-1, i+2); j++) {
          console.log(`${j+1}: ${lines[j]}`);
        }
      }
    });
  }
  process.exit(1);
}

// Escrever arquivo corrigido
fs.writeFileSync(frontendPath, content, 'utf8');
console.log('✅ Arquivo atualizado com sucesso!');
console.log('');
console.log('🎯 O que foi corrigido:');
console.log('   - Adicionado type="button" ao botão Voltar');
console.log('   - Isso previne que o botão faça submit de formulário');
console.log('');
console.log('🔄 Agora teste novamente:');
console.log('   1. Recarregue a página no navegador');
console.log('   2. Clique no botão "← Voltar"');
console.log('   3. Deve navegar para a página do restaurante');
