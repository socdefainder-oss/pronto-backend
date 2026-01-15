const fs = require('fs');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\products\\page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Procurar pelo botão Voltar e modificar para usar evento inline
const buttonPattern = /<button\s+type="button"\s+onClick={handleBack}\s+className="([^"]+)"\s*>\s*← Voltar ao restaurante\s*<\/button>/;

const match = content.match(buttonPattern);

if (match) {
  const className = match[1];
  const newButton = `<button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const id = restaurantId || params?.id;
              if (id) window.location.href = \`/app/restaurant/\${id}\`;
              else alert('ID não encontrado');
            }}
            className="${className}"
          >
            ← Voltar ao restaurante
          </button>`;
  
  content = content.replace(match[0], newButton);
  console.log('✅ Botão Voltar atualizado com evento inline!');
} else {
  console.log('⚠️  Padrão exato não encontrado, tentando padrão mais flexível...');
  
  // Procurar de forma mais flexível
  const lines = content.split('\n');
  let buttonStart = -1;
  let buttonEnd = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('← Voltar ao restaurante') || lines[i].includes('← Voltar')) {
      // Procurar o início do button acima
      for (let j = i; j >= Math.max(0, i - 10); j--) {
        if (lines[j].includes('<button') && (lines[j].includes('handleBack') || lines[j].includes('Voltar'))) {
          buttonStart = j;
          buttonEnd = i + 1; // Incluir a linha de fechamento
          // Procurar o </button>
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
  
  if (buttonStart >= 0) {
    console.log(`🔍 Botão encontrado nas linhas ${buttonStart + 1} a ${buttonEnd + 1}`);
    
    // Extrair className do botão atual
    let className = 'px-4 py-2 rounded-lg border border-zinc-300 hover:bg-zinc-50 transition';
    for (let i = buttonStart; i <= buttonEnd; i++) {
      const classMatch = lines[i].match(/className="([^"]+)"/);
      if (classMatch) {
        className = classMatch[1];
        break;
      }
    }
    
    const newButtonLines = [
      '          <button',
      '            type="button"',
      '            onClick={(e) => {',
      '              e.preventDefault();',
      '              const id = restaurantId || params?.id;',
      '              if (id) window.location.href = `/app/restaurant/${id}`;',
      '              else alert(\'ID não encontrado\');',
      '            }}',
      `            className="${className}"`,
      '          >',
      '            ← Voltar ao restaurante',
      '          </button>'
    ];
    
    // Substituir as linhas
    lines.splice(buttonStart, buttonEnd - buttonStart + 1, ...newButtonLines);
    content = lines.join('\n');
    
    console.log('✅ Botão substituído com evento inline!');
  } else {
    console.error('❌ Não foi possível encontrar o botão');
    process.exit(1);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Arquivo salvo!');
console.log('');
console.log('🎯 O botão agora tem o evento inline diretamente no JSX');
console.log('   Não depende mais da função handleBack()');
console.log('   Usa window.location.href direto');
