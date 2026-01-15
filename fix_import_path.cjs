const fs = require('fs');
const path = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\products\\page.tsx';

let content = fs.readFileSync(path, 'utf8');

// Corrigir o caminho do import
content = content.replace(
  'import { getToken } from "../../lib/api";',
  'import { getToken } from "../../../lib/api";'
);

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Caminho do import corrigido de ../../lib/api para ../../../lib/api');
