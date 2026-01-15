const fs = require('fs');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Procurar o local certo e adicionar o botão Cupons
const searchText = `                          Relatórios
                          </Link>
                          <Link
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg shadow-emerald-600/30 text-sm"
                            href={\`/app/restaurant/\${r.id}\`}
                          >`;

const replaceText = `                          Relatórios
                          </Link>
                          <Link
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 transition text-sm"
                            href={\`/app/restaurant/\${r.id}/coupons\`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            Cupons
                          </Link>
                          <Link
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg shadow-emerald-600/30 text-sm"
                            href={\`/app/restaurant/\${r.id}\`}
                          >`;

if (content.includes(searchText)) {
  content = content.replace(searchText, replaceText);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Botão Cupons adicionado com sucesso!');
} else {
  console.log('❌ Texto não encontrado. Tentando versão alternativa...');
  
  // Versão alternativa com encoding
  const searchText2 = content.match(/Relatórios[\s\S]{0,500}bg-gradient-to-r from-emerald-600 to-teal-600/);
  if (searchText2) {
    console.log('Encontrado! Conteúdo:');
    console.log(searchText2[0].substring(0, 200));
  }
}
