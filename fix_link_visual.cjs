const fs = require('fs');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\products\\page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Substituir o Link atual por uma versão mais robusta com fallback e visual diferente
const oldLink = `<Link
            href={\`/app/restaurant/\${restaurantId}\`}
            className="px-4 py-2 rounded-lg border border-zinc-300 hover:bg-zinc-50 transition"
          >
            ← Voltar
          </Link>`;

const newLink = `<Link
            href={\`/app/restaurant/\${restaurantId || params?.id || 'erro'}\`}
            className="px-4 py-2 rounded-lg border-2 border-blue-600 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition"
            style={{ borderColor: '#2563eb' }}
          >
            🔙 VOLTAR [v2]
          </Link>`;

if (content.includes(oldLink)) {
  content = content.replace(oldLink, newLink);
  console.log('✅ Link atualizado com visual azul e fallback!');
} else {
  console.log('⚠️  Padrão exato não encontrado, usando regex...');
  
  const pattern = /<Link\s+href={\`\/app\/restaurant\/\$\{restaurantId\}\`}\s+className="[^"]+"\s*>\s*← Voltar\s*<\/Link>/;
  
  if (content.match(pattern)) {
    content = content.replace(pattern, newLink);
    console.log('✅ Link atualizado via regex!');
  } else {
    console.error('❌ Não encontrei o Link');
    process.exit(1);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Arquivo salvo!');
console.log('');
console.log('🎨 Mudanças:');
console.log('   - Link agora é AZUL (fácil de identificar)');
console.log('   - Texto: "🔙 VOLTAR [v2]"');
console.log('   - Fallback: usa params?.id se restaurantId for undefined');
console.log('');
console.log('👀 Se você ver um botão AZUL com "🔙 VOLTAR [v2]", o novo código está ativo!');
