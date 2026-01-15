const fs = require('fs');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\products\\page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Adicionar timestamp visível no botão
const timestamp = new Date().toISOString().slice(11, 19);
content = content.replace(
  '⬅️ Voltar',
  `⬅️ Voltar [${timestamp}]`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log(`✅ Timestamp ${timestamp} adicionado ao botão!`);
console.log('');
console.log('👀 Agora você verá o horário no botão para confirmar qual versão está rodando');
