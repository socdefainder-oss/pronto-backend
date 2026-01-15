const fs = require('fs');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\products\\page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Adicionar um emoji no texto do botão para confirmar que é a nova versão
content = content.replace(
  '← Voltar ao restaurante',
  '⬅️ Voltar'
);

// Adicionar alert de debug no início do onClick
const oldOnClick = `onClick={(e) => {
              e.preventDefault();
              const id = restaurantId || params?.id;
              if (id) window.location.href = \`/app/restaurant/\${id}\`;
              else alert('ID não encontrado');
            }}`;

const newOnClick = `onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const id = restaurantId || params?.id;
              console.log('🔘 Botão clicado! ID:', id);
              if (!id) {
                alert('❌ ID do restaurante não encontrado');
                return;
              }
              const targetUrl = \`/app/restaurant/\${id}\`;
              console.log('🎯 Navegando para:', targetUrl);
              window.location.href = targetUrl;
            }}`;

if (content.includes(oldOnClick)) {
  content = content.replace(oldOnClick, newOnClick);
  console.log('✅ onClick melhorado com debug e stopPropagation');
} else {
  console.log('⚠️  onClick não encontrado no padrão esperado');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Arquivo atualizado!');
console.log('');
console.log('🎨 Mudanças:');
console.log('   - Botão agora mostra "⬅️ Voltar" (emoji diferente)');
console.log('   - Adicionado stopPropagation para evitar bubbling');
console.log('   - Adicionado console.log para debug');
console.log('   - Alert melhorado com emoji');
console.log('');
console.log('👀 Se você ver "⬅️ Voltar" no botão, o novo código está ativo!');
