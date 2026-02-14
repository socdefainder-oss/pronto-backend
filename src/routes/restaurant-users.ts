import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

const router = Router();

// Schemas de validação
const createUserSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  whatsapp: z.string().optional(),
  cpf: z.string().optional(),
  role: z.enum(['operador', 'gerente', 'dono'], {
    errorMap: () => ({ message: 'Role deve ser operador, gerente ou dono' }),
  }),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
});

const updateUserRoleSchema = z.object({
  role: z.enum(['operador', 'gerente', 'dono']),
});

// Middleware para verificar se usuário tem permissão no restaurante
async function checkRestaurantAccess(
  req: Request,
  res: Response,
  requiredRoles: string[] = ['dono', 'gerente']
) {
  const { restaurantId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Não autenticado' });
  }

  // Verifica se é o dono do restaurante
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { ownerId: true },
  });

  if (restaurant?.ownerId === userId) {
    return null; // Dono tem acesso total
  }

  // Verifica se tem acesso como usuário do restaurante
  const access = await prisma.restaurantUser.findUnique({
    where: {
      restaurantId_userId: {
        restaurantId,
        userId,
      },
    },
  });

  if (!access || !requiredRoles.includes(access.role)) {
    return res.status(403).json({ 
      message: 'Você não tem permissão para gerenciar usuários deste restaurante' 
    });
  }

  return null;
}

// Listar todos os usuários do restaurante
router.get('/:restaurantId/users', async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    
    const accessError = await checkRestaurantAccess(req, res, ['dono', 'gerente']);
    if (accessError) return;

    // Busca o dono do restaurante
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cpf: true,
          },
        },
      },
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurante não encontrado' });
    }

    // Busca os usuários com acesso ao restaurante
    const restaurantUsers = await prisma.restaurantUser.findMany({
      where: { restaurantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cpf: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Monta a lista completa de usuários
    const allUsers = [
      {
        id: restaurant.owner.id,
        name: restaurant.owner.name,
        email: restaurant.owner.email,
        phone: restaurant.owner.phone,
        cpf: restaurant.owner.cpf,
        role: 'dono' as const,
        isOwner: true,
        createdAt: restaurant.createdAt,
      },
      ...restaurantUsers.map((ru) => ({
        id: ru.user.id,
        name: ru.user.name,
        email: ru.user.email,
        phone: ru.user.phone,
        cpf: ru.user.cpf,
        role: ru.role,
        isOwner: false,
        createdAt: ru.createdAt,
      })),
    ];

    return res.json(allUsers);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return res.status(500).json({ message: 'Erro ao listar usuários' });
  }
});

// Criar novo usuário para o restaurante
router.post('/:restaurantId/users', async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    
    const accessError = await checkRestaurantAccess(req, res, ['dono', 'gerente']);
    if (accessError) return;

    const validatedData = createUserSchema.parse(req.body);

    // Verifica se o restaurante existe
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurante não encontrado' });
    }

    // Verifica se o usuário já existe
    let user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    // Se o usuário não existe, cria um novo
    if (!user) {
      const senhaHash = validatedData.senha 
        ? await bcrypt.hash(validatedData.senha, 10)
        : await bcrypt.hash(Math.random().toString(36).slice(-8), 10); // Senha temporária

      user = await prisma.user.create({
        data: {
          name: validatedData.nome,
          email: validatedData.email,
          phone: validatedData.whatsapp || null,
          cpf: validatedData.cpf || null,
          password: senhaHash,
          role: 'user',
          isActive: true,
        },
      });
    }

    // Verifica se o usuário já tem acesso ao restaurante
    const existingAccess = await prisma.restaurantUser.findUnique({
      where: {
        restaurantId_userId: {
          restaurantId,
          userId: user.id,
        },
      },
    });

    if (existingAccess) {
      return res.status(400).json({ 
        message: 'Este usuário já tem acesso a este restaurante' 
      });
    }

    // Cria o acesso do usuário ao restaurante
    const restaurantUser = await prisma.restaurantUser.create({
      data: {
        restaurantId,
        userId: user.id,
        role: validatedData.role,
        permissions: getDefaultPermissions(validatedData.role),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cpf: true,
          },
        },
      },
    });

    return res.status(201).json({
      id: restaurantUser.user.id,
      name: restaurantUser.user.name,
      email: restaurantUser.user.email,
      phone: restaurantUser.user.phone,
      cpf: restaurantUser.user.cpf,
      role: restaurantUser.role,
      isOwner: false,
      createdAt: restaurantUser.createdAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: error.errors 
      });
    }
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ message: 'Erro ao criar usuário' });
  }
});

// Atualizar role de um usuário
router.patch('/:restaurantId/users/:userId', async (req: Request, res: Response) => {
  try {
    const { restaurantId, userId } = req.params;
    
    const accessError = await checkRestaurantAccess(req, res, ['dono']);
    if (accessError) return;

    const validatedData = updateUserRoleSchema.parse(req.body);

    // Verifica se o acesso existe
    const restaurantUser = await prisma.restaurantUser.findUnique({
      where: {
        restaurantId_userId: {
          restaurantId,
          userId,
        },
      },
    });

    if (!restaurantUser) {
      return res.status(404).json({ 
        message: 'Usuário não encontrado neste restaurante' 
      });
    }

    // Atualiza o role
    const updated = await prisma.restaurantUser.update({
      where: {
        restaurantId_userId: {
          restaurantId,
          userId,
        },
      },
      data: {
        role: validatedData.role,
        permissions: getDefaultPermissions(validatedData.role),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cpf: true,
          },
        },
      },
    });

    return res.json({
      id: updated.user.id,
      name: updated.user.name,
      email: updated.user.email,
      phone: updated.user.phone,
      cpf: updated.user.cpf,
      role: updated.role,
      isOwner: false,
      createdAt: updated.createdAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: error.errors 
      });
    }
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
});

// Remover usuário do restaurante
router.delete('/:restaurantId/users/:userId', async (req: Request, res: Response) => {
  try {
    const { restaurantId, userId } = req.params;
    
    const accessError = await checkRestaurantAccess(req, res, ['dono']);
    if (accessError) return;

    // Verifica se o acesso existe
    const restaurantUser = await prisma.restaurantUser.findUnique({
      where: {
        restaurantId_userId: {
          restaurantId,
          userId,
        },
      },
    });

    if (!restaurantUser) {
      return res.status(404).json({ 
        message: 'Usuário não encontrado neste restaurante' 
      });
    }

    // Remove o acesso
    await prisma.restaurantUser.delete({
      where: {
        restaurantId_userId: {
          restaurantId,
          userId,
        },
      },
    });

    return res.json({ message: 'Usuário removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    return res.status(500).json({ message: 'Erro ao remover usuário' });
  }
});

// Função auxiliar para definir permissões padrão
function getDefaultPermissions(role: string): string[] {
  switch (role) {
    case 'dono':
      return ['all']; // Acesso total
    case 'gerente':
      return [
        'view_orders',
        'manage_orders',
        'view_products',
        'manage_products',
        'view_categories',
        'manage_categories',
        'view_coupons',
        'manage_coupons',
        'view_financial',
        'view_reports',
      ];
    case 'operador':
      return [
        'view_orders',
        'manage_orders',
        'view_products',
        'manage_products',
        'view_categories',
        'manage_categories',
      ];
    default:
      return [];
  }
}

export default router;
