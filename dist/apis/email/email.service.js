import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
// ─── Transporter Gmail ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});
// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});
const formatDateRange = (start, end) => {
    const sDay = new Date(start).toISOString().substring(0, 10);
    const eDay = new Date(end).toISOString().substring(0, 10);
    return sDay === eDay ? formatDate(start) : `${formatDate(start)} al ${formatDate(end)}`;
};
const getDestinoNombre = (d) => typeof d === 'object' ? d.nombre : 'Campus UTEQ';
const getEspacioNombre = (e) => {
    if (!e || typeof e === 'string')
        return null;
    return `${e.nombre}${e.planta ? ` · Planta ${e.planta}` : ''}`;
};
// ─── Correo de confirmación de registro ──────────────────────────────────────
export const sendConfirmationEmail = async (usuario, evento, token) => {
    const espacio = getEspacioNombre(evento.espacio);
    const destino = getDestinoNombre(evento.destino);
    const fecha = formatDateRange(evento.fechaInicio, evento.fechaFin);
    const espacioRow = espacio ? `
              <tr>
                <td style="padding:8px 0;vertical-align:top;"><span style="font-size:15px;"></span></td>
                <td style="padding:8px 0 8px 12px;">
                  <span style="display:block;font-size:12px;color:#9AA0A6;text-transform:uppercase;letter-spacing:0.5px;">Espacio / Salón</span>
                  <span style="font-size:14px;font-weight:600;color:#202124;">${espacio}</span>
                </td>
              </tr>` : '';
    const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#F0F4F8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F4F8;padding:32px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:560px;">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#1A73E8 0%,#0D47A1 100%);padding:30px 36px;text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">Universidad Tecnológica de Querétaro</p>
          <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;">Mapa UTEQ</h1>
          <p style="margin:10px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">Confirmación de registro</p>
        </td>
      </tr>

      <!-- Body -->
      <tr><td style="padding:32px 36px;">

        <h2 style="margin:0 0 6px;font-size:20px;font-weight:800;color:#202124;">¡Registro confirmado!</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#5F6368;line-height:1.6;">
          Hola <strong>${usuario.nombre}</strong>, tu lugar está reservado para el siguiente evento.
        </p>

        <!-- Nombre del evento -->
        <div style="background:#EAF1FB;border-left:4px solid #1A73E8;border-radius:0 10px 10px 0;padding:14px 18px;margin-bottom:24px;">
          <p style="margin:0;font-size:18px;font-weight:800;color:#1A73E8;">${evento.titulo}</p>
          ${evento.descripcion ? `<p style="margin:6px 0 0;font-size:13px;color:#5F6368;">${evento.descripcion}</p>` : ''}
        </div>

        <!-- Detalles -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 22px;">
            <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#9AA0A6;letter-spacing:1.5px;text-transform:uppercase;">Detalles del evento</p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;vertical-align:top;"><span style="font-size:15px;"></span></td>
                <td style="padding:8px 0 8px 12px;">
                  <span style="display:block;font-size:12px;color:#9AA0A6;text-transform:uppercase;letter-spacing:0.5px;">Fecha</span>
                  <span style="font-size:14px;font-weight:600;color:#202124;">${fecha}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;vertical-align:top;"><span style="font-size:15px;"></span></td>
                <td style="padding:8px 0 8px 12px;">
                  <span style="display:block;font-size:12px;color:#9AA0A6;text-transform:uppercase;letter-spacing:0.5px;">Horario</span>
                  <span style="font-size:14px;font-weight:600;color:#202124;">${evento.horaInicio} – ${evento.horaFin}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;vertical-align:top;"><span style="font-size:15px;"></span></td>
                <td style="padding:8px 0 8px 12px;">
                  <span style="display:block;font-size:12px;color:#9AA0A6;text-transform:uppercase;letter-spacing:0.5px;">Lugar</span>
                  <span style="font-size:14px;font-weight:600;color:#202124;">${destino}</span>
                </td>
              </tr>
              ${espacioRow}
            </table>
          </td></tr>
        </table>

        <!-- Token -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 22px;text-align:center;">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#9AA0A6;letter-spacing:1.5px;text-transform:uppercase;">Token de verificación</p>
            <p style="margin:0;font-size:12px;font-family:monospace;color:#202124;word-break:break-all;background:#E8EDF2;padding:12px 16px;border-radius:8px;">${token}</p>
            <p style="margin:10px 0 0;font-size:12px;color:#9AA0A6;">Abre UTEQ Connect y muestra tu QR en la entrada del evento</p>
          </td></tr>
        </table>

        <!-- Tips -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#E8F5E9;border-radius:12px;">
          <tr><td style="padding:18px 22px;">
            <p style="margin:0;font-size:13px;color:#2E7D32;line-height:1.8;">
              <strong> Recuerda:</strong><br/>
              • Llega 15 minutos antes del evento<br/>
              • Abre la app UTEQ Connect y muestra tu código QR en la entrada<br/>
              • Si no puedes mostrar el QR, usa el token de arriba
            </p>
          </td></tr>
        </table>

      </td></tr>

      <!-- Footer -->
      <tr>
        <td style="background:#F8FAFC;padding:20px 36px;border-top:1px solid #E8EDF2;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9AA0A6;line-height:1.6;">
            Enviado automáticamente por Mapa UTEQ<br/>
            Universidad Tecnológica de Querétaro
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
    await transporter.sendMail({
        from: `"UTEQ Connect" <${process.env.GMAIL_USER}>`,
        to: usuario.email,
        subject: `🎟️ Tu registro está confirmado: ${evento.titulo}`,
        html,
    });
};
export default transporter;
