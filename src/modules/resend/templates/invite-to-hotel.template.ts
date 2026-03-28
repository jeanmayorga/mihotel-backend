export function inviteToHotelTemplate(options: {
  hotelName: string;
  accountRole: string;
  magicLink: string;
}) {
  const { hotelName, accountRole, magicLink } = options;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body { 
      font-family: 'Geist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; 
      background-color: #ffffff; color: #1a1a1a; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;
    }
    .wrapper { background-color: #f9fafb; padding: 48px 20px; }
    .container { 
      max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 10px;
      border: 1px solid #e5e7eb; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .logo-table { margin: 0 auto 32px auto; width: auto; border-collapse: collapse; }
    .logo-icon-cell { vertical-align: middle; padding-right: 10px; }
    .logo-text-cell { vertical-align: middle; font-weight: 600; font-size: 20px; color: #141414; line-height: 1; }
    .logo-icon-div { background-color: #009869; color: #ffffff; border-radius: 6px; width: 28px; height: 28px; display: block; text-align: center; }
    
    h1 { font-size: 22px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 16px 0; text-align: center; }
    p { font-size: 15px; line-height: 1.6; color: #525252; text-align: center; margin: 0 0 24px 0; }
    
    .hotel-badge { 
      background-color: #f0fdf4; 
      border: 1px solid #dcfce7;
      color: #166534;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      display: inline-block;
      margin-bottom: 20px;
    }

    .button-container { text-align: center; margin: 30px 0; }
    .button { 
      display: inline-block; background-color: #009869; color: #ffffff !important; 
      text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 500; font-size: 15px;
    }
    
    .divider { height: 1px; background-color: #f4f4f5; margin: 32px 0; }
    .footer { margin-top: 32px; font-size: 12px; color: #a3a3a3; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container" style="text-align: center;">
      
      <table class="logo-table" role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td class="logo-icon-cell">
            <div class="logo-icon-div">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-top:5px;">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <line x1="19" y1="8" x2="19" y2="14"></line>
                  <line x1="22" y1="11" x2="16" y2="11"></line>
                </svg>
            </div>
          </td>
          <td class="logo-text-cell">MiHotel.app</td>
        </tr>
      </table>
      
      <h1>¡Te han invitado a unirte a como ${accountRole}!</h1>

      <div class="hotel-badge">
        🏢 ${hotelName}
      </div>
      
      <p>Haz clic en el botón de abajo para aceptar la invitación y comenzar a gestionar el hotel como ${accountRole}.</p>
      
      <div class="button-container">
        <a href="${magicLink}" class="button">Aceptar Invitación</a>
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 13px; color: #737373; margin-bottom: 0;">
        Si no esperabas esta invitación, puedes ignorar este mensaje de forma segura.
      </p>
    </div>
    <div class="footer">
      &copy; 2026 MiHotel.app — Gestión hotelera profesional.
    </div>
  </div>
</body>
</html>
  `;
}
