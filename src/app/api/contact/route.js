import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { objetivo, descricao, cor, nome, contato } = body;

    if (!nome || !contato) {
      return new Response(JSON.stringify({ error: 'Nome e contato são obrigatórios.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Configuração do transporter do nodemailer
    // Utiliza as variáveis de ambiente que devem ser criadas no .env.local
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com', // Padrão Gmail
      port: process.env.EMAIL_PORT || 465, // SSL
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #0056b3; border-bottom: 2px solid #eaeaea; padding-bottom: 10px;">Novo Pedido de Orçamento</h2>
        <p>Você recebeu um novo contato através do seu portfólio.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eaeaea; font-weight: bold; width: 30%;">Nome/Apelido:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${nome}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eaeaea; font-weight: bold;">WhatsApp:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${contato}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eaeaea; font-weight: bold;">Objetivo do Projeto:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${objetivo || 'Não informado'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eaeaea; font-weight: bold;">Cor Preferida:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">
              ${cor ? `<div style="display: inline-block; width: 20px; height: 20px; background-color: ${cor}; border: 1px solid #ccc; border-radius: 4px; vertical-align: middle; margin-right: 8px;"></div>${cor}` : 'Não informado'}
            </td>
          </tr>
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #0056b3;">
          <h3 style="margin-top: 0; color: #555;">Descrição/Desafio:</h3>
          <p style="white-space: pre-wrap; margin-bottom: 0;">${descricao || 'Nenhuma descrição fornecida.'}</p>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="https://wa.me/55${contato.replace(/\D/g, '')}" style="background-color: #25D366; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Responder no WhatsApp</a>
        </div>
      </div>
    `;

    // Opções do e-mail
    const mailOptions = {
      from: `"Portfólio de Contatos" <${process.env.EMAIL_USER}>`, // Remetente
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER, // O destinatário é você mesmo
      subject: `[Orçamento] Novo contato de ${nome}`,
      html: htmlContent,
    };

    // Enviar e-mail
    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true, message: 'E-mail enviado com sucesso.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return new Response(JSON.stringify({ error: 'Erro interno ao tentar enviar o e-mail.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
