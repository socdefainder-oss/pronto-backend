const fs = require('fs');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\settings\\page.tsx';

console.log('Reading settings page...');
let content = fs.readFileSync(filePath, 'utf8');

// Add console.log before fetch
const searchPattern = `      const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/restaurants/\${id}\`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: \`Bearer \${token}\` },
        body: JSON.stringify({`;

const replacement = `      const payload = {
        name,
        slug,
        phone,
        description: description.trim() || null,
        slogan: slogan.trim() || null,
        address: address.trim() || null,
        logoUrl: logoUrl.trim() || null,
        cnpj: cnpj.trim() || null,
        email: email.trim() || null,
        openingHours: openingHours.trim() || null,
        deliveryFee: deliveryFee ? Math.round(parseFloat(deliveryFee) * 100) : null,
        minimumOrder: minimumOrder ? Math.round(parseFloat(minimumOrder) * 100) : null,
        estimatedDeliveryTime: estimatedDeliveryTime.trim() || null,
        acceptsCard,
        acceptsPix,
        acceptsCash,
      };
      
      console.log('[Settings] Saving restaurant with payload:', {
        id,
        name,
        logoUrl: payload.logoUrl,
        hasLogoUrl: !!payload.logoUrl,
        logoUrlLength: payload.logoUrl?.length
      });

      const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/restaurants/\${id}\`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: \`Bearer \${token}\` },
        body: JSON.stringify(payload`;

content = content.replace(searchPattern, replacement);

// Fix the closing of stringify that was split
content = content.replace(
  'body: JSON.stringify(payload,\n          acceptsCash,\n        }),',
  'body: JSON.stringify(payload),'
);

// Add console.log after successful save
content = content.replace(
  'setSuccess("Configurações salvas com sucesso!");',
  `const savedData = await res.json();
      console.log('[Settings] Restaurant saved successfully:', {
        id: savedData.id,
        name: savedData.name,
        logoUrl: savedData.logoUrl,
        hasLogoUrl: !!savedData.logoUrl
      });
      setSuccess("Configurações salvas com sucesso!");`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Debug logs added to settings page!');
