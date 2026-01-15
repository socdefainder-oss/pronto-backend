const fs = require('fs');

const serverPath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto-backend\\src\\server.ts';
let content = fs.readFileSync(serverPath, 'utf8');

// Adicionar import
const importOld = `import couponsRoutes from "./routes/coupons.js";

const app = express();`;

const importNew = `import couponsRoutes from "./routes/coupons.js";
import bannersRoutes from "./routes/banners.js";

const app = express();`;

content = content.replace(importOld, importNew);

// Adicionar rota
const routesOld = `app.use("/api/coupons", couponsRoutes);

const port = Number(process.env.PORT || 3333);`;

const routesNew = `app.use("/api/coupons", couponsRoutes);
app.use("/api/banners", bannersRoutes);

const port = Number(process.env.PORT || 3333);`;

content = content.replace(routesOld, routesNew);

fs.writeFileSync(serverPath, content, 'utf8');
console.log('✅ Rota de banners adicionada ao server.ts!');
