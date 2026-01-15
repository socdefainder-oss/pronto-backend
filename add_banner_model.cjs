const fs = require('fs');

const schemaPath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto-backend\\prisma\\schema.prisma';
let content = fs.readFileSync(schemaPath, 'utf8');

// Adicionar banners na relação do Restaurant
const restaurantOld = `  owner       User      @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  categories  Category[]
  products    Product[]
  orders      Order[]
  coupons     Coupon[]

  @@map("restaurants")`;

const restaurantNew = `  owner       User      @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  categories  Category[]
  products    Product[]
  orders      Order[]
  coupons     Coupon[]
  banners     Banner[]

  @@map("restaurants")`;

content = content.replace(restaurantOld, restaurantNew);

// Adicionar model Banner no final do arquivo
const bannerModel = `
model Banner {
  id              String    @id @default(cuid())
  restaurantId    String
  title           String
  description     String?
  imageUrl        String?   // URL da imagem do banner
  linkUrl         String?   // Link de destino ao clicar
  backgroundColor String    @default("#10b981") // Cor de fundo padrão (emerald-600)
  textColor       String    @default("#ffffff") // Cor do texto padrão (branco)
  position        String    @default("top") // top, middle, bottom
  sortOrder       Int       @default(0)
  startDate       DateTime? // Data de início (null = já ativo)
  endDate         DateTime? // Data de fim (null = sem expiração)
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  restaurant      Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  @@map("banners")
  @@index([restaurantId])
  @@index([isActive])
  @@index([position])
  @@index([sortOrder])
}
`;

content = content + bannerModel;

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('✅ Model Banner adicionado ao schema!');
