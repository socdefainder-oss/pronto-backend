const fs = require('fs');
const path = require('path');

const frontendPath = path.join('..', 'pronto.frontend', 'app', 'app', 'restaurant', '[id]', 'page.tsx');
const filePath = path.resolve(__dirname, frontendPath);

console.log('🔧 Verificando carregamento do slogan...');
console.log('📂 Arquivo:', filePath);

let content = fs.readFileSync(filePath, 'utf8');

// Verifica se já tem o setSlogan no carregamento
if (content.includes('setSlogan(') && content.includes('restaurant.slogan')) {
  console.log('✅ Carregamento do slogan já está configurado!');
  process.exit(0);
}

// Procura por onde setDescription é chamado com os dados do restaurante
const patterns = [
  /setDescription\((data\.)?restaurant\.description/g,
  /setPhone\((data\.)?restaurant\.phone/g,
  /setAddress\((data\.)?restaurant\.address/g
];

let found = false;
for (const pattern of patterns) {
  const matches = content.match(pattern);
  if (matches && matches.length > 0) {
    console.log(`✅ Encontrado padrão: ${matches[0]}`);
    
    // Adiciona setSlogan logo após setDescription
    if (pattern.toString().includes('setDescription')) {
      content = content.replace(
        /setDescription\(((?:data\.)?restaurant\.description[^)]*)\);/,
        `setDescription($1);
        setSlogan((data?.restaurant?.slogan || restaurant?.slogan) || "");`
      );
      found = true;
      break;
    }
  }
}

if (!found) {
  console.log('⚠️ Não encontrou padrão exato. Procurando manualmente...');
  
  // Procura por qualquer linha que tenha restaurant.description
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('restaurant') && lines[i].includes('description') && lines[i].includes('set')) {
      console.log(`📍 Linha ${i + 1}: ${lines[i].trim()}`);
      // Adiciona após essa linha
      lines.splice(i + 1, 0, '        setSlogan(restaurant?.slogan || "");');
      content = lines.join('\n');
      found = true;
      break;
    }
  }
}

if (found) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Carregamento do slogan adicionado!');
} else {
  console.log('❌ Não foi possível adicionar automaticamente.');
  console.log('ℹ️ Adicione manualmente: setSlogan(restaurant?.slogan || "");');
}
