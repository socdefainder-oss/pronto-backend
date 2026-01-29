const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\page.tsx';

console.log('📝 Adicionando botões Delivery e Integrações ao dashboard...\n');

let content = fs.readFileSync(filePath, 'utf8');

// Procurar o botão "Gestor de Produtos" e adicionar antes dele
const oldCode = `                          <Link
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg shadow-emerald-600/30 text-sm"
                            href={\`/app/restaurant/\${r.id}\`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Gestor de Produtos
                          </Link>`;

const newCode = `                          <Link
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-cyan-200 text-gray-700 font-semibold hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-700 transition text-sm"
                            href={\`/app/restaurant/\${r.id}/delivery\`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m-4 0v-2m4 2v-2m6 2a2 2 0 104 0m-4 0a2 2 0 114 0m-4 0v-2m4 2v-2" />
                            </svg>
                            Delivery
                          </Link>
                          <Link
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-pink-200 text-gray-700 font-semibold hover:border-pink-500 hover:bg-pink-50 hover:text-pink-700 transition text-sm"
                            href={\`/app/restaurant/\${r.id}/integracoes\`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                            </svg>
                            Integrações
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

if (content.includes('Gestor de Produtos')) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Botões Delivery e Integrações adicionados com sucesso!');
  console.log('   • Delivery: Cor ciano, ícone de caminhão');
  console.log('   • Integrações: Cor rosa, ícone de puzzle');
} else {
  console.log('❌ Não foi possível encontrar o local para inserir.');
}

console.log('\n📋 Próximo passo: Criar as páginas...');
