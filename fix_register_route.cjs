const fs = require('fs');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\register\\page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Corrigir a rota de redirecionamento após o registro
content = content.replace(
  'router.push("/app/restaurants");',
  'router.push("/app");'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Rota de registro corrigida de /app/restaurants para /app');
