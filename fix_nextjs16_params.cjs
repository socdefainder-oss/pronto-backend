const fs = require('fs');

const filePath = String.raw`C:\Users\Capitani\Documents\pronto\pronto.frontend\app\r\[slug]\page.tsx.backup`;
const outputPath = String.raw`C:\Users\Capitani\Documents\pronto\pronto.frontend\app\r\[slug]\page.tsx`;

let content = fs.readFileSync(filePath, 'utf8');

// Remove imports duplicados e linhas com `n
content = content.split('\n').filter(line => !line.includes('`n')).join('\n');

// Corrige o import
content = content.replace(
  /import \{ useEffect, useState \} from "react";/,
  'import { use, useEffect, useState } from "react";'
);

// Corrige a assinatura da função
content = content.replace(
  /export default function PublicRestaurantPage\(\{ params \}: \{ params: \{ slug: string \} \}\)/,
  'export default function PublicRestaurantPage({ params }: { params: Promise<{ slug: string }> })'
);

// Adiciona const { slug } = use(params); logo após a declaração da função
content = content.replace(
  /(export default function PublicRestaurantPage\(\{ params \}: \{ params: Promise<\{ slug: string \}> \}\) \{)\s*(\n\s*const \[restaurant)/,
  '$1\n  const { slug } = use(params);$2'
);

// Substitui todas as ocorrências de params.slug por slug
content = content.replace(/params\.slug/g, 'slug');

fs.writeFileSync(outputPath, content, 'utf8');
console.log(' Arquivo corrigido para Next.js 16!');
