/**
 * Teste simples da API devis
 */

const https = require('https');

const payload = {
  entreprise_slug: "mg-transport",
  nom: "João Cliente Real",
  email: "joao@example.com",
  telephone: "+41123456789", 
  adresse_depart: "Rue de la Gare 15, 1000 Lausanne",
  adresse_arrivee: "Avenue du Mont-Blanc 40, 1196 Gland",
  avec_ascenseur_depart: false,
  avec_ascenseur_arrivee: true,
  date_demenagement: "2025-01-20",
  observations: "Test depuis script após correção",
  volume_total_m3: 1.3, // 0.7 + (0.3 * 2)
  meubles: [
    {
      meuble_id: "4a2ebb27-27bd-4cdc-ba40-b8ea39c1c6a6",
      meuble_nom: "Carton penderie",
      meuble_categorie: "carton",
      quantite: 1,
      volume_unitaire_m3: 0.7,
      poids_unitaire_kg: 10
    },
    {
      meuble_id: "2091200c-27c6-436f-8ef9-6192ec900498",
      meuble_nom: "Carton standard", 
      meuble_categorie: "carton",
      quantite: 2,
      volume_unitaire_m3: 0.3,
      poids_unitaire_kg: 10
    }
  ]
};

const postData = JSON.stringify(payload);

const options = {
  hostname: 'calculateur.moovelabs.com',
  port: 443,
  path: '/api/devis',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testando com UUIDs corretos e móveis reais...');

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Response:', body);
  });
});

req.on('error', err => console.error('Error:', err));
req.write(postData);
req.end();