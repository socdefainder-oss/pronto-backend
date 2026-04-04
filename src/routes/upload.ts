import { Router } from 'express';
import { auth, type AuthedRequest } from '../middlewares/auth.js';
import { uploadImage } from '../lib/supabase.js';

export const uploadRoutes = Router();

// Upload de mídia (imagem ou vídeo em base64)
uploadRoutes.post('/image', auth, async (req: AuthedRequest, res) => {
  try {
    const { image, fileName } = req.body;

    if (!image || !fileName) {
      return res.status(400).json({
        error: 'Campos obrigatórios: image (base64), fileName'
      });
    }

    const matches = image.match(/^data:([^;]+);base64,/);
    const mimeType = matches ? matches[1] : 'application/octet-stream';
    const isImage = mimeType.startsWith('image/');
    const isVideo = mimeType.startsWith('video/');

    if (!isImage && !isVideo) {
      return res.status(400).json({
        error: 'Arquivo inválido. Envie uma imagem ou vídeo MP4/WebM/Ogg.'
      });
    }

    const base64Data = image.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const maxSize = isVideo ? 80 * 1024 * 1024 : 5 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return res.status(400).json({
        error: isVideo
          ? 'Vídeo muito grande. Máximo: 80MB'
          : 'Imagem muito grande. Máximo: 5MB'
      });
    }

    const result = await uploadImage(buffer, fileName, 'products', mimeType);

    return res.json({
      success: true,
      url: result.url,
      path: result.path,
    });
  } catch (error: any) {
    console.error('Erro no upload:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao fazer upload da mídia'
    });
  }
});

// Upload direto de arquivo (multipart/form-data)
// Nota: requer middleware multer ou similar - implementar se necessário
