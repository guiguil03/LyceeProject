const axios = require('axios');

async function testInseeAPI() {
  const token = '1f5d7399-a97a-39b4-b82c-183965acf1ac';
  const siret = '42014814800016'; // Air France
  
  console.log('🔍 Test API INSEE avec votre token...');
  console.log('🔑 Token:', token.substring(0, 8) + '...');
  console.log('📋 SIRET test:', siret);
  
  try {
    const response = await axios.get(`https://api.insee.fr/entreprises/sirene/V3.11/siret/${siret}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'User-Agent': 'LyceeProject/1.0'
      },
      timeout: 10000
    });
    
    console.log('✅ SUCCÈS! API INSEE accessible');
    console.log('📡 Statut:', response.status);
    
    if (response.data && response.data.etablissement) {
      const etab = response.data.etablissement;
      const uniteLegale = etab.uniteLegale || {};
      
      console.log('🏢 Entreprise trouvée:');
      console.log('  - SIRET:', etab.siret);
      console.log('  - Nom:', uniteLegale.denominationUniteLegale || etab.denominationUsuelleEtablissement);
      console.log('  - Commune:', etab.libelleCommuneEtablissement);
      console.log('  - Code NAF:', etab.activitePrincipaleEtablissement);
      console.log('  - État:', etab.etatAdministratifEtablissement);
      console.log('  - Adresse:', etab.numeroVoieEtablissement, etab.typeVoieEtablissement, etab.libelleVoieEtablissement);
      console.log('  - CP:', etab.codePostalEtablissement);
    }
    
  } catch (error) {
    console.error('❌ ERREUR API INSEE:');
    
    if (error.response) {
      console.error('📡 Statut HTTP:', error.response.status);
      console.error('📄 Message:', error.response.statusText);
      console.error('📋 Données:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.error('🔑 PROBLÈME: Token d\'authentification invalide ou expiré');
        console.error('💡 Solutions:');
        console.error('   1. Vérifiez que votre token est correct');
        console.error('   2. Connectez-vous sur api.insee.fr pour renouveler');
        console.error('   3. Vérifiez que vous avez accès à l\'API SIRENE');
      } else if (error.response.status === 404) {
        console.error('📍 SIRET non trouvé dans la base SIRENE');
      } else if (error.response.status === 429) {
        console.error('⏰ Limite de requêtes atteinte');
      }
    } else if (error.request) {
      console.error('🌐 Problème réseau - impossible de joindre l\'API');
      console.error('💡 Vérifiez votre connexion internet');
    } else {
      console.error('⚠️ Erreur:', error.message);
    }
  }
}

// Test aussi avec d'autres SIRETs
async function testMultipleSirets() {
  const sirets = [
    '42014814800016', // Air France
    '32737946700062', // Microsoft France  
    '44323564400036', // Google France
    '77562556227195'  // Renault
  ];
  
  console.log('\n🔬 Test de plusieurs SIRETs...\n');
  
  for (const siret of sirets) {
    console.log(`\n--- Test SIRET: ${siret} ---`);
    await testSingleSiret(siret);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pause 1s entre les appels
  }
}

async function testSingleSiret(siret) {
  const token = '1f5d7399-a97a-39b4-b82c-183965acf1ac';
  
  try {
    const response = await axios.get(`https://api.insee.fr/entreprises/sirene/V3.11/siret/${siret}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      timeout: 5000
    });
    
    if (response.data && response.data.etablissement) {
      const etab = response.data.etablissement;
      const uniteLegale = etab.uniteLegale || {};
      console.log('✅', uniteLegale.denominationUniteLegale || etab.denominationUsuelleEtablissement);
    } else {
      console.log('❌ Pas de données');
    }
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ Erreur ${error.response.status}: ${error.response.statusText}`);
    } else {
      console.log('❌ Erreur réseau');
    }
  }
}

// Lancement des tests
console.log('🚀 Démarrage du test API INSEE SIRENE\n');
testInseeAPI().then(() => {
  return testMultipleSirets();
}).then(() => {
  console.log('\n✅ Tests terminés');
}).catch(err => {
  console.error('\n❌ Erreur globale:', err.message);
});
