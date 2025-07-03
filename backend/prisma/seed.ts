import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // 1. Insertion des régions (exemples français)
  const regions = await Promise.all([
    prisma.region.upsert({
      where: { nom: 'Île-de-France' },
      update: {},
      create: { nom: 'Île-de-France' },
    }),
    prisma.region.upsert({
      where: { nom: 'Auvergne-Rhône-Alpes' },
      update: {},
      create: { nom: 'Auvergne-Rhône-Alpes' },
    }),
    prisma.region.upsert({
      where: { nom: 'Nouvelle-Aquitaine' },
      update: {},
      create: { nom: 'Nouvelle-Aquitaine' },
    }),
    prisma.region.upsert({
      where: { nom: 'Occitanie' },
      update: {},
      create: { nom: 'Occitanie' },
    }),
    prisma.region.upsert({
      where: { nom: 'Hauts-de-France' },
      update: {},
      create: { nom: 'Hauts-de-France' },
    }),
  ]);

  console.log('✅ Régions créées');

  // 2. Insertion des domaines de formation
  const domaines = await Promise.all([
    prisma.domaine.upsert({
      where: { nom: 'Informatique et numérique' },
      update: {},
      create: {
        nom: 'Informatique et numérique',
        description: 'Technologies de l\'information, développement, cybersécurité',
      },
    }),
    prisma.domaine.upsert({
      where: { nom: 'Commerce et gestion' },
      update: {},
      create: {
        nom: 'Commerce et gestion',
        description: 'Vente, marketing, gestion d\'entreprise, comptabilité',
      },
    }),
    prisma.domaine.upsert({
      where: { nom: 'Industrie et maintenance' },
      update: {},
      create: {
        nom: 'Industrie et maintenance',
        description: 'Mécanique, électronique, maintenance industrielle',
      },
    }),
    prisma.domaine.upsert({
      where: { nom: 'Bâtiment et travaux publics' },
      update: {},
      create: {
        nom: 'Bâtiment et travaux publics',
        description: 'Construction, génie civil, aménagement',
      },
    }),
    prisma.domaine.upsert({
      where: { nom: 'Hôtellerie-restauration' },
      update: {},
      create: {
        nom: 'Hôtellerie-restauration',
        description: 'Services hôteliers, cuisine, tourisme',
      },
    }),
    prisma.domaine.upsert({
      where: { nom: 'Transport et logistique' },
      update: {},
      create: {
        nom: 'Transport et logistique',
        description: 'Transport de personnes et marchandises, logistique',
      },
    }),
    prisma.domaine.upsert({
      where: { nom: 'Santé et social' },
      update: {},
      create: {
        nom: 'Santé et social',
        description: 'Soins, aide à la personne, services sociaux',
      },
    }),
    prisma.domaine.upsert({
      where: { nom: 'Agriculture et environnement' },
      update: {},
      create: {
        nom: 'Agriculture et environnement',
        description: 'Agriculture, horticulture, environnement',
      },
    }),
    prisma.domaine.upsert({
      where: { nom: 'Arts et communication' },
      update: {},
      create: {
        nom: 'Arts et communication',
        description: 'Arts appliqués, communication, audiovisuel',
      },
    }),
    prisma.domaine.upsert({
      where: { nom: 'Sécurité' },
      update: {},
      create: {
        nom: 'Sécurité',
        description: 'Sécurité publique et privée, prévention des risques',
      },
    }),
  ]);

  console.log('✅ Domaines créés');

  // 3. Insertion des métiers par domaine
  const informatique = domaines.find(d => d.nom === 'Informatique et numérique')!;
  const commerce = domaines.find(d => d.nom === 'Commerce et gestion')!;
  const industrie = domaines.find(d => d.nom === 'Industrie et maintenance')!;
  const batiment = domaines.find(d => d.nom === 'Bâtiment et travaux publics')!;
  const hotellerie = domaines.find(d => d.nom === 'Hôtellerie-restauration')!;
  const transport = domaines.find(d => d.nom === 'Transport et logistique')!;
  const sante = domaines.find(d => d.nom === 'Santé et social')!;
  const securite = domaines.find(d => d.nom === 'Sécurité')!;

  const metiers = await Promise.all([
    // Informatique
    prisma.metier.create({
      data: { nom: 'Développeur web', domaineId: informatique.id },
    }),
    prisma.metier.create({
      data: { nom: 'Technicien réseau', domaineId: informatique.id },
    }),
    prisma.metier.create({
      data: { nom: 'Administrateur système', domaineId: informatique.id },
    }),
    
    // Commerce
    prisma.metier.create({
      data: { nom: 'Vendeur', domaineId: commerce.id },
    }),
    prisma.metier.create({
      data: { nom: 'Commercial', domaineId: commerce.id },
    }),
    prisma.metier.create({
      data: { nom: 'Comptable', domaineId: commerce.id },
    }),
    
    // Industrie
    prisma.metier.create({
      data: { nom: 'Mécanicien industriel', domaineId: industrie.id },
    }),
    prisma.metier.create({
      data: { nom: 'Électricien', domaineId: industrie.id },
    }),
    
    // Bâtiment
    prisma.metier.create({
      data: { nom: 'Maçon', domaineId: batiment.id },
    }),
    prisma.metier.create({
      data: { nom: 'Plombier', domaineId: batiment.id },
    }),
    
    // Hôtellerie
    prisma.metier.create({
      data: { nom: 'Cuisinier', domaineId: hotellerie.id },
    }),
    prisma.metier.create({
      data: { nom: 'Serveur', domaineId: hotellerie.id },
    }),
    
    // Transport
    prisma.metier.create({
      data: { nom: 'Chauffeur', domaineId: transport.id },
    }),
    prisma.metier.create({
      data: { nom: 'Logisticien', domaineId: transport.id },
    }),
    
    // Santé
    prisma.metier.create({
      data: { nom: 'Aide-soignant', domaineId: sante.id },
    }),
    prisma.metier.create({
      data: { nom: 'Assistant social', domaineId: sante.id },
    }),
    
    // Sécurité
    prisma.metier.create({
      data: { nom: 'Agent de sécurité', domaineId: securite.id },
    }),
  ]);

  console.log('✅ Métiers créés');

  // 4. Création d'un utilisateur administrateur par défaut
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@lyceeproject.fr' },
    update: {},
    create: {
      email: 'admin@lyceeproject.fr',
      passwordHash: hashedPassword,
      role: 'SUPER_ADMIN',
      fullName: 'Administrateur Système',
    },
  });

  console.log('✅ Utilisateur admin créé');

  // 5. Exemple de lycée (optionnel pour les tests)
  const lyceeExample = await prisma.lycee.create({
    data: {
      nom: 'Lycée Professionnel Test',
      adresse: '123 Rue de la Formation, 75001 Paris',
      commune: 'Paris',
      departement: 'Paris',
      regionId: regions[0].id, // Île-de-France
      email: 'contact@lycee-test.fr',
      telephone: '01 23 45 67 89',
      description: 'Lycée de test pour la démonstration',
    },
  });

  // 6. Exemple d'entreprise (optionnel pour les tests)
  const entrepriseExample = await prisma.entreprise.create({
    data: {
      nom: 'Entreprise Test SARL',
      siret: '12345678901234',
      secteurActivite: 'Services informatiques',
      adresse: '456 Avenue du Commerce, 75002 Paris',
      commune: 'Paris',
      departement: 'Paris',
      email: 'contact@entreprise-test.fr',
      telephone: '01 98 76 54 32',
    },
  });

  console.log('✅ Données d\'exemple créées');
  console.log('🌱 Seeding terminé avec succès !');
  
  console.log('\n📊 Résumé :');
  console.log(`- ${regions.length} régions`);
  console.log(`- ${domaines.length} domaines`);
  console.log(`- ${metiers.length} métiers`);
  console.log(`- 1 utilisateur admin (email: admin@lyceeproject.fr, mot de passe: admin123)`);
  console.log(`- 1 lycée d'exemple`);
  console.log(`- 1 entreprise d'exemple`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 