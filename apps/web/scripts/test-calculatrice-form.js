/**
 * Script para testar o formulário da calculadora diretamente via API
 */

const https = require('https');

async function testCalculatriceForm() {
  console.log('🧪 Testando envio do formulário da calculadora...\n');
  
  // Dados de teste simulando um envio do formulário
  const payload = {
    entreprise_slug: "mg-transport", // Use slug ao invés de ID
    nom: "João Cliente Teste",
    email: "joao.teste@example.com", 
    telephone: "+41123456789",
    adresse_depart: "Rue de la Gare 15, 1000 Lausanne",
    avec_ascenseur_depart: false,
    adresse_arrivee: "Avenue du Mont-Blanc 40, 1196 Gland",
    avec_ascenseur_arrivee: true,
    date_demenagement: "2025-01-20",
    observations: "Déménagement test depuis script",
    volume_total_m3: 12.5,
    meubles: [
      {
        meuble_id: "1",
        meuble_nom: "Canapé 3 places",
        meuble_categorie: "Salon", 
        quantite: 1,
        volume_unitaire_m3: 2.5,
        poids_unitaire_kg: 50
      },
      {
        meuble_id: "2", 
        meuble_nom: "Lit double",
        meuble_categorie: "Chambre",
        quantite: 1,
        volume_unitaire_m3: 3.0,
        poids_unitaire_kg: 60
      },
      {
        meuble_id: "3",
        meuble_nom: "Réfrigérateur",
        meuble_categorie: "Cuisine", 
        quantite: 1,
        volume_unitaire_m3: 2.0,
        poids_unitaire_kg: 80
      }
    ]
  };
  
  console.log('📊 Dados do teste:');
  console.log(`   Cliente: ${payload.nom} (${payload.email})`);
  console.log(`   Empresa: ${payload.entreprise_slug}`);
  console.log(`   Volume: ${payload.volume_total_m3} m³`);
  console.log(`   Móveis: ${payload.meubles.length} items`);
  console.log(`   Endereços: ${payload.adresse_depart} → ${payload.adresse_arrivee}`);
  
  // Preparar dados para envio
  const postData = JSON.stringify(payload);
  
  const options = {
    hostname: 'calculateur.moovelabs.com',
    port: 443,
    path: '/api/devis',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'Test-Script/1.0'
    }
  };
  
  console.log(`\n🚀 Enviando POST para https://${options.hostname}${options.path}...\n`);
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`📡 Status: ${res.statusCode}`);
      console.log(`📋 Headers:`, JSON.stringify(res.headers, null, 2));
      
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        console.log('\n📦 Resposta:');
        try {
          const response = JSON.parse(body);
          console.log(JSON.stringify(response, null, 2));
          
          if (res.statusCode === 200 && response.success) {
            console.log('\n✅ SUCESSO! Devis criado com ID:', response.devis_id);
            console.log('📧 Emails devem ter sido enviados em background');
          } else {
            console.log('\n❌ ERRO na API:', response.error || 'Resposta inesperada');
          }
        } catch (e) {
          console.log('📄 Resposta (raw):', body);
        }
        
        resolve(body);
      });
    });
    
    req.on('error', (err) => {
      console.error('❌ Erro de conexão:', err);
      reject(err);
    });
    
    req.on('timeout', () => {
      console.error('⏱️ Timeout da requisição');
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.setTimeout(30000); // 30 segundos
    req.write(postData);
    req.end();
  });
}

// Executar teste
testCalculatriceForm()
  .then(() => {
    console.log('\n🏁 Teste concluído');
  })
  .catch(err => {
    console.error('💥 Erro no teste:', err.message);
  });