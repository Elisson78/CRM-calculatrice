
import { Resend } from 'resend';

// Configuration de Resend
const resend = new Resend(process.env.RESEND_API_KEY);

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
    
    <p>Nous vous contacterons dans les plus brefs délais pour vous proposer un devis personnalisé.</p>
    
    <p style="margin-bottom: 0;">Cordialement,<br><strong>L'équipe MooveLabs</strong></p>
  </div>
</body>
</html>
`;
}
