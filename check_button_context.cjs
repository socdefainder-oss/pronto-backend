const fs = require('fs');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\products\\page.tsx';

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('🔍 Procurando contexto completo do botão Voltar...\n');

// Encontrar o botão
let buttonLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('⬅️ Voltar') || lines[i].includes('← Voltar')) {
    buttonLine = i;
    break;
  }
}

if (buttonLine >= 0) {
  console.log(`✅ Botão encontrado na linha ${buttonLine + 1}`);
  console.log('\n📝 Contexto (20 linhas antes e 10 depois):\n');
  
  for (let i = Math.max(0, buttonLine - 20); i < Math.min(lines.length, buttonLine + 10); i++) {
    const marker = i === buttonLine ? '>>> ' : '    ';
    console.log(`${marker}${String(i + 1).padStart(4)}: ${lines[i]}`);
  }
  
  // Verificar se está dentro de um Link ou form
  console.log('\n🔍 Análise:\n');
  
  const contextAbove = lines.slice(Math.max(0, buttonLine - 20), buttonLine).join('\n');
  
  if (contextAbove.includes('<Link')) {
    console.log('⚠️  PROBLEMA: Botão pode estar dentro de um <Link>!');
  }
  
  if (contextAbove.includes('<form')) {
    console.log('⚠️  PROBLEMA: Botão pode estar dentro de um <form>!');
  }
  
  if (contextAbove.includes('<a ') || contextAbove.includes('<a>')) {
    console.log('⚠️  PROBLEMA: Botão pode estar dentro de um <a>!');
  }
  
  // Verificar o texto exato do botão
  if (lines[buttonLine].includes('⬅️')) {
    console.log('✅ Botão tem emoji ⬅️ (código NOVO)');
  } else if (lines[buttonLine].includes('←')) {
    console.log('⚠️  Botão tem ← (código ANTIGO)');
  }
  
} else {
  console.log('❌ Botão não encontrado no arquivo!');
}

console.log('\n' + '='.repeat(60));
console.log('\n🔎 Verificando versão do código:\n');

if (content.includes('⬅️ Voltar')) {
  console.log('✅ Arquivo LOCAL tem código NOVO (⬅️ Voltar)');
} else if (content.includes('← Voltar ao restaurante')) {
  console.log('⚠️  Arquivo LOCAL tem código ANTIGO (← Voltar ao restaurante)');
} else {
  console.log('❓ Não consegui identificar a versão do botão');
}
