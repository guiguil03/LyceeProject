const axios = require('axios');

const token = '1f5d7399-a97a-39b4-b82c-183965acf1ac';
const siret = '32737946700062'; // Microsoft France - SIRET réel

console.log('🔍 Test API INSEE...');
console.log('Token:', token.substring(0, 8) + '...');
console.log('SIRET:', siret);

axios.get(`https://api.insee.fr/entreprises/sirene/V3.11/siret/${siret}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
})
.then(response => {
  console.log('✅ Succès! Statut:', response.status);
  
  if (response.data?.etablissement) {
    const etab = response.data.etablissement;
    const uniteLegale = etab.uniteLegale || {};
    
    console.log('🏢 Entreprise trouvée:');
    console.log('  SIRET:', etab.siret);
    console.log('  Nom:', uniteLegale.denominationUniteLegale || etab.denominationUsuelleEtablissement);
    console.log('  Commune:', etab.libelleCommuneEtablissement);
    console.log('  Code Postal:', etab.codePostalEtablissement);
    console.log('  NAF:', etab.activitePrincipaleEtablissement);
    console.log('  État:', etab.etatAdministratifEtablissement);
    console.log('  Adresse:', etab.numeroVoieEtablissement, etab.typeVoieEtablissement, etab.libelleVoieEtablissement);
  }
})
.catch(err => {
  console.error('❌ Erreur:', err.response?.status, err.response?.statusText);
  
  if (err.response?.data) {
    console.error('Détails:', JSON.stringify(err.response.data, null, 2));
  }
  
  if (err.response?.status === 401) {
    console.error('🔑 Token invalide ou expiré');
  } else if (err.response?.status === 404) {
    console.error('📍 SIRET non trouvé dans la base');
  }
}); 