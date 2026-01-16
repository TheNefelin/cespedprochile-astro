import { Resend } from 'resend';

export const POST = async ({ request }) => {
  try {
    const data = await request.json(); 
    const { name, email, message } = data;

    // 1️⃣ Validación básica
    if (!name) {
      return new Response(
        JSON.stringify({ error: 'El nombre es obligatorio', field: 'name' }),
        { status: 400 }
      );
    }

    // 1️⃣ Validación básica
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'El email es obligatorio', field: 'email' }),
        { status: 400 }
      );
    }

    // 2️⃣ Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'El email ingresado no es válido.' }),
        { status: 400 }
      );
    }

    // 3️⃣ Validación opcional: tamaño máximo de mensaje
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'El mensaje es obligatorio', field: 'message' }),
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'El mensaje es demasiado largo.' }),
        { status: 400 }
      );
    }

    // 4️⃣ Preparar Resend
    const API_KEY = import.meta.env.RESEND_API_KEY;
    const EMAIL = import.meta.env.EMAIL;
    const resend = new Resend(API_KEY);        

    // 5️⃣ Enviar email al dueño del sitio
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
      `,
    });

    if (errorToOwner) {
      return new Response(
        JSON.stringify({ error: errorToOwner.message }),
        { status: 400 }
      );
    }

    // 6️⃣ Enviar confirmación automática al usuario
    const { error: errorToUser } = await resend.emails.send({
      from: 'Contacto <onboarding@resend.dev>',
      to: [email],
      subject: 'Recibimos tu mensaje',
      html: `
        <h1>¡Hola ${name}!</h1>
        <p>Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos a la brevedad.</p>
        <p>Saludos,<br>El equipo</p>
      `,
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