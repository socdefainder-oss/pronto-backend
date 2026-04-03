import { prisma } from "./prisma.js";

/**
 * Verifica se um usuário tem acesso a um restaurante —
 * seja como dono (ownerId) ou como membro convidado (RestaurantUser).
 */
export async function hasRestaurantAccess(restaurantId: string, userId: string): Promise<boolean> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { ownerId: true },
  });
  if (!restaurant) return false;
  if (restaurant.ownerId === userId) return true;

  const member = await prisma.restaurantUser.findUnique({
    where: { restaurantId_userId: { restaurantId, userId } },
  });
  return !!member;
}
