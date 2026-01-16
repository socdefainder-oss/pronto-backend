const fs = require('fs');
const path = require('path');

// Caminho para o arquivo do menu público
const frontendPath = path.join('..', 'pronto.frontend', 'app', 'r', '[slug]', 'page.tsx');
const filePath = path.resolve(__dirname, frontendPath);

console.log('📝 Adicionando display do slogan no cardápio público...');
console.log('📂 Arquivo:', filePath);

// Lê o arquivo
let content = fs.readFileSync(filePath, 'utf8');

// Verifica se já tem o slogan
if (content.includes('restaurant?.slogan')) {
  console.log('✅ Slogan já está presente!');
  process.exit(0);
}

// Encontra e substitui a seção do nome do restaurante
const oldCode = `              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold text-gray-900">{restaurant?.name}</h1>
              </div>

              {restaurant?.description && (
                <p className="text-gray-600 text-lg mb-4">{restaurant.description}</p>
              )}`;

const newCode = `              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold text-gray-900">{restaurant?.name}</h1>
              </div>

              {/* Slogan motivador do restaurante */}
              {restaurant?.slogan && (
                <div className="mb-4 -mt-2">
                  <p className="text-2xl font-semibold text-emerald-600 italic">
                    "{restaurant.slogan}"
                  </p>
                </div>
              )}

              {restaurant?.description && (
                <p className="text-gray-600 text-lg mb-4">{restaurant.description}</p>
              )}`;

content = content.replace(oldCode, newCode);

// Salva o arquivo
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Slogan adicionado com sucesso!');
console.log('📍 Localização: Logo após o nome do restaurante, em estilo destacado');
console.log('🎨 Estilo: Texto grande (2xl), verde emerald, itálico, entre aspas');
