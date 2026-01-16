const fs = require('fs');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\settings\\page.tsx';

console.log('Reading settings page...');
let content = fs.readFileSync(filePath, 'utf8');

// Add console.log just before the fetch
const searchBefore = `    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(\`\${API_URL}/api/restaurants/\${restaurantId}\`, {`;

const replaceBefore = `    setSaving(true);
    setError("");
    setSuccess("");

    try {
      console.log('[Settings] Saving restaurant:', {
        restaurantId,
        logoUrl,
        logoUrlTrimmed: logoUrl.trim(),
        hasLogoUrl: !!logoUrl.trim(),
        logoUrlLength: logoUrl.trim().length
      });
      
      const res = await fetch(\`\${API_URL}/api/restaurants/\${restaurantId}\`, {`;

content = content.replace(searchBefore, replaceBefore);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Console.log added before fetch!');
