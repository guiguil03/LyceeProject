const axios = require('axios');

const token = '1f5d7399-a97a-39b4-b82c-183965acf1ac';
const siret = '13002602400054'; // Université Paris-Saclay - SIRET de votre capture

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
  
  // Affichage de la structure complète pour debug
  console.log('\n📋 Structure complète de la réponse:');
  console.log(JSON.stringify(response.data, null, 2));
  
  if (response.data?.etablissement) {
    const etab = response.data.etablissement;
    console.log('\n🏢 Informations établissement:');
    console.log('Clés disponibles:', Object.keys(etab));
    
    if (etab.uniteLegale) {
      console.log('\n🏛️ Informations unité légale:');
      console.log('Clés disponibles:', Object.keys(etab.uniteLegale));
    }
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