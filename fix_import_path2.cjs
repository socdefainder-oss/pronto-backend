const fs = require('fs');
const path = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\products\\page.tsx';

let content = fs.readFileSync(path, 'utf8');

// Corrigir para o caminho correto
content = content.replace(
  'import { getToken } from "../../../lib/api";',
  'import { getToken } from "../../../../lib/api";'
);

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Caminho do import corrigido para ../../../../lib/api');
