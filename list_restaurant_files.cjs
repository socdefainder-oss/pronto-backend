const fs = require('fs');
const path = require('path');

const frontendPath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend';
const restaurantPath = path.join(frontendPath, 'app', 'app', 'restaurant');

console.log('🔍 Procurando arquivos no diretório restaurant...\n');

function listFiles(dir, indent = '') {
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    items.forEach(item => {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        console.log(`${indent}📁 ${item.name}/`);
        listFiles(fullPath, indent + '  ');
      } else {
        console.log(`${indent}📄 ${item.name}`);
      }
    });
  } catch (e) {
    console.log(`${indent}❌ Erro: ${e.message}`);
  }
}

listFiles(restaurantPath);
