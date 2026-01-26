const fs = require('fs');
const path = require('path');

const frontendPath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend';

const replacements = [
  // No dashboard
  { file: 'app/app/page.tsx', old: '>Ver</', new: '>Acessar Cardápio</' },
  { file: 'app/app/page.tsx', old: '>Gerenciar</', new: '>Administrar Loja</' },
  
  // Páginas de gerenciamento (títulos)
  { file: 'app/app/restaurant/[id]/orders/page.tsx', old: '>Pedidos<', new: '>Gestor de Pedidos<' },
  { file: 'app/app/restaurant/[id]/orders/page.tsx', old: 'Pedidos</h', new: 'Gestor de Pedidos</h' },
  
  { file: 'app/app/restaurant/[id]/settings/page.tsx', old: '>Configurações<', new: '>Administrar Loja<' },
  { file: 'app/app/restaurant/[id]/settings/page.tsx', old: 'Configurações</h', new: 'Administrar Loja</h' },
  
  { file: 'app/app/restaurant/[id]/products/page.tsx', old: 'Gerenciar Produtos', new: 'Editor de Cardápio' },
];

console.log('🔄 Aplicando alterações nos arquivos do frontend...\n');

let changeCount = 0;
let fileCount = 0;

replacements.forEach(({ file, old, new: newText }) => {
  const filePath = path.join(frontendPath, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Arquivo não encontrado: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes(old)) {
    content = content.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newText);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file}`);
    console.log(`   "${old}" → "${newText}"`);
    changeCount++;
    fileCount++;
  }
});

console.log(`\n📊 Resumo:`);
console.log(`   ${changeCount} alterações em ${fileCount} arquivo(s)`);
console.log(`\n✨ Alterações aplicadas:`);
console.log(`   • Ver → Acessar Cardápio`);
console.log(`   • Gerenciar → Administrar Loja`);
console.log(`   • Pedidos → Gestor de Pedidos`);
console.log(`   • Configurações → Administrar Loja`);
console.log(`   • Gerenciar Produtos → Editor de Cardápio`);
