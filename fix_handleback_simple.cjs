const fs = require('fs');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\products\\page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Substituir a função handleBack por uma versão mais robusta
const oldHandleBack = `function handleBack() {
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

const newHandleBack = `function handleBack() {
    const id = restaurantId || params?.id;
    if (!id) {
      alert('Erro: ID do restaurante não encontrado');
      return;
    }
    
    const targetUrl = \`/app/restaurant/\${id}\`;
    
    // Tentar com router.push primeiro
    try {
      router.push(targetUrl);
    } catch (error) {
      // Fallback para navegação nativa
      window.location.href = targetUrl;
    }
  }`;

if (content.includes(oldHandleBack)) {
  content = content.replace(oldHandleBack, newHandleBack);
  console.log('✅ Função handleBack substituída!');
} else {
  console.log('⚠️  Padrão exato não encontrado, procurando pattern...');
  
  // Pattern mais flexível
  const pattern = /function handleBack\(\) \{[\s\S]*?router\.push\(`\/app\/restaurant\/\$\{id\}`\);[\s\S]*?\}/;
  
  if (content.match(pattern)) {
    content = content.replace(pattern, newHandleBack);
    console.log('✅ Função handleBack substituída com pattern!');
  } else {
    console.error('❌ Não foi possível encontrar a função handleBack');
    process.exit(1);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Arquivo atualizado!');
console.log('');
console.log('📝 Mudanças:');
console.log('  - Simplificada função handleBack');
console.log('  - Removidos logs que não aparecem em produção');
console.log('  - Adicionado try/catch com fallback para window.location.href');
console.log('  - Adicionado alert para mostrar erros visíveis');
