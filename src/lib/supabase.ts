import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase Auth não configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY');
}

if (!supabaseServiceKey) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY não configurada. Uploads de imagens não funcionarão.');
}

// Cliente público (autenticação)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Cliente admin com service role (para Storage — bypassa RLS)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })
  : null;

// Função para fazer upload de imagem
export async function uploadImage(
  file: Buffer,
  fileName: string,
  bucket: string = 'products',
  mimeType: string = 'image/jpeg'
): Promise<{ url: string; path: string }> {
  const client = supabaseAdmin || supabase;
  if (!client) {
    throw new Error('Supabase não configurado');
  }

  try {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${timestamp}_${sanitizedFileName}`;

    const { data, error } = await client.storage
      .from(bucket)
      .upload(path, file, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Erro ao fazer upload:', error);
      throw new Error(`Falha no upload: ${error.message}`);
    }

    // Obter URL pública
    const { data: urlData } = client.storage
      .from(bucket)
      .getPublicUrl(path);

    return {
      url: urlData.publicUrl,
      path: path,
    };
  } catch (error: any) {
    console.error('Erro no uploadImage:', error);
    throw error;
  }
}

// Função para deletar imagem
export async function deleteImage(
  path: string,
  bucket: string = 'products'
): Promise<void> {
  const client = supabaseAdmin || supabase;
  if (!client) {
    throw new Error('Supabase não configurado');
  }

  try {
    const { error } = await client.storage.from(bucket).remove([path]);

    if (error) {
      console.error('Erro ao deletar imagem:', error);
      throw new Error(`Falha ao deletar: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Erro no deleteImage:', error);
    throw error;
  }
}
