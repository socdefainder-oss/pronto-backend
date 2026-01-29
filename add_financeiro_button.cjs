const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\page.tsx';

console.log('📝 Adicionando botão Financeiro ao dashboard...\n');

let content = fs.readFileSync(filePath, 'utf8');

// Procurar onde está "Administrar Loja" e adicionar o botão Financeiro depois dele
const oldCode = `                          </Link>
                          <Link
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg shadow-emerald-600/30 text-sm"
                            href={\`/app/restaurant/\${r.id}\`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Gestor de Produtos
                          </Link>`;

const newCode = `                          </Link>
                          <Link
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-green-200 text-gray-700 font-semibold hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition text-sm"
                            href={\`/app/restaurant/\${r.id}/financeiro\`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Financeiro
                          </Link>
                          <Link
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg shadow-emerald-600/30 text-sm"
                            href={\`/app/restaurant/\${r.id}\`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Gestor de Produtos
                          </Link>`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Botão Financeiro adicionado com sucesso!');
  console.log('   • Posição: Entre Administrar Loja e Gestor de Produtos');
  console.log('   • Rota: /app/restaurant/${r.id}/financeiro');
  console.log('   • Ícone: Cifrão ($)');
  console.log('   • Cor: Verde');
} else {
  console.log('❌ Não foi possível encontrar o local exato para inserir.');
  console.log('   Tentando método alternativo...');
  
  // Método alternativo: procurar por "Gestor de Produtos"
  if (content.includes('Gestor de Produtos')) {
    const lines = content.split('\n');
    const produtosIndex = lines.findIndex(line => line.includes('Gestor de Produtos'));
    
    if (produtosIndex > 0) {
      // Inserir o botão Financeiro antes de Gestor de Produtos
      const financeiroButton = `                          <Link
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-green-200 text-gray-700 font-semibold hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition text-sm"
                            href={\`/app/restaurant/\${r.id}/financeiro\`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Financeiro
                          </Link>`;
      
      // Encontrar o início do Link de Produtos (algumas linhas antes)
      let insertIndex = produtosIndex;
      for (let i = produtosIndex - 1; i >= 0; i--) {
        if (lines[i].includes('<Link') && lines[i].includes('className=')) {
          insertIndex = i;
          break;
        }
      }
      
      lines.splice(insertIndex, 0, financeiroButton);
      content = lines.join('\n');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✅ Botão Financeiro adicionado com sucesso (método alternativo)!');
    }
  }
}

console.log('\n📋 Próximo passo: Criar a página /app/restaurant/[id]/financeiro');
