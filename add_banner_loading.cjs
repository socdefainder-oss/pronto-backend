const fs = require('fs');
const path = require('path');

const menuPath = path.join(__dirname, '..', 'pronto.frontend', 'app', 'r', '[slug]', 'page.tsx');

console.log('📝 Adicionando função de carregar banners...');

let content = fs.readFileSync(menuPath, 'utf8');

// 1. Adicionar função loadBanners após loadRestaurant
const loadBannersFunction = `
  useEffect(() => {
    async function loadBanners() {
      if (!restaurant?.id) return;
      
      try {
        const response = await fetch(\`\${API_URL}/api/banners/public/\${restaurant.id}/active\`, { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          setBanners(data);
        }
      } catch (error) {
        console.error('Erro ao carregar banners:', error);
      }
    }

    loadBanners();
  }, [restaurant?.id]);
`;

// 2. Adicionar componente de exibição de banner
const bannerDisplay = `
          {/* Banners promocionais */}
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

// Procurar onde inserir o useEffect (após o useEffect de loadRestaurant)
const loadRestaurantEndRegex = /loadRestaurant\(\);[\s\n]+\}, \[slug\]\);/;
const match = content.match(loadRestaurantEndRegex);

if (match) {
  const insertPosition = match.index + match[0].length;
  content = content.slice(0, insertPosition) + '\n' + loadBannersFunction + content.slice(insertPosition);
  console.log('✅ useEffect de loadBanners adicionado');
} else {
  console.log('❌ Não encontrou o local para inserir useEffect');
}

// Procurar onde inserir a exibição dos banners (antes do título "Cardápio")
const menuTitleRegex = /{\/\* Cardápio \*\/}/;
const menuMatch = content.match(menuTitleRegex);

if (menuMatch) {
  const insertPosition = menuMatch.index;
  content = content.slice(0, insertPosition) + bannerDisplay + '\n' + content.slice(insertPosition);
  console.log('✅ Exibição de banners adicionada');
} else {
  console.log('❌ Não encontrou o local para inserir exibição');
}

// Salvar arquivo
fs.writeFileSync(menuPath, content, 'utf8');
console.log('✅ Arquivo atualizado com sucesso!');
console.log('\n📌 Funcionalidade de banners adicionada:');
console.log('   1. useEffect que carrega banners ativos do restaurante');
console.log('   2. Exibição visual dos banners acima do cardápio');
console.log('   3. Link clicável caso o banner tenha URL configurada');
