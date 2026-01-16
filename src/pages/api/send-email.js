import { Resend } from 'resend';

export const POST = async ({ request }) => {
  try {
    const data = await request.json(); 
    const { name, email, message } = data;

    const API_KEY = import.meta.env.RESEND_API_KEY;
    const EMAIL = import.meta.env.EMAIL;
    const resend = new Resend(API_KEY);

    // Email 1: Te llega a ti (dueño del sitio)
    const { error: errorToOwner } = await resend.emails.send({
      from: 'Contacto <contacto@resend.dev>',
      to: [EMAIL],
      subject: `Nuevo mensaje de ${name}`,
      html: `
        <h1>Nuevo mensaje de contacto</h1>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `
    });

    if (errorToOwner) {
      return new Response(
        JSON.stringify({ error: errorToOwner.message }),
        { status: 400 }
      );
    }

    // Email 2: Confirmación automática al usuario
    const { error: errorToUser } = await resend.emails.send({
      from: 'Contacto <onboarding@resend.dev>',
      to: [email],
      subject: 'Recibimos tu mensaje',
      html: `
        <h1>¡Hola ${name}!</h1>
        <p>Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos a la brevedad.</p>
        <br>
        <p>Saludos,<br>El equipo</p>
      `
    });

    if (errorToUser) {
      return new Response(
        JSON.stringify({ error: errorToUser.message }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Emails enviados correctamente' }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Error al procesar la solicitud' }),
      { status: 500 }
    );
  }
};