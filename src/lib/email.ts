import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInviteEmail(
  email: string,
  restaurantNames: string[],
  role: string,
  token: string
) {
  const roleTranslation = {
    dono: 'Dono',
    gerente: 'Gerente',
    operador: 'Operador',
  }[role] || role;

  const restaurantList = restaurantNames.map(name => `• ${name}`).join('\n');
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const inviteUrl = `${frontendUrl}/auth/accept-invite/${token}`;

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Pronto <onboarding@resend.dev>',
      to: [email],
      subject: '🎉 Você foi convidado para gerenciar restaurantes!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Convite - Pronto</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f7fafc;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7fafc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                        🎉 Você foi Convidado!
                      </h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                        Olá! 👋
                      </p>
                      
                      <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                        Você foi convidado para gerenciar restaurantes no <strong>Pronto</strong>!
                      </p>

                      <!-- Role Badge -->
                      <div style="background-color: #edf2f7; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                        <p style="color: #4a5568; font-size: 14px; margin: 0 0 8px 0;">
                          <strong>Nível de acesso:</strong>
                        </p>
                        <span style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 14px;">
                          ${roleTranslation}
                        </span>
                      </div>

                      <!-- Restaurants List -->
                      <div style="background-color: #f7fafc; border-left: 4px solid #667eea; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                        <p style="color: #4a5568; font-size: 14px; margin: 0 0 12px 0;">
                          <strong>Restaurantes:</strong>
                        </p>
                        <div style="color: #2d3748; font-size: 15px; line-height: 1.8; white-space: pre-line;">
${restaurantList}
                        </div>
                      </div>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                              ✨ Aceitar Convite e Criar Conta
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Alternative Link -->
                      <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
                        Ou copie e cole este link no seu navegador:<br>
                        <a href="${inviteUrl}" style="color: #667eea; word-break: break-all;">${inviteUrl}</a>
                      </p>

                      <!-- Expiration Warning -->
                      <div style="background-color: #fff5f5; border: 1px solid #fc8181; border-radius: 8px; padding: 16px; margin-top: 24px;">
                        <p style="color: #c53030; font-size: 13px; margin: 0; text-align: center;">
                          ⏰ Este convite expira em <strong>7 dias</strong>
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="color: #718096; font-size: 13px; margin: 0;">
                        © ${new Date().getFullYear()} Pronto. Todos os direitos reservados.
                      </p>
                      <p style="color: #a0aec0; font-size: 12px; margin: 8px 0 0 0;">
                        Se você não estava esperando este email, pode ignorá-lo.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log('Email de convite enviado:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao enviar email de convite:', error);
    return { success: false, error };
  }
}
