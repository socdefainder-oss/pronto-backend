const fs = require('fs');
const path = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\products\\page.tsx';

let content = fs.readFileSync(path, 'utf8');

// Adicionar import após o useRouter
content = content.replace(
  'import { useParams, useRouter } from "next/navigation";',
  'import { useParams, useRouter } from "next/navigation";\nimport { getToken } from "../../lib/api";'
);

// Remover a função customizada getToken
content = content.replace(
  `// Token function
  function getToken() {
    if (typeof window === "undefined") return "";
    return (
      localStorage.getItem("pronto_token") ||
      localStorage.getItem("token") ||
      ""
    );
  }

  `,
  ''
);

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Arquivo corrigido!');
