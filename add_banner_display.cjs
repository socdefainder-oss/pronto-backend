const fs = require('fs');
const path = require('path');

const menuPath = path.join(__dirname, '..', 'pronto.frontend', 'app', 'r', '[slug]', 'page.tsx');

console.log('📝 Adicionando exibição de banners...');

let content = fs.readFileSync(menuPath, 'utf8');

// Adicionar componente de exibição de banner ANTES do map de categorias
const bannerDisplay = `              {/* Banners promocionais */}
              {banners.length > 0 && (
                <div className="mb-8 space-y-4">
                  {banners.map((banner) => (
                    <div
                      key={banner.id}
                      className="rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition cursor-pointer transform hover:scale-[1.02] duration-200"
                      onClick={() => banner.linkUrl && window.open(banner.linkUrl, '_blank')}
                    >
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-48 md:h-64 object-cover"
                      />
                      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
                        <h3 className="text-white font-bold text-xl">{banner.title}</h3>
                        {banner.description && (
                          <p className="text-emerald-50 text-sm mt-1">{banner.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

`;

// Procurar o local exato onde está o início do map de categorias
const categoryMapRegex = /(\s+)(<>\s*\n\s+{restaurant\?\.categories\?\.map\(\(category: any\) => \()/;
const match = content.match(categoryMapRegex);

if (match) {
  const insertPosition = match.index + match[1].length + match[2].length - match[2].trimStart().length;
  content = content.slice(0, insertPosition) + bannerDisplay + content.slice(insertPosition);
  console.log('✅ Exibição de banners adicionada antes das categorias');
  
  fs.writeFileSync(menuPath, content, 'utf8');
  console.log('✅ Arquivo atualizado com sucesso!');
  console.log('\n📌 Banners agora aparecem:');
  console.log('   ✅ Acima do cardápio (após "Cardápio em preparação" ou início das categorias)');
  console.log('   ✅ Com imagem, título e descrição');
  console.log('   ✅ Clicáveis se tiverem linkUrl configurado');
  console.log('\n🔍 Para testar:');
  console.log('   1. Acesse /app/restaurant/[id]/banners');
  console.log('   2. Crie um banner ativo com imagem');
  console.log('   3. Abra o cardápio público /r/[slug]');
  console.log('   4. Banner deve aparecer no topo do cardápio');
} else {
  console.log('❌ Não encontrou o local para inserir exibição');
  console.log('\n💡 Tentando localização alternativa...');
  
  // Tentar localização alternativa: logo após o "} ) : ("
  const alternativeRegex = /\) : \(\s*\n\s*<>/;
  const altMatch = content.match(alternativeRegex);
  
  if (altMatch) {
    const insertPosition = altMatch.index + altMatch[0].length;
    content = content.slice(0, insertPosition) + '\n' + bannerDisplay + content.slice(insertPosition);
    console.log('✅ Exibição de banners adicionada (localização alternativa)');
    
    fs.writeFileSync(menuPath, content, 'utf8');
    console.log('✅ Arquivo atualizado!');
  } else {
    console.log('❌ Não foi possível adicionar automaticamente');
    console.log('\n📝 Adicione manualmente este código');
    console.log(bannerDisplay);
  }
}
