const fs = require('fs');

const mainPagePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\page.tsx';
const content = fs.readFileSync(mainPagePath, 'utf8');

// Procurar por todas as linhas que contenham Link e href
const lines = content.split('\n');
const linksWithHref = [];

lines.forEach((line, index) => {
  if (line.includes('href') && (line.includes('Link') || line.includes('orders') || line.includes('products') || line.includes('settings') || line.includes('reports') || line.includes('coupons') || line.includes('banners'))) {
    linksWithHref.push({
      line: index + 1,
      content: line.trim()
    });
  }
});

console.log(`🔗 Encontradas ${linksWithHref.length} linhas com links:\n`);
linksWithHref.forEach(item => {
  console.log(`Linha ${item.line}: ${item.content}`);
});

// Procurar também por textos dos botões
console.log('\n\n📝 Procurando textos dos botões:\n');
const buttonTexts = ['Pedidos', 'Produtos', 'Configurações', 'Relatórios', 'Cupons', 'Banners', 'Ver'];
buttonTexts.forEach(text => {
  const matches = lines.filter((line, idx) => line.includes(`>${text}<`) || line.includes(`>${text}</`));
  if (matches.length > 0) {
    console.log(`"${text}" encontrado em ${matches.length} linha(s)`);
    matches.forEach(match => {
      const idx = lines.indexOf(match);
      console.log(`  Linha ${idx + 1}: ${match.trim().substring(0, 80)}...`);
    });
  }
});
