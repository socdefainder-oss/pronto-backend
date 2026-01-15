const fs = require('fs');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\products\\page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Procurar e remover o botão Voltar problemático
const buttonPattern = /<button\s+type="button"\s+onClick={([\s\S]*?)}}\s+className="([^"]+)"\s*>\s*⬅️ Voltar[\s\S]*?<\/button>/;

const match = content.match(buttonPattern);

if (match) {
  const className = match[2];
  
  // Substituir por um Link simples do Next.js
  const newLink = `<Link
            href={\`/app/restaurant/\${restaurantId}\`}
            className="${className}"
          >
            ← Voltar
          </Link>`;
  
  content = content.replace(match[0], newLink);
  console.log('✅ Botão substituído por Link do Next.js!');
} else {
  console.log('⚠️  Padrão não encontrado, procurando manualmente...');
  
  const lines = content.split('\n');
  let buttonStart = -1;
  let buttonEnd = -1;
  
  // Encontrar o botão
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('⬅️ Voltar') || lines[i].includes('← Voltar')) {
      // Procurar início do button
      for (let j = i; j >= Math.max(0, i - 20); j--) {
        if (lines[j].includes('<button') && lines[j].includes('type="button"')) {
          buttonStart = j;
          // Procurar fim
          for (let k = i; k < Math.min(lines.length, i + 3); k++) {
            if (lines[k].includes('</button>')) {
              buttonEnd = k;
              break;
            }
          }
          break;
        }
      }
      break;
    }
  }
  
  if (buttonStart >= 0 && buttonEnd >= 0) {
    console.log(`🔍 Botão encontrado nas linhas ${buttonStart + 1} a ${buttonEnd + 1}`);
    
    // Extrair className
    let className = 'px-4 py-2 rounded-lg border border-zinc-300 hover:bg-zinc-50 transition';
    for (let i = buttonStart; i <= buttonEnd; i++) {
      const classMatch = lines[i].match(/className="([^"]+)"/);
      if (classMatch) {
        className = classMatch[1];
        break;
      }
    }
    
    // Substituir por Link
    const newLinkLines = [
      '          <Link',
      '            href={`/app/restaurant/${restaurantId}`}',
      `            className="${className}"`,
      '          >',
      '            ← Voltar',
      '          </Link>'
    ];
    
    lines.splice(buttonStart, buttonEnd - buttonStart + 1, ...newLinkLines);
    content = lines.join('\n');
    
    console.log('✅ Botão substituído por Link!');
  } else {
    console.error('❌ Não encontrei o botão');
    process.exit(1);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Arquivo salvo!');
console.log('');
console.log('🎯 Mudanças:');
console.log('   - Removido botão com onClick problemático');
console.log('   - Adicionado <Link> do Next.js');
console.log('   - Link navega diretamente sem JavaScript');
console.log('   - Mesma estilização visual');
