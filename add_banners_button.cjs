const fs = require('fs');
const path = require('path');

// Dashboard path - assumindo estrutura padrão Next.js
const dashboardPath = path.join(__dirname, '..', 'pronto.frontend', 'app', 'app', 'page.tsx');

console.log('🔍 Procurando arquivo do dashboard...');
console.log('Caminho:', dashboardPath);

if (!fs.existsSync(dashboardPath)) {
  console.log('❌ Arquivo do dashboard não encontrado no caminho esperado');
  console.log('📝 Por favor, adicione manualmente o botão de Banners ao dashboard:');
  console.log(`
  <Link
    href={\`/app/restaurant/\${r.id}/banners\`}
    className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-pink-50 hover:border-orange-400 hover:shadow-xl transition group"
  >
    <svg className="w-8 h-8 text-orange-600 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
    <span className="text-sm font-bold text-gray-900">Banners</span>
  </Link>
  `);
  process.exit(0);
}

let content = fs.readFileSync(dashboardPath, 'utf8');

// Verifica se já existe o botão de Banners
if (content.includes('/banners')) {
  console.log('✅ Botão de Banners já existe no dashboard!');
  process.exit(0);
}

// Procura o botão de Cupons para adicionar depois dele
const cuponsButtonPattern = /(<Link\s+href=\{`\/app\/restaurant\/\$\{r\.id\}\/coupons`\}[\s\S]*?<\/Link>)/;
const match = content.match(cuponsButtonPattern);

if (!match) {
  console.log('❌ Não foi possível encontrar o botão de Cupons');
  console.log('📝 Adicione manualmente o botão após o código fornecido acima');
  process.exit(1);
}

const bannersButton = `
              <Link
                href={\`/app/restaurant/\${r.id}/banners\`}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-pink-50 hover:border-orange-400 hover:shadow-xl transition group"
              >
                <svg className="w-8 h-8 text-orange-600 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <span className="text-sm font-bold text-gray-900">Banners</span>
              </Link>`;

// Adiciona o botão de Banners após o de Cupons
content = content.replace(match[0], match[0] + bannersButton);

fs.writeFileSync(dashboardPath, content, 'utf8');
console.log('✅ Botão de Banners adicionado ao dashboard com sucesso!');
