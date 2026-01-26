const fs = require('fs');
const path = require('path');

// Caminho do arquivo do restaurante individual
const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\page.tsx';

console.log('🔍 Procurando arquivo do restaurante...');

if (!fs.existsSync(filePath)) {
  console.log('❌ Arquivo não encontrado:', filePath);
  process.exit(1);
}

console.log('✅ Arquivo encontrado!');
console.log('📝 Lendo conteúdo...');

let content = fs.readFileSync(filePath, 'utf8');

// Substituições dos textos dos botões
const replacements = [
  { old: '>Ver</', new: '>Acessar Cardápio</' },
  { old: 'Ver</Link>', new: 'Acessar Cardápio</Link>' },
  { old: '>Pedidos</', new: '>Gestor de Pedidos</' },
  { old: 'Pedidos</Link>', new: 'Gestor de Pedidos</Link>' },
  { old: '>Configurações</', new: '>Administrar Loja</' },
  { old: 'Configurações</Link>', new: 'Administrar Loja</Link>' },
  { old: '>Produtos</', new: '>Editor de Cardápio</' },
  { old: 'Produtos</Link>', new: 'Editor de Cardápio</Link>' },
];

console.log('\n🔄 Aplicando alterações...');

let changeCount = 0;
replacements.forEach(({ old, new: newText }) => {
  if (content.includes(old)) {
    content = content.replace(new RegExp(old, 'g'), newText);
    changeCount++;
    console.log(`   ✓ "${old}" → "${newText}"`);
  }
});

if (changeCount === 0) {
  console.log('⚠️  Nenhuma alteração foi necessária (textos já podem estar atualizados)');
} else {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\n✅ Arquivo atualizado com sucesso! (${changeCount} alterações)`);
  console.log('\n📋 Resumo das mudanças:');
  console.log('   • Ver → Acessar Cardápio');
  console.log('   • Pedidos → Gestor de Pedidos');
  console.log('   • Configurações → Administrar Loja');
  console.log('   • Produtos → Editor de Cardápio');
  console.log('   • Mantidos: Relatórios, Cupons, Banners');
}
