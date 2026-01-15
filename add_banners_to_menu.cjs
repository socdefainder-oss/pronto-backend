const fs = require('fs');
const path = require('path');

// Public menu path
const menuPath = path.join(__dirname, '..', 'pronto.frontend', 'app', 'r', '[slug]', 'page.tsx');

console.log('🔍 Procurando arquivo do cardápio público...');
console.log('Caminho:', menuPath);

if (!fs.existsSync(menuPath)) {
  console.log('❌ Arquivo do cardápio não encontrado no caminho esperado');
  console.log('📝 Instruções para adicionar manualmente:');
  console.log(`
1. Adicione o estado para banners após os outros estados:
   const [banners, setBanners] = useState<any[]>([]);

2. Adicione a função para carregar banners:
   async function loadBanners() {
     try {
       const response = await fetch(\`\${API_URL}/api/banners/public/\${restaurant.id}/active\`);
       if (response.ok) {
         const data = await response.json();
         setBanners(data);
       }
     } catch (error) {
       console.error("Erro ao carregar banners:", error);
     }
   }

3. Chame loadBanners() no useEffect junto com loadData()

4. Adicione o componente de exibição dos banners antes da seção de categorias:
   {banners.length > 0 && (
     <div className="space-y-4 mb-8">
       {banners.map((banner) => (
         <div
           key={banner.id}
           className="rounded-2xl overflow-hidden shadow-xl cursor-pointer transform hover:scale-[1.02] transition"
           style={{ backgroundColor: banner.backgroundColor, color: banner.textColor }}
           onClick={() => banner.linkUrl && window.open(banner.linkUrl, '_blank')}
         >
           {banner.imageUrl ? (
             <img src={banner.imageUrl} alt={banner.title} className="w-full h-48 object-cover" />
           ) : (
             <div className="p-8 text-center">
               <h3 className="text-3xl font-bold mb-2">{banner.title}</h3>
               {banner.description && <p className="text-lg opacity-90">{banner.description}</p>}
             </div>
           )}
         </div>
       ))}
     </div>
   )}
  `);
  process.exit(0);
}

let content = fs.readFileSync(menuPath, 'utf8');

// Verifica se já existe a funcionalidade de banners
if (content.includes('loadBanners')) {
  console.log('✅ Banners já estão implementados no cardápio!');
  process.exit(0);
}

console.log('🔧 Adicionando funcionalidade de banners...');

// 1. Adiciona o estado de banners
if (!content.includes('useState<any[]>([])')) {
  const statePattern = /(const \[cart, setCart\] = useState<CartItem\[\]>\(\[\]\);)/;
  content = content.replace(statePattern, '$1\n  const [banners, setBanners] = useState<any[]>([]);');
}

// 2. Adiciona a função loadBanners
const loadBannersFunction = `
  async function loadBanners() {
    try {
      const response = await fetch(\`\${API_URL}/api/banners/public/\${restaurant.id}/active\`);
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      }
    } catch (error) {
      console.error("Erro ao carregar banners:", error);
    }
  }`;

const loadDataPattern = /(async function loadData\(\) \{[\s\S]*?\})/;
const match = content.match(loadDataPattern);
if (match) {
  content = content.replace(match[0], match[0] + loadBannersFunction);
}

// 3. Adiciona chamada loadBanners no useEffect
content = content.replace(
  /loadData\(\);(\s+)\}/,
  'loadData();\n    loadBanners();$1}'
);

// 4. Adiciona componente de exibição dos banners antes das categorias
const bannersComponent = `
        {banners.length > 0 && (
          <div className="space-y-4 mb-8">
            {banners.map((banner: any) => (
              <div
                key={banner.id}
                className="rounded-2xl overflow-hidden shadow-xl cursor-pointer transform hover:scale-[1.02] transition"
                style={{ backgroundColor: banner.backgroundColor, color: banner.textColor }}
                onClick={() => banner.linkUrl && window.open(banner.linkUrl, '_blank')}
              >
                {banner.imageUrl ? (
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="p-8 text-center">
                    <h3 className="text-3xl font-bold mb-2">{banner.title}</h3>
                    {banner.description && <p className="text-lg opacity-90">{banner.description}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
`;

// Procura a seção de categorias para adicionar os banners antes dela
const categoriesPattern = /(\/\* Categories \*\/|<div className="space-y-8">[\s\S]*?{categories\.map)/;
const categoriesMatch = content.match(categoriesPattern);
if (categoriesMatch) {
  content = content.replace(categoriesMatch[0], bannersComponent + '\n        ' + categoriesMatch[0]);
}

fs.writeFileSync(menuPath, content, 'utf8');
console.log('✅ Banners adicionados ao cardápio público com sucesso!');
console.log('📝 Os banners ativos serão exibidos no topo do cardápio');
