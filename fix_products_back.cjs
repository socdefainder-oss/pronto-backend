const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\products\\page.tsx';

// Ler arquivo
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Melhorar a função handleBack para ser mais robusta
const oldHandleBack = `function handleBack() {
    console.log("Voltando para gerenciar restaurante");
    router.push(\`/app/restaurant/\${restaurantId}\`);
  }`;

const newHandleBack = `function handleBack() {
    console.log("Voltando para gerenciar restaurante");
    const id = restaurantId || params?.id;
    if (!id) {
      console.error("Restaurant ID não encontrado");
      return;
    }
    router.push(\`/app/restaurant/\${id}\`);
  }`;

if (content.includes(oldHandleBack)) {
  content = content.replace(oldHandleBack, newHandleBack);
  console.log('✅ Função handleBack corrigida!');
} else {
  console.log('⚠️  Padrão exato não encontrado, tentando substituição simples...');
  // Fallback: substituir apenas a linha do router.push
  const oldLine = `router.push(\`/app/restaurant/\${restaurantId}\`);`;
  const newLine = `const id = restaurantId || params?.id;
    if (!id) {
      console.error("Restaurant ID não encontrado");
      router.push('/app/restaurants');
      return;
    }
    router.push(\`/app/restaurant/\${id}\`);`;
  
  if (content.includes(oldLine)) {
    content = content.replace(oldLine, newLine);
    console.log('✅ Router.push corrigido!');
  }
}

// Escrever arquivo corrigido
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Arquivo atualizado com sucesso!');
