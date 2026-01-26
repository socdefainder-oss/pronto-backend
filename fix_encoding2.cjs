const fs = require('fs');

const files = [
  'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\login\\page.tsx',
  'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\register\\page.tsx',
  'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\settings\\page.tsx',
];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove BOM if exists
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  
  // Fix specific wrong texts by replacing entire phrases
  const fixes = {
    'N├úo tem conta?': 'Não tem conta?',
    'N├â┬úo tem conta?': 'Não tem conta?',
    'Criar conta gr├ítis': 'Criar conta grátis',
    'Criar conta gr├â┬ítis': 'Criar conta grátis',
    'J├í tem conta?': 'Já tem conta?',
    'Usu├írio': 'Usuário',
    'Ol├í': 'Olá',
    'Configura├º├╡es': 'Configurações',
    'Informa├º├╡es': 'Informações',
    'Relat├│rios': 'Relatórios',
    'descri├º├úo': 'descrição',
    'at├®': 'até',
    'Pr├®via': 'Prévia',
    'm├¡nimo': 'mínimo',
  };
  
  let changed = false;
  Object.keys(fixes).forEach(wrong => {
    if (content.includes(wrong)) {
      content = content.split(wrong).join(fixes[wrong]);
      changed = true;
      console.log(`  - Fixed: "${wrong}" -> "${fixes[wrong]}"`);
    }
  });
  
  if (changed) {
    // Write with UTF-8 without BOM
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    console.log(`✅ ${filePath}`);
  }
});

console.log('\n✅ Encoding fix complete!');
