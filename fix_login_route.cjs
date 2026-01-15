const fs = require('fs');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\login\\page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Corrigir a rota de redirecionamento após o login
content = content.replace(
  'router.push("/app/restaurants");',
  'router.push("/app");'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Rota de login corrigida de /app/restaurants para /app');
