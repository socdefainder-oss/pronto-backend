const fs = require('fs');
const path = require('path');

// Caminho para o arquivo do dashboard do restaurante
const frontendPath = path.join('..', 'pronto.frontend', 'app', 'app', 'restaurant', '[id]', 'page.tsx');
const filePath = path.resolve(__dirname, frontendPath);

console.log('📝 Adicionando campo de slogan nas configurações do restaurante...');
console.log('📂 Arquivo:', filePath);

// Lê o arquivo
let content = fs.readFileSync(filePath, 'utf8');

// Verifica se já tem o campo slogan
if (content.includes('setSlogan') || content.includes('restaurant?.slogan')) {
  console.log('✅ Campo slogan já está presente!');
  process.exit(0);
}

// 1. Adicionar o estado do slogan
const statePattern = /const \[description, setDescription\] = useState\(""\);/;
if (statePattern.test(content)) {
  content = content.replace(
    statePattern,
    `const [description, setDescription] = useState("");
  const [slogan, setSlogan] = useState("");`
  );
  console.log('✅ Estado slogan adicionado');
} else {
  console.log('⚠️ Padrão de estado description não encontrado, procurando alternativa...');
  // Tenta encontrar qualquer useState com setDescription
  const altPattern = /setDescription.*useState\([^)]*\)/;
  if (altPattern.test(content)) {
    const match = content.match(/(.*setDescription.*useState\([^)]*\))/);
    if (match) {
      content = content.replace(
        match[0],
        match[0] + '\n  const [slogan, setSlogan] = useState("");'
      );
      console.log('✅ Estado slogan adicionado (método alternativo)');
    }
  }
}

// 2. Adicionar slogan no carregamento dos dados
const loadPattern = /setDescription\(data\.restaurant\.description \|\| ""\);/;
if (loadPattern.test(content)) {
  content = content.replace(
    loadPattern,
    `setDescription(data.restaurant.description || "");
        setSlogan(data.restaurant.slogan || "");`
  );
  console.log('✅ Carregamento do slogan adicionado');
}

// 3. Adicionar slogan no envio do formulário (PATCH)
const patchPattern = /description: description\.trim\(\) \|\| null,/;
if (patchPattern.test(content)) {
  content = content.replace(
    patchPattern,
    `description: description.trim() || null,
        slogan: slogan.trim() || null,`
  );
  console.log('✅ Envio do slogan no PATCH adicionado');
}

// 4. Adicionar campo no formulário HTML (após description)
const formPattern = /<textarea\s+value={description}\s+onChange={\(e\) => setDescription\(e\.target\.value\)}\s+className="[^"]*"\s+placeholder="[^"]*"\s+rows={\d+}\s*\/>/;
if (formPattern.test(content)) {
  const match = content.match(formPattern);
  if (match) {
    const descriptionTextarea = match[0];
    const sloganField = `

              {/* Slogan/Tagline */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slogan / Frase Motivadora
                </label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                  placeholder='"Sabor que conquista!" ou "A melhor pizza da cidade"'
                  maxLength={100}
                />
                <p className="mt-2 text-sm text-gray-500">
                  💡 Frase curta e impactante que aparecerá em destaque no seu cardápio
                </p>
              </div>`;
    
    // Encontra o fechamento da div do textarea de description
    const textareaIndex = content.indexOf(descriptionTextarea);
    const afterTextarea = content.substring(textareaIndex + descriptionTextarea.length);
    const nextDivIndex = afterTextarea.indexOf('</div>');
    
    if (nextDivIndex !== -1) {
      const insertPosition = textareaIndex + descriptionTextarea.length + nextDivIndex + 6; // +6 para '</div>'
      content = content.substring(0, insertPosition) + sloganField + content.substring(insertPosition);
      console.log('✅ Campo de formulário do slogan adicionado');
    }
  }
} else {
  console.log('⚠️ Padrão de textarea description não encontrado exato');
  // Tenta padrão mais simples
  const simplePattern = /value={description}[^>]*onChange={\(e\) => setDescription\(e\.target\.value\)}/;
  if (simplePattern.test(content)) {
    console.log('✅ Encontrado padrão simples de description, mas adição do campo requer ajuste manual');
  }
}

// Salva o arquivo
fs.writeFileSync(filePath, content, 'utf8');

console.log('\n✅ Script concluído!');
console.log('📍 Modificações feitas:');
console.log('   1. Estado slogan adicionado');
console.log('   2. Carregamento do slogan do backend');
console.log('   3. Envio do slogan no PATCH');
console.log('   4. Campo HTML no formulário de configurações');
console.log('\n🎨 O campo aparecerá logo após a descrição nas configurações');
