const fs = require('fs');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\products\\page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Trocar para usar window.location.href diretamente
const oldHandleBack = /function handleBack\(\) \{[\s\S]*?\n  \}/;

const newHandleBack = `function handleBack() {
    const id = restaurantId || params?.id;
    if (!id) {
      alert('Erro: ID do restaurante não encontrado');
      return;
    }
    
    // Navegação direta - força refresh completo da página
    window.location.href = \`/app/restaurant/\${id}\`;
  }`;

if (content.match(oldHandleBack)) {
  content = content.replace(oldHandleBack, newHandleBack);
  console.log('✅ handleBack atualizado para usar window.location.href diretamente');
} else {
  console.error('❌ Função handleBack não encontrada');
  process.exit(1);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Arquivo salvo!');
console.log('');
console.log('🔧 Agora usa window.location.href ao invés de router.push()');
console.log('   Isso força um refresh completo da página');
