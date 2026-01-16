const fs = require('fs');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\settings\\page.tsx';

console.log('Reading settings page...');
let content = fs.readFileSync(filePath, 'utf8');

// Fix error handling to properly format Zod validation errors
const searchPattern = `      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar");
      }`;

const replacement = `      if (!res.ok) {
        const data = await res.json();
        console.error('[Settings] Save failed:', data);
        
        // Handle Zod validation errors (object) vs simple error messages (string)
        let errorMessage = "Erro ao salvar";
        if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (data.error?.fieldErrors) {
          // Zod flatten format
          const fields = Object.keys(data.error.fieldErrors);
          const firstField = fields[0];
          const firstError = data.error.fieldErrors[firstField]?.[0];
          errorMessage = firstError || \`Erro no campo: \${firstField}\`;
        } else if (typeof data.error === 'object') {
          errorMessage = JSON.stringify(data.error);
        }
        
        throw new Error(errorMessage);
      }`;

content = content.replace(searchPattern, replacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Error handling fixed!');
