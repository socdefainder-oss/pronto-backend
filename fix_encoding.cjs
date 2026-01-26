const fs = require('fs');
const path = require('path');

const replacements = [
  ['Ã£o', 'ão'],
  ['Ã§Ã£o', 'ção'],
  ['Ã§Ãµes', 'ções'],
  ['Ã¡', 'á'],
  ['Ã©', 'é'],
  ['Ã­', 'í'],
  ['Ã³', 'ó'],
  ['Ãº', 'ú'],
  ['Ã§', 'ç'],
  ['Ã¢', 'â'],
  ['Ãª', 'ê'],
  ['Ã´', 'ô'],
  ['Ã', 'à'],
  ['Ãµ', 'õ'],
  ['grÃ¡tis', 'grátis'],
  ['NÃ£o', 'Não'],
  ['EstÃ¡', 'Está'],
  ['UsuÃ¡rio', 'Usuário'],
  ['criaÃ§Ã£o', 'criação'],
  ['configuraÃ§Ã£o', 'configuração'],
  ['configuraÃ§Ãµes', 'configurações'],
  ['ConfiguraÃ§Ãµes', 'Configurações'],
  ['CriaÃ§Ã£o', 'Criação'],
  ['GestÃ£o', 'Gestão'],
  ['descriÃ§Ã£o', 'descrição'],
  ['InformaÃ§Ãµes', 'Informações'],
  ['seleÃ§Ã£o', 'seleção'],
  ['atÃ©', 'até'],
  ['PrÃ©via', 'Prévia'],
  ['mÃ­nimo', 'mínimo'],
  ['mÃ­n', 'mín'],
  ['OlÃ¡', 'Olá'],
  ['pÃ¡gina', 'página'],
  ['histÃ³rico', 'histórico'],
  ['relatÃ³rio', 'relatório'],
  ['RelatÃ³rio', 'Relatório'],
  ['RelatÃ³rios', 'Relatórios'],
  ['CatÃ¡logo', 'Catálogo'],
  ['pedidos', 'pedidos'], // just in case
];

const files = [
  'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\layout.tsx',
  'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\page.tsx',
  'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\page.tsx',
  'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\new\\page.tsx',
  'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\page.tsx',
  'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\settings\\page.tsx',
  'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\login\\page.tsx',
  'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\register\\page.tsx',
  'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\r\\[slug]\\page.tsx',
];

let fixedCount = 0;

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  replacements.forEach(([wrong, correct]) => {
    if (content.includes(wrong)) {
      content = content.split(wrong).join(correct);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${path.basename(filePath)}`);
    fixedCount++;
  }
});

console.log(`\n✅ Total de arquivos corrigidos: ${fixedCount}`);
