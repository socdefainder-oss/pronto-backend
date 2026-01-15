const fs = require('fs');
const path = require('path');

const frontendPath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\products\\page.tsx';

// Verificar se o arquivo existe
if (!fs.existsSync(frontendPath)) {
  console.error('❌ Arquivo não encontrado:', frontendPath);
  console.log('🔍 Por favor, verifique o caminho do projeto frontend.');
  process.exit(1);
}

console.log('📖 Lendo arquivo...');
let content = fs.readFileSync(frontendPath, 'utf8');

// Procurar pela função handleBack e substituir
const oldHandleBackPattern = /function handleBack\(\) \{[\s\S]*?\n  \}/;

const newHandleBack = `function handleBack() {
    console.log("🔙 Voltando para gerenciar restaurante");
    console.log("📍 restaurantId:", restaurantId);
    console.log("📍 params:", params);
    
    const id = restaurantId || params?.id;
    if (!id) {
      console.error("❌ Restaurant ID não encontrado");
      router.push('/app/restaurants');
      return;
    }
    
    console.log("✅ Navegando para:", \`/app/restaurant/\${id}\`);
    router.push(\`/app/restaurant/\${id}\`);
  }`;

if (content.match(oldHandleBackPattern)) {
  content = content.replace(oldHandleBackPattern, newHandleBack);
  console.log('✅ Função handleBack atualizada com logs de debug!');
} else {
  console.log('⚠️  Padrão da função handleBack não encontrado. Tentando inserir...');
  
  // Tentar inserir antes da seção "Loading state"
  if (content.includes('// Loading state')) {
    content = content.replace('// Loading state', newHandleBack + '\n\n  // Loading state');
    console.log('✅ Função handleBack inserida!');
  } else {
    console.error('❌ Não foi possível encontrar local para inserir a função');
    process.exit(1);
  }
}

// Verificar se o botão está correto
if (!content.includes('onClick={handleBack}')) {
  console.log('⚠️  O botão não tem onClick={handleBack}, procurando...');
  
  // Procurar e corrigir o botão Voltar
  const buttonPattern = /(<button[^>]*>[\s\S]*?← Voltar[^<]*<\/button>)/;
  const match = content.match(buttonPattern);
  
  if (match) {
    const oldButton = match[0];
    if (!oldButton.includes('onClick')) {
      const newButton = oldButton.replace('<button', '<button\n            onClick={handleBack}');
      content = content.replace(oldButton, newButton);
      console.log('✅ onClick adicionado ao botão Voltar!');
    }
  }
}

// Escrever arquivo corrigido
fs.writeFileSync(frontendPath, content, 'utf8');
console.log('✅ Arquivo atualizado com sucesso!');
console.log('');
console.log('🔍 Para testar:');
console.log('1. Abra o console do navegador (F12)');
console.log('2. Clique no botão "← Voltar"');
console.log('3. Veja os logs para diagnosticar o problema');
