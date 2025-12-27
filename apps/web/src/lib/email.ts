import nodemailer from 'nodemailer';

interface DevisEmailData {
  clientNom: string;
  clientEmail: string;
  clientTelephone?: string;
  adresseDepart: string;
  adresseArrivee: string;
  dateDemenagement?: string;
  volumeTotal: number;
  nombreMeubles: number;
  meubles: Array<{
    nom: string;
    categorie: string;
    quantite: number;
    volume: number;
  }>;
  entreprise: {
    nom: string;
    email: string;
    telephone?: string;
    logoUrl?: string;
    smtp_host?: string;
    smtp_port?: number;
    smtp_user?: string;
    smtp_password?: string;
    smtp_secure?: boolean;
    use_custom_smtp?: boolean;
    additionalEmails?: string[];
  };
}

// Template email pour le client
function getClientEmailTemplate(data: DevisEmailData): string {
  const meublesHTML = data.meubles
    .map(m => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${m.nom}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${m.quantite}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${m.volume.toFixed(2)} m³</td>
      </tr>
    `)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Votre demande de devis</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Demande de devis envoyée ✓</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="margin-top: 0;">Bonjour <strong>${data.clientNom}</strong>,</p>
    
    <p>Votre demande de devis a bien été envoyée à <strong>${data.entreprise.nom}</strong>. Voici le récapitulatif de votre demande :</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <h2 style="margin-top: 0; font-size: 18px; color: #1e3a5f;">📍 Adresses</h2>
      <p style="margin: 5px 0;"><strong>Départ:</strong> ${data.adresseDepart}</p>
      <p style="margin: 5px 0;"><strong>Arrivée:</strong> ${data.adresseArrivee}</p>
      ${data.dateDemenagement ? `<p style="margin: 5px 0;"><strong>Date souhaitée:</strong> ${data.dateDemenagement}</p>` : ''}
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <h2 style="margin-top: 0; font-size: 18px; color: #1e3a5f;">📦 Volume estimé</h2>
      <table style="width: 100%;">
        <tr>
          <td style="text-align: center; padding: 10px;">
            <p style="font-size: 36px; font-weight: bold; color: #2563eb; margin: 10px 0;">${data.volumeTotal.toFixed(1)}</p>
            <p style="color: #666; margin: 0;">m³</p>
          </td>
          <td style="text-align: center; padding: 10px;">
            <p style="font-size: 36px; font-weight: bold; color: #1e3a5f; margin: 10px 0;">${data.nombreMeubles}</p>
            <p style="color: #666; margin: 0;">meubles</p>
          </td>
        </tr>
      </table>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <h2 style="margin-top: 0; font-size: 18px; color: #1e3a5f;">🛋️ Liste des meubles</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Meuble</th>
            <th style="padding: 10px 8px; text-align: center; font-weight: 600;">Qté</th>
            <th style="padding: 10px 8px; text-align: right; font-weight: 600;">Volume</th>
          </tr>
        </thead>
        <tbody>
          ${meublesHTML}
        </tbody>
        <tfoot>
          <tr style="background: #1e3a5f; color: white;">
            <td style="padding: 12px 8px; font-weight: bold;">Total</td>
            <td style="padding: 12px 8px; text-align: center; font-weight: bold;">${data.nombreMeubles}</td>
            <td style="padding: 12px 8px; text-align: right; font-weight: bold;">${data.volumeTotal.toFixed(2)} m³</td>
          </tr>
        </tfoot>
      </table>
    </div>
    
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; color: #92400e;">
        <strong>${data.entreprise.nom}</strong> va vous contacter prochainement pour vous proposer un devis personnalisé.
      </p>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #9ca3af; margin-bottom: 0;">
      Ce message a été envoyé automatiquement suite à votre demande de devis.<br>
      © ${new Date().getFullYear()} ${data.entreprise.nom}
    </p>
  </div>
</body>
</html>
  `;
}

// Template email pour l'entreprise
function getEntrepriseEmailTemplate(data: DevisEmailData): string {
  const meublesHTML = data.meubles
    .map(m => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${m.categorie}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${m.nom}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${m.quantite}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${m.volume.toFixed(2)} m³</td>
      </tr>
    `)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nouvelle demande de devis</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #dc2626 0%, #f97316 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🔔 Nouvelle demande de devis!</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="margin-top: 0; font-size: 18px;">
      Un nouveau client a effectué une demande de devis via votre calculatrice.
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <h2 style="margin-top: 0; font-size: 18px; color: #1e3a5f;">👤 Informations client</h2>
      <p style="margin: 5px 0;"><strong>Nom:</strong> ${data.clientNom}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${data.clientEmail}">${data.clientEmail}</a></p>
      ${data.clientTelephone ? `<p style="margin: 5px 0;"><strong>Téléphone:</strong> <a href="tel:${data.clientTelephone}">${data.clientTelephone}</a></p>` : ''}
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <h2 style="margin-top: 0; font-size: 18px; color: #1e3a5f;">📍 Déménagement</h2>
      <p style="margin: 5px 0;"><strong>Départ:</strong> ${data.adresseDepart}</p>
      <p style="margin: 5px 0;"><strong>Arrivée:</strong> ${data.adresseArrivee}</p>
      ${data.dateDemenagement ? `<p style="margin: 5px 0;"><strong>Date souhaitée:</strong> ${data.dateDemenagement}</p>` : ''}
    </div>
    
    <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #93c5fd;">
      <h2 style="margin-top: 0; font-size: 18px; color: #1e3a5f;">📦 Volume estimé</h2>
      <table style="width: 100%;">
        <tr>
          <td style="text-align: center; padding: 10px;">
            <p style="font-size: 48px; font-weight: bold; color: #2563eb; margin: 10px 0;">${data.volumeTotal.toFixed(1)}</p>
            <p style="color: #1e3a5f; margin: 0; font-weight: 600;">m³</p>
          </td>
          <td style="text-align: center; padding: 10px;">
            <p style="font-size: 48px; font-weight: bold; color: #1e3a5f; margin: 10px 0;">${data.nombreMeubles}</p>
            <p style="color: #1e3a5f; margin: 0; font-weight: 600;">meubles</p>
          </td>
        </tr>
      </table>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <h2 style="margin-top: 0; font-size: 18px; color: #1e3a5f;">🛋️ Détail des meubles</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Catégorie</th>
            <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Meuble</th>
            <th style="padding: 10px 8px; text-align: center; font-weight: 600;">Qté</th>
            <th style="padding: 10px 8px; text-align: right; font-weight: 600;">Volume</th>
          </tr>
        </thead>
        <tbody>
          ${meublesHTML}
        </tbody>
        <tfoot>
          <tr style="background: #1e3a5f; color: white;">
            <td colspan="2" style="padding: 12px 8px; font-weight: bold;">Total</td>
            <td style="padding: 12px 8px; text-align: center; font-weight: bold;">${data.nombreMeubles}</td>
            <td style="padding: 12px 8px; text-align: right; font-weight: bold;">${data.volumeTotal.toFixed(2)} m³</td>
          </tr>
        </tfoot>
      </table>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #9ca3af; margin-bottom: 0;">
      © ${new Date().getFullYear()} Moovelabs - CRM Déménagement
    </p>
  </div>
</body>
</html>
  `;
}

// Fonction pour créer le transporter email
function createTransporter(data: DevisEmailData) {
  // Si l'entreprise utilise un SMTP personnalisé
  if (data.entreprise.use_custom_smtp && data.entreprise.smtp_host && data.entreprise.smtp_user) {
    console.log('🔧 Configuration SMTP personnalisée:');
    console.log(`   - Host: ${data.entreprise.smtp_host}`);
    console.log(`   - Port: ${data.entreprise.smtp_port || 587}`);
    console.log(`   - User: ${data.entreprise.smtp_user}`);
    console.log(`   - Secure: ${data.entreprise.smtp_secure !== false}`);

    return nodemailer.createTransport({
      host: data.entreprise.smtp_host,
      port: data.entreprise.smtp_port || 587,
      secure: data.entreprise.smtp_port === 465, // true apenas para porta 465, false para 587
      auth: {
        user: data.entreprise.smtp_user,
        pass: data.entreprise.smtp_password,
      },
      // Configurações adicionais para Hostinger
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    });
  }

  console.log('🔧 Configuration email par défaut (Gmail Moovelabs)');

  // Configuration par défaut (Gmail de Moovelabs)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// Fonction d'envoi d'email
export async function sendDevisEmails(data: DevisEmailData): Promise<{
  clientSent: boolean;
  entrepriseSent: boolean;
  error?: string;
}> {
  const result = {
    clientSent: false,
    entrepriseSent: false,
    error: undefined as string | undefined,
  };

  try {
    console.log('📧 Début envoi emails - Configuration:');
    console.log(`   - Entreprise: ${data.entreprise.nom}`);
    console.log(`   - Use custom SMTP: ${data.entreprise.use_custom_smtp}`);
    console.log(`   - SMTP Host: ${data.entreprise.smtp_host || 'non configuré'}`);
    console.log(`   - SMTP User: ${data.entreprise.smtp_user || 'non configuré'}`);

    const transporter = createTransporter(data);

    // Déterminer l'adresse d'envoi
    const fromEmail = data.entreprise.use_custom_smtp && data.entreprise.smtp_user
      ? data.entreprise.smtp_user
      : process.env.EMAIL_USER;

    if (!fromEmail) {
      result.error = 'Configuration email manquante';
      return result;
    }

    try {
      // Email au client
      await transporter.sendMail({
        from: `"${data.entreprise.nom}" <${fromEmail}>`,
        to: data.clientEmail,
        subject: `✅ Votre demande de devis - ${data.entreprise.nom}`,
        html: getClientEmailTemplate(data),
      });
      result.clientSent = true;
      console.log(`📧 Email envoyé au client: ${data.clientEmail} via ${fromEmail}`);
    } catch (error) {
      console.error('❌ Erreur envoi email client:', error);
    }

    try {
      // Déterminer l'email de destination de l'entreprise
      const entrepriseDestEmail = data.entreprise.use_custom_smtp && data.entreprise.smtp_user
        ? data.entreprise.smtp_user  // Usar email SMTP se configurado
        : data.entreprise.email;     // Senão usar email padrão da empresa

      console.log(`📧 Tentativa de envio para empresa: ${entrepriseDestEmail}`);

      // Email à l'entreprise
      await transporter.sendMail({
        from: `"${data.entreprise.nom}" <${fromEmail}>`,
        to: entrepriseDestEmail,
        cc: data.entreprise.additionalEmails,
        subject: `🔔 Nouvelle demande de devis - ${data.clientNom} (${data.volumeTotal.toFixed(1)} m³)`,
        html: getEntrepriseEmailTemplate(data),
      });
      result.entrepriseSent = true;
      console.log(`✅ Email envoyé à l'entreprise: ${entrepriseDestEmail} via ${fromEmail}`);
    } catch (error) {
      console.error('❌ Erreur envoi email entreprise:', error);
      if (error instanceof Error) {
        console.error('❌ Détails de l\'erreur:', error.message);
        console.error('❌ Code d\'erreur:', (error as any).code);
        console.error('❌ Commande:', (error as any).command);
        console.error('❌ Response:', (error as any).response);
        console.error('❌ ResponseCode:', (error as any).responseCode);
      }
    }

  } catch (error) {
    console.error('❌ Erreur configuration transporter:', error);
    result.error = 'Erreur de configuration email';
  }

  return result;
}

// Export des templates pour preview
export { getClientEmailTemplate, getEntrepriseEmailTemplate };
export type { DevisEmailData };
