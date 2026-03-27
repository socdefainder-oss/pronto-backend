import { Router } from 'express';
import { auth, type AuthedRequest } from '../middlewares/auth.js';
import { uploadImage } from '../lib/supabase.js';

export const uploadRoutes = Router();

// Upload de imagem (aceita base64)
uploadRoutes.post('/image', auth, async (req: AuthedRequest, res) => {
  try {
    const { image, fileName } = req.body;

    if (!image || !fileName) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: image (base64), fileName' 
      });
    }

    // Remove o prefixo data:image/png;base64, se existir
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Valida tamanho (máx 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        error: 'Imagem muito grande. Máximo: 5MB' 
      });
    }

    // Faz upload para Supabase Storage
    const result = await uploadImage(buffer, fileName, 'products');

    return res.json({
      success: true,
      url: result.url,
      path: result.path,
    });
  } catch (error: any) {
    console.error('Erro no upload:', error);
    return res.status(500).json({ 
      error: error.message || 'Erro ao fazer upload da imagem' 
    });
  }
});

// Upload direto de arquivo (multipart/form-data)
// Nota: requer middleware multer ou similar - implementar se necessário
